"use client";

import AuthFlow from "@/components/auth/AuthFlow";
import AuthCard from "@/components/auth/AuthCard";

export default function LoginPage() {
  return (
    <AuthCard mode="login">
      <AuthFlow mode="login" />
    </AuthCard>
  );
}
