"use server";

import { signIn } from "@/auth";

export async function loginWithGoogle() {
  await signIn("google", { redirectTo: "/dashboard" });
}

export async function loginWithGitHub() {
  await signIn("github", { redirectTo: "/dashboard" });
}

export async function loginTest() {
  await signIn("test-login", {
    email: "test@omnimarket.dev",
    redirectTo: "/dashboard",
  });
}