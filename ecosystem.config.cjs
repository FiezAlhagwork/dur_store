module.exports = {
  apps: [{
    name: 'dur-store',
    cwd: '/var/www/dur-store',
    script: 'node_modules/next/dist/bin/next',

    /*
     * `-H localhost`, NOT `-H 127.0.0.1`. This is load-bearing, and the two
     * are not interchangeable here even though they name the same address.
     *
     * Clerk's middleware rewrites every request to itself as an absolute URL
     * in order to attach its auth headers (see decorateRequest in
     * @clerk/nextjs/dist/esm/server/utils.js — a plain NextResponse.next()
     * becomes `x-middleware-rewrite: <absolute req.url>`), and that URL is
     * built with the host `localhost`.
     *
     * Next then compares that rewrite's origin against the origin it computed
     * for itself (resolve-routes.js: `${protocol}://${opts.hostname ||
     * 'localhost'}:${port}` — note it ignores the Host header entirely). If
     * the two origins differ *as strings*, Next treats the rewrite as an
     * external destination and tries to proxy to it.
     *
     * With `-H 127.0.0.1` the comparison was "https://localhost:3000" vs
     * "https://127.0.0.1:3000" — same machine, different text — so Next
     * proxied to `https://localhost:3000`, i.e. attempted a TLS handshake
     * against this very server, which speaks plain HTTP. Result: every single
     * page (not just the admin ones) failed with
     * `write EPROTO ... wrong version number` and an Internal Server Error.
     * The `https` came from nginx's X-Forwarded-Proto, which is correct and
     * not the problem; nginx's config is fine and was ruled out.
     *
     * Reproduced and fixed against an isolated copy on port 3001 before this
     * change shipped: with `-H 127.0.0.1` → 500 + "Failed to proxy"; with
     * `-H localhost` → 200 on /ar and 307 on /ar/dashboard.
     */
    args: 'start -p 3000 -H localhost',

    instances: 1,
    exec_mode: 'fork',
    env: {
      NODE_ENV: 'production',
      PORT: '3000',

      /*
       * Also load-bearing, and now more so than before. Node resolves the
       * `-H localhost` above through DNS, and localhost commonly resolves to
       * ::1 first — which would bind the server to IPv6 loopback only, while
       * nginx's upstream is `server 127.0.0.1:3000` (IPv4). The site would
       * then be unreachable through nginx entirely.
       *
       * Verified on this host: without this flag `-H localhost` binds
       * [::1]:3000; with it, 127.0.0.1:3000. Do not remove it.
       */
      NODE_OPTIONS: '--dns-result-order=ipv4first',
    },
    max_memory_restart: '768M',
    time: true,
  }],
};
