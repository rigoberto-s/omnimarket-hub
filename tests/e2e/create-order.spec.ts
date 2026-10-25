import { test, expect } from "@playwright/test";
import { loginAsTestUser, useResetData } from "./helpers";

useResetData();

// TODO: ajusta ruta y data-testid con la lista que acuerdes con Judas (tarea J7).
test("crear un pedido lo muestra en la lista", async ({ page }) => {
  await loginAsTestUser(page);
  await page.goto("/orders");

  await page.getByTestId("new-order-button").click();
  await page.getByTestId("order-customer").fill("Cliente E2E");
  await page.getByTestId("order-product").selectOption({ index: 1 });
  await page.getByTestId("order-quantity").fill("2");
  await page.getByTestId("order-submit").click();

  await expect(page.getByText("Cliente E2E")).toBeVisible();
});