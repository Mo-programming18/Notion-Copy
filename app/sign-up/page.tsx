import type { Metadata } from "next";
import { Suspense } from "react";
import { AuthForm } from "@/components/auth/auth-form";
import { AuthSkeleton } from "@/components/workspace/skeletons";

export const metadata: Metadata = {
  title: "Create an account — Acme Workspace",
  description: "Create your Acme Workspace account with a DiceBear Open Peeps avatar.",
};

export default function SignUpPage() {
  return (
    <div className="h-dvh overflow-y-auto">
      <Suspense fallback={<AuthSkeleton />}>
        <AuthForm mode="sign-up" />
      </Suspense>
    </div>
  );
}
