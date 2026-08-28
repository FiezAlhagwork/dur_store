/**
 * Site-wide settings, editable from the dashboard instead of requiring a
 * deploy. `GET /api/settings` is public — the footer and the hero render for
 * signed-out visitors.
 *
 * Only the four groups the API actually returns today are typed here. The
 * original spec also covered `home_about` (image + stats) and `legal`
 * (privacy/terms URLs); the backend has not built those yet, so inventing
 * types for them would be describing a response nobody has seen. Add them when
 * a real response contains them.
 */
export interface SiteSettings {
  brand: {
    /** Absolute origin, used to build shareable product links. */
    site_url: string;
    /** Digits only, no `+` or spaces — goes straight into `wa.me/{number}`. */
    whatsapp_number: string;
  };

  contact: {
    /** Formatted for reading. */
    phone: string;
    /** Formatted for dialling — `tel:` form, which is not the same string. */
    phone_href: string;
    email: string;
    address_ar: string;
    address_en: string;
  };

  social: {
    instagram_url: string;
    facebook_url: string;
    // No WhatsApp field: that link is built from `brand.whatsapp_number`.
  };

  home_hero: {
    /**
     * Cloudinary URLs, ready to render. The API returns `null` for both until
     * something is uploaded — the service substitutes the bundled defaults, so
     * consumers of `SiteSettings` always get a usable source.
     */
    video_url: string;
    poster_url: string;

    title_line1_ar: string;
    title_line1_en: string;
    title_line2_ar: string;
    title_line2_en: string;
    description_ar: string;
    description_en: string;

    primary_button_label_ar: string;
    primary_button_label_en: string;
    primary_button_url: string;
    secondary_button_label_ar: string;
    secondary_button_label_en: string;
    secondary_button_url: string;
  };
}

/**
 * A partial update. Every group is optional, and within a group every field
 * is — the dashboard edits one section at a time.
 *
 * `video` and `poster` are the two file inputs. They have no counterpart in
 * the response: files go up, and `video_url` / `poster_url` come back.
 */
export interface SettingsUpdatePayload {
  brand?: Partial<SiteSettings["brand"]>;
  contact?: Partial<SiteSettings["contact"]>;
  social?: Partial<SiteSettings["social"]>;
  home_hero?: Partial<
    Omit<SiteSettings["home_hero"], "video_url" | "poster_url">
  > & {
    video?: File;
    poster?: File;
  };
}
