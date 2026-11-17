"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Eye, EyeOff, Loader2, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { signIn, signUp } from "@/lib/auth-client";
import { dicebearAvatar } from "@/lib/avatar";

type AuthFormProps = { mode: "sign-in" | "sign-up" };

export function AuthForm({ mode }: AuthFormProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const isSignUp = mode === "sign-up";

  const [name, setName] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [confirmPassword, setConfirmPassword] = React.useState("");
  const [showPassword, setShowPassword] = React.useState(false);
  const [error, setError] = React.useState("");
  const [pending, setPending] = React.useState(false);

  const nextPath = searchParams.get("next") ?? "/profile";
  const avatarSeed = name.trim() || email.trim() || "Acme";
  const avatarUrl = React.useMemo(() => dicebearAvatar(avatarSeed), [avatarSeed]);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }
    if (isSignUp && password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setPending(true);
    try {
      const result = isSignUp
        ? await signUp.email({
            name: name.trim() || email.split("@")[0] || "Member",
            email: email.trim(),
            password,
            image: dicebearAvatar(avatarSeed),
          })
        : await signIn.email({ email: email.trim(), password });

      if (result.error) {
        setError(result.error.message ?? "Something went wrong. Please try again.");
        return;
      }

      router.push(nextPath.startsWith("/") ? nextPath : "/profile");
      router.refresh();
    } catch {
      setError("Could not reach the auth service. Check that the database is running.");
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="flex min-h-dvh items-center justify-center bg-[#f7f7f5] px-5 py-10">
      <div className="notion-enter w-full max-w-[420px]">
        <div className="mb-7 flex items-center justify-center gap-2.5">
          <span className="flex h-8 w-8 items-center justify-center rounded-[6px] bg-[#37352f] text-[17px] font-bold text-white">
            N
          </span>
          <span className="text-[17px] font-semibold tracking-[-0.01em]">Acme Workspace</span>
        </div>

        <div className="rounded-[10px] border border-border bg-white px-8 py-8 shadow-notion-200">
          {isSignUp && (
            <div className="mb-5 flex items-center gap-3 rounded-[6px] bg-[#faf7ff] p-3">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={avatarUrl}
                alt="Your Open Peeps avatar preview"
                width={48}
                height={48}
                className="h-12 w-12 rounded-[6px] border border-[#e5d9f7] bg-white"
              />
              <div className="min-w-0">
                <p className="flex items-center gap-1.5 text-[13px] font-semibold text-[#7b4fd1]">
                  <Sparkles className="h-3.5 w-3.5" />
                  Your avatar is ready
                </p>
                <p className="text-[12px] leading-4 text-muted-foreground">
                  A unique Open Peeps character, generated from your name.
                </p>
              </div>
            </div>
          )}

          <h1 className="mb-1 text-[26px] font-bold leading-8 tracking-[-0.02em]">
            {isSignUp ? "Create your account" : "Welcome back"}
          </h1>
          <p className="mb-6 text-[14px] leading-5 text-muted-foreground">
            {isSignUp
              ? "Start your workspace in a few seconds."
              : "Sign in to pick up where you left off."}
          </p>

          <form className="space-y-4" onSubmit={handleSubmit}>
            {isSignUp && (
              <div className="space-y-1.5">
                <label htmlFor="name" className="block text-[13px] font-medium">
                  Full name
                </label>
                <Input
                  id="name"
                  autoComplete="name"
                  placeholder="Mohammad Qannam"
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  required
                />
              </div>
            )}

            <div className="space-y-1.5">
              <label htmlFor="email" className="block text-[13px] font-medium">
                Email address
              </label>
              <Input
                id="email"
                type="email"
                autoComplete="email"
                placeholder="you@example.com"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                required
              />
            </div>

            <div className="space-y-1.5">
              <label htmlFor="password" className="block text-[13px] font-medium">
                Password
              </label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete={isSignUp ? "new-password" : "current-password"}
                  placeholder="At least 8 characters"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  minLength={8}
                  className="pr-9"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((value) => !value)}
                  className="absolute right-2 top-1/2 flex h-6 w-6 -translate-y-1/2 items-center justify-center rounded text-muted-foreground hover:bg-accent"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {isSignUp && (
              <div className="space-y-1.5">
                <label htmlFor="confirm-password" className="block text-[13px] font-medium">
                  Confirm password
                </label>
                <Input
                  id="confirm-password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="new-password"
                  placeholder="Repeat your password"
                  value={confirmPassword}
                  onChange={(event) => setConfirmPassword(event.target.value)}
                  minLength={8}
                  required
                />
              </div>
            )}

            {error && (
              <p role="alert" className="rounded-[4px] bg-[#fff0f0] px-3 py-2 text-[13px] text-[#c0392b]">
                {error}
              </p>
            )}

            <Button type="submit" variant="blue" size="lg" className="w-full" disabled={pending}>
              {pending && <Loader2 className="h-4 w-4 animate-spin" />}
              {isSignUp ? "Create account" : "Sign in"}
            </Button>
          </form>

          <div className="mt-6 border-t border-border pt-5 text-center text-[13px] text-muted-foreground">
            {isSignUp ? "Already have an account? " : "New to Acme Workspace? "}
            <Link
              href={isSignUp ? "/sign-in" : "/sign-up"}
              className="font-medium text-primary hover:underline"
            >
              {isSignUp ? "Sign in" : "Create an account"}
            </Link>
          </div>
          <p className="mt-4 text-center text-[11px] leading-4 text-muted-foreground/70">
            Avatars by Open Peeps (Pablo Stanley), CC0.
          </p>
        </div>

        <p className="mt-5 text-center text-[12px] text-muted-foreground">
          <Link href="/" className="hover:text-foreground hover:underline">
            ← Back to workspace
          </Link>
        </p>
      </div>
    </div>
  );
}
