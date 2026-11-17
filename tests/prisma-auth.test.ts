import "./setup";
import assert from "node:assert/strict";
import { after, describe, it } from "node:test";
import { PrismaClient } from "@prisma/client";
import { auth } from "../lib/auth";

const prisma = new PrismaClient();

after(async () => {
  await prisma.$disconnect();
});

describe("Prisma-backed Better Auth", () => {
  it("signs up and signs in a user through the Prisma adapter", async () => {
    const email = `prisma-auth-${Date.now()}@example.com`;
    const password = "PrismaTest123!";

    try {
      const signUp = await auth.api.signUpEmail({
        body: { name: "Prisma Auth Test", email, password },
      });
      assert.equal(signUp.user.email, email);

      const signIn = await auth.api.signInEmail({ body: { email, password } });
      assert.equal(signIn.user.email, email);
    } finally {
      await prisma.user.deleteMany({ where: { email } });
    }
  });
});
