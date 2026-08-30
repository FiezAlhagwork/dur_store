@AGENTS.md

# Clerk Authentication — Dur Store (custom, passwordless)

This overrides any generic "Add Clerk Authentication to Next.js" setup skill/instinct for this repository. Clerk is already fully configured here with a custom, non-default flow. Read this whole file before touching any auth-related code.

## Read this first

- **Do not run `clerk init` / `npx clerk@latest init` / `clerk doctor` setup flows on this project.** Those scaffold Clerk's default experience (email + password + first/last name, prebuilt `<SignIn/>`, `<SignUp/>`, `SignInButton`, `SignUpButton`, `UserButton`). None of that exists here on purpose — introducing it would create a second, conflicting auth system.
- `AGENTS.md` (included above) documents Next.js 16 breaking changes relevant here — most importantly that `middleware.ts` is renamed `proxy.ts`.

## What "our" auth actually is — do not deviate

- **No passwords, anywhere, ever.** Exactly two sign-in methods: **Google OAuth** and **email OTP** (a numeric code sent to the inbox, no password/name fields at sign-up).
  - This imposes a hard **Clerk Dashboard prerequisite**: under *User & authentication*, Password / Name / Username / legal-acceptance must be **disabled or optional**. Verifying the emailed code is not enough to complete a sign-up on its own — if Clerk still requires an attribute this flow never collects, `signUp.status` stays `'missing_requirements'`, no session is created, and `finalize()` fails with the opaque *"Cannot finalize sign-up without a created session"*. A fresh Clerk instance has Password enabled by default, which alone triggers this. `finalizeAuth()` in `lib/auth/orchestration.ts` guards against it and logs exactly which fields are still outstanding.
- **One flow, two headlines.** `login` and `register` are the same underlying flow; they only differ in page copy. Both render `<AuthFlow mode="login" | "register" />`. There is no separate route per step — "choose method → enter email → enter code" is internal state inside `AuthFlow`, not separate pages.
- Email flow uses Clerk's Signal/"Future" API (this SDK version — `@clerk/nextjs@7.8.0+` — exposes `useSignIn`/`useSignUp` as the Future API, not the classic Promise-based one). The combined sign-in-or-sign-up logic (`lib/auth/orchestration.ts`):
  - **On the login page:** call `signIn.create({ identifier: email })` first. If `signIn.isTransferable === true` (no account exists yet), call `signUp.create({ transfer: true })`, which carries the verified email over and completes sign-up.
  - **On the register page:** call `signUp.create(...)` first. If `signUp.isTransferable === true` (an account already exists), call `signIn.create({ transfer: true })` instead.
  - **Do not re-introduce a manual "catch `form_identifier_not_found`" fallback pattern** — `isTransferable` already replaces that.
- **Code-state handling:** use `verification.status` directly (`'failed'` vs `'expired'`) to distinguish a wrong code from an expired one. Do not guess or map Clerk error codes for this — there is intentionally no separate `clerk-errors.ts` file; this logic lives inline in `lib/auth/orchestration.ts`.
- **Navigate by outcome, not by page.** After a successful verification, the destination depends on which flow actually completed — not which page (login/register) the user started on, because either page can transfer into the other:
  - Completed as **signIn** (existing account) → `/redirect-after-login` (role check against Laravel, per the "role is only ever checked on login" rule).
  - Completed as **signUp** (brand-new account, via transfer) → straight to `/`, no role check (new accounts are always `customer`).
- **The `<div id="clerk-captcha" />` in `AuthFlow.tsx` is load-bearing — do not delete it.** It looks like an empty div, but Clerk's Smart CAPTCHA (bot sign-up protection) renders into it, and it must already be in the DOM by the time `signUp.create()` is called. It stays mounted across *all* steps rather than living inside the email step, because `signUp.create()` is reached from both pages: register calls it directly, login reaches it via the `transfer: true` path. If it's missing, Clerk logs "Cannot initialize Smart CAPTCHA widget…" and silently falls back to **Invisible CAPTCHA**, which blocks suspected bots outright instead of letting a false-positive human prove otherwise. **It must also never be `display: none`.** Clerk renders Cloudflare Turnstile into it, and Turnstile cannot lay itself out inside a hidden element — hiding the empty placeholder (an `empty:hidden` class was tried) makes sign-up hang for several seconds before the challenge appears, while sign-in stays fast because bot protection only runs on sign-up. The div therefore sits *outside* the step container's `flex … gap-6`, so an empty placeholder costs no gap slot without being hidden.
- **Already-signed-in guard is required.** If a visitor with an active session opens `/login` or `/register`, `AuthFlow` redirects them away (to `/redirect-after-login`) instead of rendering the form. This matches Clerk's own built-in behavior for `<SignIn/>`/`<SignUp/>` — do not skip it, and do not let the user hit Clerk's raw "You're already signed in" (`session_exists`) error in the console.

## Architecture

```
Next.js (Clerk)  --JWT (Clerk JWT Template "laravel")-->  Laravel API
                                                            ↳ validates via Clerk JWKS endpoint
Clerk  --webhook: user.created-->  Laravel  --creates row-->  users table (role: "customer")
```

- Every request from Next.js to Laravel carries the Clerk-issued JWT (JWT Template `laravel`) as a Bearer token.
- Laravel validates the token itself via Clerk's JWKS endpoint — no round-trip to Clerk needed per request.
- There is no manual account-linking step, anywhere. The webhook is the only thing that ever creates a user row.

## Roles

- Every account starts as `customer`. There is no self-signup path to `admin`.
- To make someone an admin: they sign up normally through Clerk (Google or email code), the webhook creates their row as `customer`, and the `role` is changed to `admin` **directly in the database**, manually, after the fact.
- The app only ever *reads* `role` after login — it never decides or sets it.
- Duplicate/collision emails are handled entirely by Clerk's own transfer mechanism (`isTransferable` / `{ transfer: true }`), for both Google and email-code methods. No bespoke app logic needed beyond what's in `lib/auth/orchestration.ts`.

## Route protection

- `proxy.ts` (project root, **not** `middleware.ts` — Next.js 16+) runs `clerkMiddleware()` for session propagation **only**. It does not gate any routes.
- `createRouteMatcher()` + `auth.protect()` centralized in `proxy.ts` is a **deprecated Clerk pattern** — do not reintroduce it. Clerk's current guidance is resource-based checks: protection lives next to what it protects.
- Admin routes (`app/[locale]/(admin)/*`, e.g. `/dashboard`) are guarded in `app/[locale]/(admin)/layout.tsx` via `auth()` directly (`await auth()`, redirect if no `userId`). **`auth()` is async — always `await` it.**
- That layout only checks "is there a session" — it does not re-verify `role` against Laravel on every admin page load (role was already checked once, right after auth, by `/redirect-after-login`). A signed-in `customer` navigating straight to `/dashboard` is not currently redirected away by role; only flag/fix this if asked.

## `/redirect-after-login` page

Exactly 3 states, no others:

1. **Loading** — fetching role from Laravel.
2. **Success** — redirect based on `role` (`admin` → admin dashboard, `customer` → home or intended page). No dedicated UI — it's a transient redirect.
3. **Error** (after retries exhausted) — static error screen with a "try again" button.

### Failure handling rules
- **401 (invalid/expired token):** redirect back to sign-in automatically, no retry.
- **Any other failure** (500, timeout, network error, server down): **1–2 automatic retries** with a short delay (~500ms) before falling back to the error screen.
- **Never assume a default role on failure.** Do not fall back to `customer` "just to let them browse." A wrong guess here is worse than blocking — an admin could get stuck on the wrong view, or the reverse.
- The error screen must not attempt any redirect on its own — the user explicitly retries.

Implemented in `app/[locale]/redirect-after-login/page.tsx`, backed by `hooks/useCurrentUser.ts` (the retry policy above via `useQuery`) and `services/user.ts` (the actual fetch call).

## Laravel must allow this app's origin (`azp`) — known failure mode

Clerk stamps every session token with an **`azp`** claim: the origin that requested it (e.g. `http://localhost:3000` in dev). Laravel validates that claim against an authorized-parties allowlist, and **rejects any token whose origin is not listed**.

This was diagnosed from a real failure: `GET /api/user` returned **500** with the generic body `{"message":"A server error occurred."}`. Comparing the JWT claims against a token from another app on the same Clerk instance showed everything identical — same `sub`, same `sid`, same `iss`, same `v: 2` — differing only in `azp` (`http://localhost:3000` vs the working `http://localhost:5173`). Serving this app from the allowlisted origin made the exact same code succeed, which confirmed it.

**What Laravel's owner has to do** (this is not fixable from this repo):
- Add every origin this app is served from to the authorized-parties list — `http://localhost:3000` for local dev, plus the production domain.
- Return **401** for an unlisted `azp` rather than 500. A generic 500 hides the cause completely and sends debugging in the wrong direction; the unhandled exception in the validation path should be caught.

Do **not** work around this by changing this app's dev port to match the allowlist — the fix belongs in Laravel.

`hooks/useCurrentUser.ts` logs `azp` and `sub` in development for exactly this reason. If `/api/user` starts failing again after a deploy or a port change, check that line first.

## Production deploy: `next start -H` must be `localhost`, never an IP — solved failure mode

**Symptom:** every page (not just admin ones) returns Internal Server Error, with the server log repeating:

```
Failed to proxy https://localhost:3000/ Error: write EPROTO ... wrong version number
```

**Cause — an origin string comparison, not a network problem.** Two independent pieces of machinery each build the app's own URL, and both ignore the `Host` header:

- **Clerk** rewrites *every* request to itself as an absolute URL, in order to attach its auth headers — a plain `NextResponse.next()` becomes `x-middleware-rewrite: <absolute req.url>` (`decorateRequest`, `@clerk/nextjs/dist/esm/server/utils.js`). That URL uses the host **`localhost`**.
- **Next** computes its own origin as `` `${protocol}://${opts.hostname || 'localhost'}:${port}` `` (`resolve-routes.js`), where `opts.hostname` is whatever `next start -H` was given. `protocol` comes from `X-Forwarded-Proto`.

Next then relativizes the rewrite against that origin. Same origin → internal, fine. **Different origin → Next treats it as an external destination and proxies to it.** With `-H 127.0.0.1` the comparison is `https://localhost:3000` vs `https://127.0.0.1:3000` — the same machine, different *text* — so Next opens a TLS connection to this very server, which speaks plain HTTP. Hence `EPROTO`.

**The fix is `-H localhost` in `ecosystem.config.cjs`** (both sides then agree on the string). The file is tracked in this repo precisely so this cannot silently drift again.

**`NODE_OPTIONS=--dns-result-order=ipv4first` is load-bearing because of this**, and must not be removed: `-H localhost` goes through DNS, `localhost` often resolves to `::1` first, and binding to IPv6 loopback alone makes the app unreachable from nginx, whose upstream is `server 127.0.0.1:3000`. Verified on the host: without the flag `-H localhost` binds `[::1]:3000`; with it, `127.0.0.1:3000`.

**nginx is not involved and was ruled out** — `proxy_set_header Host $host` and `X-Forwarded-Proto $scheme` are both correctly set. Do not "fix" this in nginx.

### Testing this class of bug

An isolated copy on another port reproduces it **only if the request carries what nginx really sends**. A plain `curl http://127.0.0.1:3001/` passes even while production is broken, because without `X-Forwarded-Proto: https` the protocol resolves to `http` and no TLS is attempted. That false negative is what originally led to the passthrough-proxy workaround below. Always test with:

```bash
curl -s -o /dev/null -w "%{http_code}\n" \
  -H "Host: durjewels.com" -H "X-Forwarded-Proto: https" \
  http://127.0.0.1:<port>/ar
```

### Historical note — the passthrough `proxy.ts` overlay (removed)

`deploy.sh` used to copy `/var/www/dur-overlays/dur-store-proxy.ts` over `proxy.ts` on every deploy, replacing `clerkMiddleware()` with a no-op passthrough. It was a workaround for the hang/failure described above, added before the cause was known. Its side effect was that `clerkMiddleware()` never ran in production at all, so `auth()` in `app/[locale]/(admin)/layout.tsx` always threw *"Clerk can't detect usage of clerkMiddleware()"* and `/dashboard` was permanently broken. **Do not reintroduce it.** `proxy.ts` in git has always been correct.

## Bot sign-up protection is currently OFF — turn it back on before production

**Current state:** *Bot sign-up protection* is **disabled** in the Clerk Dashboard (*Protect → Rules*). It was turned off to unblock local development and **must be re-enabled before the app goes to production** — sign-up is otherwise unprotected against automated account creation.

**Why it was turned off.** On `localhost`, sign-up hung and then failed with Clerk's *"The CAPTCHA failed to load. This may be due to an unsupported browser or a browser extension."* The console showed the real cause:

```
[Cloudflare Turnstile] Error: 300010
```

`300010` is Cloudflare's **generic challenge-failure** verdict — its heuristics decided the visitor looked like a bot. It is widely reported on local development domains. Two facts pin it down:

- `api.js?render=explicit` **loaded successfully**, so it was neither a network failure nor an extension blocking `challenges.cloudflare.com`.
- The code is only ever produced *after* the widget has rendered and run, so no DOM or CSS problem can cause it. This is the opposite of the `empty:hidden` bug above, which stalled the widget *before* it could render and produced a different symptom entirely.

The accompanying `Failed to execute 'postMessage' … target origin` error is normal noise alongside a failed challenge, not a separate bug.

**Expect it to work again on the production domain** — the heuristic that fires here is tied to `localhost`. If `300010` shows up there too, it is a Cloudflare/Clerk matter, not something to patch around in this repo.

### Layout constraint around `#clerk-captcha`

No ancestor of `#clerk-captcha` — anywhere along `app/[locale]/(auth)/layout.tsx` → `AuthCard` → `AuthFlow` — may carry `overflow-hidden` or `backdrop-filter` / `backdrop-blur-*` / `backdrop-saturate-*`. When clipping is needed for a visual effect, put it on a **sibling** of the content column instead: `app/[locale]/(auth)/layout.tsx` clips its decorative ornaments with an `absolute inset-0 overflow-hidden` layer that sits *next to* the card, not around it. `AuthCard`'s panel therefore also has no backdrop blur, unlike the visually similar card in `ContactCTA`.

To be precise about what is proven: this constraint did **not** turn out to be the cause of `300010`, and removing those properties did not fix it. It is a deliberate precaution — `backdrop-filter` creates a containing block and a stacking context around a third-party iframe, which is exactly the kind of thing that made the earlier `empty:hidden` bug so slow to diagnose. Keep it.

## Endpoints used

| Endpoint | Method | Auth | Success | Failure |
|---|---|---|---|---|
| `/api/user` | GET | Bearer JWT (Clerk, template `laravel`) | `200` — returns `{ id, clerk_id, role, name, email, email_verified_at, created_at, updated_at }` | `401` — not authenticated |

Example success response:
```json
{
  "id": 1,
  "clerk_id": "user_3IBDawRwaeYSEnM6ORISX3QhGo4",
  "role": "admin",
  "name": "Fiez Alhag",
  "email": "fiezalhag@gmail.com",
  "email_verified_at": null,
  "created_at": "2026-08-20T12:55:26.000000Z",
  "updated_at": "2026-08-20T12:55:26.000000Z"
}
```

## Files that already exist — extend, don't duplicate or overwrite

- `proxy.ts` — `clerkMiddleware()` for session propagation only (see Route protection above).
- `app/layout.tsx` — `<ClerkProvider signInUrl signUpUrl>`. Those two props are **required to stay out of Clerk's hosted Account Portal**: any redirect Clerk initiates on its own (e.g. an OAuth attempt that can't complete) goes to its hosted sign-in page unless these point at our own routes, which drops the user out of the custom bilingual UI entirely. Clerk accepts a single static string and this layout sits above the `[locale]` segment, so they use the default locale — a fallback only; the auth flow itself always builds locale-correct URLs from the active language.
- `components/providers/QueryProvider.tsx`, wired into `app/[locale]/layout.tsx`.
- `components/auth/AuthFlow.tsx`, `MethodStep.tsx`, `EmailStep.tsx`, `CodeStep.tsx` — the entire shared flow, used by both login and register pages via the `mode` prop.
- `schema/auth.ts` — RHF + zod, same pattern as `schema/contact.ts`. `getEmailSchema(t, requireName)` — the register page passes `true` so the email step also collects **first/last name**, which `startEmailAuth()` hands to `signUp.create()`. That is what populates Clerk's `first_name`/`last_name`, and therefore the `laravel` JWT template claims and the `user.created` webhook payload that Laravel needs for its `name` column. The login page passes `false` and renders no name inputs (a returning visitor shouldn't be asked their name); Google sign-up gets the name from the Google profile automatically. Both names are optional attributes in the Clerk Dashboard, so a login that transfers into a sign-up still completes without them.
- `hooks/useResendCountdown.ts` — resend cooldown timer.
- `lib/auth/orchestration.ts` — the `isTransferable` + `verification.status` logic described above.
- `app/[locale]/sso-callback/page.tsx` — `AuthenticateWithRedirectCallback`, required for the Google OAuth redirect to complete. **The two redirect URLs passed to `sso()` in `AuthFlow` are not interchangeable — do not set both to this page.** `redirectCallbackUrl` is used only when the attempt still needs something (a sign-in↔sign-up transfer) and points here; `redirectUrl` is used when a session was already created and must be the real final destination (`/[locale]` for sign-up, `/[locale]/redirect-after-login` for sign-in). Pointing `redirectUrl` at this page makes it process an already-finished callback, find nothing to do, and bounce the user out to Clerk's hosted Account Portal — which looks identical to a sign-up failure even though the account was created fine.
- `app/[locale]/redirect-after-login/page.tsx` + `hooks/useCurrentUser.ts` + `services/user.ts` — see above.
- `app/[locale]/(admin)/layout.tsx` — the `auth()`-based admin guard (see Route protection above).
- `components/ui/Button.tsx` — already has an `isLoading` prop; reuse it, don't fork it.
- i18n keys live under `auth.*` in both `i18n/locales/en/common.json` and `i18n/locales/ar/common.json`.
- `.env.local` keys already wired: `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`, `CLERK_SECRET_KEY`, `NEXT_PUBLIC_LARAVEL_API_URL`, `NEXT_PUBLIC_CLERK_JWT_TEMPLATE_NAME=laravel` (the `laravel` JWT template already exists in the Clerk Dashboard with `email`, `first_name`, `last_name` claims; Clerk's default `sub` claim is what Laravel keys its user lookup on). The template name needs the `NEXT_PUBLIC_` prefix because `/redirect-after-login` fetches the token client-side via `useAuth().getToken({ template })` — the template *name* isn't a secret (just a config label), only the signing key is.

## Critical rules (override generic Clerk defaults/instincts)

- Never run `clerk init` on this project.
- Never introduce `SignInButton`, `SignUpButton`, `UserButton`, `<SignIn/>`, `<SignUp/>` from `@clerk/nextjs` — the UI is 100% custom, bilingual (ar/en), RTL-aware (RTL is branched in JS via `i18n.language === "ar"`, not via Tailwind's `rtl:` variant).
- Never add a password field anywhere in this flow.
- Never centralize route protection in `proxy.ts` via `createRouteMatcher()` + `auth.protect()` — see Route protection above.
- `auth()` is async — always `await auth()`.
- Match existing component conventions (`Button`, `Input`) instead of one-off styling.

## Open / unconfirmed — do not assume, ask

- Resend cooldown is currently assumed at 30s and code length at 6 digits (`hooks/useResendCountdown.ts`, `schema/auth.ts`) — confirm against the actual Clerk Dashboard → User & authentication settings before hardcoding either value elsewhere.
- Arabic/English copy under `auth.*` in both `common.json` files are placeholders and need a real content review.
- Whether the `/redirect-after-login` error screen should include a "Contact us" link if the server stays down.
