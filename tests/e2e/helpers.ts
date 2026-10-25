import { expect, test, type Page } from "@playwright/test";

// Restaura los datos antes de cada prueba. Úsalo en cada spec: useResetData();
export function useResetData() {
  test.beforeEach(async ({ request }) => {
    const res = await request.post("/api/test/reset-data");
    expect(res.ok()).toBeTruthy();
  });
}

// Inicia sesión con el proveedor de prueba (sin pasar por Google).
export async function loginAsTestUser(page: Page) {
  await page.goto("/login");
  await page.getByRole("button", { name: /acceso de prueba/i }).click();
  await expect(page).toHaveURL(/\/dashboard/);
}