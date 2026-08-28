"use client";

import AuthFlow from "@/components/auth/AuthFlow";
import AuthCard from "@/components/auth/AuthCard";

export default function RegisterPage() {
  return (
    <AuthCard mode="register">
      <AuthFlow mode="register" />
    </AuthCard>
  );
}
