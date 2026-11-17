"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Check, Loader2, LogOut, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { authClient, signOut, useSession } from "@/lib/auth-client";
import {
  AVATAR_BACKGROUNDS,
  AVATAR_SEEDS,
  avatarForIdentity,
  dicebearAvatar,
} from "@/lib/avatar";

export function ProfileClient() {
  const router = useRouter();
  const session = useSession();
  const user = session.data?.user;

  const [seed, setSeed] = React.useState("");
  const [background, setBackground] = React.useState(AVATAR_BACKGROUNDS[0]);
  const [name, setName] = React.useState("");
  const [saving, setSaving] = React.useState(false);
  const [saved, setSaved] = React.useState(false);
  const [error, setError] = React.useState("");

  const initialized = React.useRef(false);
  React.useEffect(() => {
    if (!user || initialized.current) return;
    initialized.current = true;
    const current = user.image ?? "";
    const match = current.match(/[?&]seed=([^&]+)/);
    setSeed(match ? decodeURIComponent(match[1]) : user.name || user.email || "Acme");
    const bgMatch = current.match(/[?&]backgroundColor=([^&]+)/);
    setBackground(bgMatch?.[1] ?? AVATAR_BACKGROUNDS[0]);
    setName(user.name ?? "");
  }, [user]);

  React.useEffect(() => {
    if (session.isPending) return;
    if (!user) router.replace("/sign-in?next=%2Fprofile");
  }, [session.isPending, user, router]);

  const previewUrl = React.useMemo(
    () => dicebearAvatar(seed || user?.name || user?.email || "Acme", background.replace("#", "")),
    [seed, user?.name, user?.email, background],
  );

  async function handleSave() {
    if (!user) return;
    setSaving(true);
    setSaved(false);
    setError("");
    try {
      const result = await authClient.updateUser({
        image: previewUrl,
        name: name.trim() || user.name,
      });
      if (result.error) {
        setError(result.error.message ?? "Could not save your profile.");
        return;
      }
      setSaved(true);
      router.refresh();
      window.setTimeout(() => setSaved(false), 2500);
    } catch {
      setError("Could not save your profile. Check that the database is running.");
    } finally {
      setSaving(false);
    }
  }

  async function handleSignOut() {
    await signOut();
    router.push("/");
    router.refresh();
  }

  if (session.isPending) {
    return (
      <div className="mx-auto w-full max-w-[900px] px-6 py-12">
        <Skeleton className="mb-3 h-8 w-52" />
        <Skeleton className="mb-8 h-4 w-80" />
        <Skeleton className="h-64 w-full rounded-[10px]" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex min-h-dvh items-center justify-center bg-[#f7f7f5]">
        <div className="text-center">
          <p className="mb-3 text-[15px]">Redirecting to sign in…</p>
          <Link href="/sign-in?next=%2Fprofile" className="text-[14px] font-medium text-primary hover:underline">
            Go to sign in
          </Link>
        </div>
      </div>
    );
  }

  const currentAvatar = user.image || avatarForIdentity(user.email ?? user.name);

  return (
    <div className="notion-enter min-h-dvh bg-white">
      <header className="flex h-[56px] items-center gap-3 border-b border-border px-5">
        <Link
          href="/"
          className="flex h-8 w-8 items-center justify-center rounded-[6px] bg-[#37352f] text-[17px] font-bold text-white"
          aria-label="Back to workspace"
        >
          N
        </Link>
        <div className="min-w-0 flex-1">
          <p className="truncate text-[14px] font-semibold">Acme Workspace</p>
          <p className="text-[11px] text-muted-foreground">Account settings</p>
        </div>
        <Button variant="outline" size="sm" asChild>
          <Link href="/">Open workspace</Link>
        </Button>
      </header>

      <main className="mx-auto w-full max-w-[900px] px-6 pb-24 pt-12">
        <p className="mb-1 text-[12px] font-semibold uppercase tracking-wide text-muted-foreground">
          Profile
        </p>
        <h1 className="mb-2 text-[40px] font-bold leading-[48px] tracking-[-0.02em]">Your account</h1>
        <p className="mb-9 text-[15px] text-muted-foreground">
          Choose a hand-drawn Open Peeps character and personalize how you appear across the workspace.
        </p>

        <section className="mb-6 rounded-[10px] border border-border p-6 shadow-notion-100">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-center">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={previewUrl}
              alt="Selected Open Peeps avatar"
              width={112}
              height={112}
              className="h-28 w-28 shrink-0 rounded-[10px] border border-border bg-[#f7f7f5]"
            />
            <div className="min-w-0 flex-1">
              <h2 className="mb-1 text-[18px] font-semibold">Profile photo</h2>
              <p className="text-[13px] leading-5 text-muted-foreground">
                Generated by DiceBear Open Peeps from your seed. Pick one below or type your own.
              </p>
              <div className="mt-4 flex flex-wrap gap-2">
                <Input
                  value={seed}
                  onChange={(event) => {
                    setSeed(event.target.value);
                    setSaved(false);
                  }}
                  placeholder="Avatar seed"
                  aria-label="Avatar seed"
                  className="max-w-52"
                />
                <Button variant="outline" onClick={() => setSeed(user.name || user.email || "Acme")}>
                  Use my name
                </Button>
                <Button variant="outline" onClick={() => setSeed(Math.random().toString(36).slice(2, 10))}>
                  Surprise me
                </Button>
              </div>
            </div>
          </div>

          <div className="mt-6 border-t border-border pt-5">
            <p className="mb-2.5 text-[12px] font-semibold text-muted-foreground">Suggested characters</p>
            <div className="grid grid-cols-6 gap-2 sm:grid-cols-12">
              {AVATAR_SEEDS.map((candidate) => {
                const url = dicebearAvatar(candidate, background);
                const active = candidate === seed;
                return (
                  <button
                    key={candidate}
                    type="button"
                    onClick={() => {
                      setSeed(candidate);
                      setSaved(false);
                    }}
                    title={candidate}
                    aria-label={`Use ${candidate} avatar`}
                    className={`relative aspect-square overflow-hidden rounded-[6px] border-2 transition-all hover:scale-105 ${
                      active ? "border-primary shadow-notion-100" : "border-transparent hover:border-border"
                    }`}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={url} alt="" className="h-full w-full bg-[#f7f7f5]" />
                    {active && (
                      <span className="absolute bottom-0 right-0 flex h-4 w-4 items-center justify-center rounded-tl-[4px] bg-primary text-white">
                        <Check className="h-3 w-3" />
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="mt-5 border-t border-border pt-5">
            <p className="mb-2.5 text-[12px] font-semibold text-muted-foreground">Background</p>
            <div className="flex flex-wrap gap-2">
              {AVATAR_BACKGROUNDS.map((color) => (
                <button
                  key={color}
                  type="button"
                  onClick={() => {
                    setBackground(color);
                    setSaved(false);
                  }}
                  aria-label={`Use #${color} background`}
                  className={`h-7 w-7 rounded-[6px] border-2 transition-transform hover:scale-110 ${
                    background === color ? "border-foreground" : "border-transparent"
                  }`}
                  style={{ backgroundColor: `#${color}` }}
                />
              ))}
            </div>
          </div>
        </section>

        <section className="rounded-[10px] border border-border p-6 shadow-notion-100">
          <h2 className="mb-4 text-[18px] font-semibold">Account details</h2>
          <div className="space-y-4">
            <div className="space-y-1.5">
              <label htmlFor="profile-name" className="block text-[13px] font-medium">
                Display name
              </label>
              <Input
                id="profile-name"
                value={name}
                onChange={(event) => {
                  setName(event.target.value);
                  setSaved(false);
                }}
                className="max-w-md"
              />
            </div>
            <div className="space-y-1.5">
              <p className="text-[13px] font-medium">Email</p>
              <p className="text-[14px] text-muted-foreground">{user.email}</p>
            </div>
          </div>

          {error && (
            <p role="alert" className="mt-4 rounded-[4px] bg-[#fff0f0] px-3 py-2 text-[13px] text-[#c0392b]">
              {error}
            </p>
          )}

          <div className="mt-6 flex flex-wrap items-center gap-3 border-t border-border pt-5">
            <Button variant="blue" onClick={handleSave} disabled={saving}>
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
              Save changes
            </Button>
            {saved && (
              <span className="flex items-center gap-1.5 text-[13px] font-medium text-[#0f9d58]">
                <Check className="h-4 w-4" /> Saved
              </span>
            )}
            <Button variant="ghost" className="ml-auto text-muted-foreground" onClick={handleSignOut}>
              <LogOut /> Sign out
            </Button>
          </div>
        </section>

        <div className="mt-8 flex items-center gap-3 rounded-[8px] bg-[#f7f7f5] px-4 py-3">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={currentAvatar} alt="Current avatar" width={36} height={36} className="h-9 w-9 rounded-[6px]" />
          <p className="text-[12px] leading-4 text-muted-foreground">
            This avatar is stored with your account via Better Auth and shown throughout the workspace.
          </p>
        </div>
      </main>
    </div>
  );
}
