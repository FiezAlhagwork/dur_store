"use client";

import { useState } from "react";
import { useClerk } from "@clerk/nextjs";
import { useTranslation } from "react-i18next";
import Button from "@/components/ui/Button";

/**
 * Signs the current user out and sends them back to the login page.
 *
 * Uses `useClerk().signOut()` rather than Clerk's prebuilt `UserButton` /
 * `SignOutButton`, since the auth UI here is entirely custom (see CLAUDE.md).
 * `redirectUrl` is built from the active language so the user lands on the
 * login page in the locale they were already browsing.
 */
export default function LogoutButton() {
  const { signOut } = useClerk();
  const { t, i18n } = useTranslation("common");
  const locale = i18n.language === "ar" ? "ar" : "en";
  const [isSigningOut, setIsSigningOut] = useState(false);

  return (
    <Button
      type="button"
      // `outline` is cream-on-translucent and only reads on a dark surface;
      // on the admin top bar it was invisible.
      variant="surface"
      size="sm"
      isLoading={isSigningOut}
      onClick={async () => {
        setIsSigningOut(true);
        await signOut({ redirectUrl: `/${locale}/login` });
      }}
    >
      {t("auth.logout")}
    </Button>
  );
}
