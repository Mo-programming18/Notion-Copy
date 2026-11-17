import type { Metadata } from "next";
import { Suspense } from "react";
import { AuthForm } from "@/components/auth/auth-form";
import { AuthSkeleton } from "@/components/workspace/skeletons";

export const metadata: Metadata = {
  title: "Sign in — Acme Workspace",
  description: "Sign in to your Acme Workspace account.",
};

export default function SignInPage() {
  return (
    <div className="h-dvh overflow-y-auto">
      <Suspense fallback={<AuthSkeleton />}>
        <AuthForm mode="sign-in" />
      </Suspense>
    </div>
  );
}
