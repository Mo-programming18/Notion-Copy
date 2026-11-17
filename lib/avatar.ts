/**
 * DiceBear Open Peeps avatars.
 * Open Peeps is a hand-drawn vector avatar style by Pablo Stanley (CC0 1.0).
 * The generated URL is stored in Better Auth's `user.image` field.
 */

const DICEBEAR_BASE = "https://api.dicebear.com/10.x/open-peeps/svg";

export const AVATAR_BACKGROUNDS = [
  "b6e3f4",
  "c0aede",
  "d1d4f9",
  "ffd5dc",
  "ffdfbf",
  "e6f3fe",
];

export const AVATAR_SEEDS = [
  "Mohammad",
  "Acme",
  "Pixel",
  "Sofia",
  "Omar",
  "Mina",
  "Daniel",
  "River",
  "Sketch",
  "Nova",
  "Indigo",
  "Harper",
];

export function dicebearAvatar(seed: string, backgroundColor = "b6e3f4") {
  const params = new URLSearchParams({
    seed: seed.trim() || "Acme",
    backgroundColor,
    radius: "0",
  });
  return `${DICEBEAR_BASE}?${params.toString()}`;
}

export function avatarForIdentity(seed?: string | null) {
  return dicebearAvatar(seed ?? "Acme");
}

export function isDicebearUrl(value?: string | null) {
  return Boolean(value && value.includes("api.dicebear.com") && value.includes("open-peeps"));
}
