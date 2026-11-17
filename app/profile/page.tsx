import type { Metadata } from "next";
import { Suspense } from "react";
import { ProfileClient } from "@/components/auth/profile-client";
import { AuthSkeleton } from "@/components/workspace/skeletons";

export const metadata: Metadata = {
  title: "Your profile — Acme Workspace",
  description: "Personalize your Open Peeps avatar and account details.",
};

export default function ProfilePage() {
  return (
    <div className="h-dvh overflow-y-auto">
      <Suspense fallback={<AuthSkeleton />}>
        <ProfileClient />
      </Suspense>
    </div>
  );
}
