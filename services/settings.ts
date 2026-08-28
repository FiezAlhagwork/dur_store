import type { AxiosProgressEvent } from "axios";
import { apiClient, authHeader } from "@/lib/api/client";
import { toApiError } from "@/lib/api/errors";
import { DEFAULT_SETTINGS } from "@/constants/settings";
import type { SiteSettings, SettingsUpdatePayload } from "@/types/settings";

/**
 * The response as received, before merging.
 *
 * Every group and every field is optional, and this is not defensive
 * pessimism: the API genuinely returns only four of the six groups the schema
 * describes, and `home_hero.video_url` genuinely arrives as `null` until
 * something is uploaded.
 */
type RawGroup<T> = { [K in keyof T]?: T[K] | null };

interface RawSettings {
  brand?: RawGroup<SiteSettings["brand"]> | null;
  contact?: RawGroup<SiteSettings["contact"]> | null;
  social?: RawGroup<SiteSettings["social"]> | null;
  home_hero?: RawGroup<SiteSettings["home_hero"]> | null;
}

/**
 * Fills in one group, field by field rather than whole-group.
 *
 * A whole-group fallback would be wrong for the state the API is actually in:
 * `home_hero` arrives populated *except* for `video_url`, so taking the group
 * as-is keeps every headline the admin wrote and still leaves the page with no
 * video. Empty strings fall back alongside `null` and `undefined` — an unset
 * field reaches us as `""` just as often, and "" is not a usable video source
 * or phone number either.
 *
 * Note there is deliberately no dev-mode warning here, unlike
 * `services/dashboard.ts` where a missing key means the response shape is
 * wrong. Missing groups are the expected state of this endpoint right now, and
 * a warning that fires on every page load is how real warnings get ignored.
 */
function mergeGroup<T extends object>(defaults: T, raw: RawGroup<T> | null | undefined): T {
  if (!raw) return defaults;

  const merged = { ...defaults };

  for (const key of Object.keys(defaults) as (keyof T)[]) {
    const value = raw[key];
    if (value === undefined || value === null || value === "") continue;
    merged[key] = value;
  }

  return merged;
}

/** Both endpoints return the same shape, so both get the same completion. */
function mergeSettings(raw: RawSettings): SiteSettings {
  return {
    brand: mergeGroup(DEFAULT_SETTINGS.brand, raw.brand),
    contact: mergeGroup(DEFAULT_SETTINGS.contact, raw.contact),
    social: mergeGroup(DEFAULT_SETTINGS.social, raw.social),
    home_hero: mergeGroup(DEFAULT_SETTINGS.home_hero, raw.home_hero),
  };
}

/**
 * `GET /api/settings` — public, like `/categories` and `/products`. Takes no
 * token: the footer and hero render for visitors who never sign in.
 *
 * Always resolves to a complete `SiteSettings`; anything the server omits
 * comes from `DEFAULT_SETTINGS`. A *failed* request still throws, so the
 * dashboard editor can report it — the storefront's fallback lives in the
 * hook, which is the layer that knows the difference between "show the user an
 * error" and "just render the page".
 */
export async function fetchSettings(): Promise<SiteSettings> {
  try {
    const { data } = await apiClient.get<RawSettings>("/settings");
    return mergeSettings(data);
  } catch (error) {
    throw toApiError(error);
  }
}

/**
 * Builds the multipart body.
 *
 * Field names are nested in brackets — `home_hero[title_line1_ar]`, not a flat
 * `title_line1_ar`. That is the form the API owner documented for the two file
 * fields (`home_hero[video]`, `home_hero[poster]`), and it matches the nested
 * shape of the response. The products endpoint is a standing reminder that the
 * exact spelling matters: sending `images` there instead of `images[]` is
 * rejected with a 422.
 */
function toSettingsFormData(payload: SettingsUpdatePayload): FormData {
  const form = new FormData();

  const appendGroup = (group: string, values: object | undefined) => {
    if (!values) return;

    for (const [key, value] of Object.entries(values)) {
      if (value === undefined || value === null) continue;
      // A File must go in untouched; String(file) would send "[object File]".
      form.append(`${group}[${key}]`, value instanceof File ? value : String(value));
    }
  };

  appendGroup("brand", payload.brand);
  appendGroup("contact", payload.contact);
  appendGroup("social", payload.social);
  appendGroup("home_hero", payload.home_hero);

  return form;
}

/**
 * `PUT /api/settings` — admin, sent as a POST carrying `_method=PUT`.
 *
 * The override is required for the same reason as categories and products: PHP
 * cannot parse a `multipart/form-data` body on a real PUT, and this body
 * carries files. `_method` must be a plain text field.
 *
 * `onProgress` reports the browser→server transfer only. It reaches 100% while
 * the server is still pushing the file to Cloudinary, which on a 50MB video is
 * a noticeable extra wait — callers should switch to an indeterminate
 * "processing" state at 100% rather than leave a full bar sitting there
 * looking frozen.
 */
export async function updateSettings(
  token: string,
  payload: SettingsUpdatePayload,
  onProgress?: (percent: number) => void,
): Promise<SiteSettings> {
  try {
    const form = toSettingsFormData(payload);
    form.append("_method", "PUT");

    const { data } = await apiClient.post<RawSettings>("/settings", form, {
      headers: authHeader(token),
      onUploadProgress: onProgress
        ? (event: AxiosProgressEvent) => {
            /*
             * `total` and `progress` are both optional on the event, and are
             * absent whenever the body's length cannot be determined. Dividing
             * by an undefined total would report NaN% as a real figure.
             */
            if (!event.lengthComputable || !event.total) return;
            onProgress(Math.round((event.loaded / event.total) * 100));
          }
        : undefined,
    });

    // Same shape as GET, so the same completion applies — a successful save
    // must not hand back a settings object with holes in it.
    return mergeSettings(data);
  } catch (error) {
    throw toApiError(error);
  }
}
