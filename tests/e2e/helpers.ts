import { expect, test, type Page } from "@playwright/test";

// Restaura los datos antes de cada prueba. Llamar al inicio de cada spec.
export function resetDataBeforeEach() {
  test.beforeEach(async ({ request }) => {
    const res = await request.post("/api/test/reset-data");
    expect(res.ok()).toBeTruthy();
  });
}

// Inicia sesión con el proveedor de prueba (sin pasar por Google).
export async function loginAsTestUser(page: Page) {
  await page.goto("/login");
  await page.getByTestId("test-login-email").fill("test@omnimarket.dev");
  await page.getByTestId("test-login-submit").click();
  await expect(page).toHaveURL(/\/dashboard/);
}
