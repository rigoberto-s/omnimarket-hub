import { test, expect } from "@playwright/test";
import { loginAsTestUser, useResetData } from "./xhelpers";

useResetData();

test("sin sesión, /dashboard redirige a /login", async ({ page }) => {
  await page.goto("/dashboard");
  await expect(page).toHaveURL(/\/login/);
});

test("sin sesión, la API privada responde 401 JSON", async ({ request }) => {
  const res = await request.get("/api/orders");
  expect(res.status()).toBe(401);
  expect(await res.json()).toEqual({ error: "No autenticado" });
});

test("el acceso de prueba lleva al dashboard", async ({ page }) => {
  await loginAsTestUser(page);
  await expect(page).toHaveURL(/\/dashboard/);
});

test("con sesión, /login redirige a /dashboard", async ({ page }) => {
  await loginAsTestUser(page);
  await page.goto("/login");
  await expect(page).toHaveURL(/\/dashboard/);
});