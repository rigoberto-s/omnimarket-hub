import { test, expect } from "@playwright/test";
import { loginAsTestUser, resetDataBeforeEach } from "./helpers";

resetDataBeforeEach();

test("crear un pedido muestra un toast y aparece en la tabla", async ({ page }) => {
  await loginAsTestUser(page);
  await page.goto("/orders");

  await page.getByTestId("orders-new-button").click();
  await page.getByTestId("order-form-customer").fill("Cliente E2E");
  await page.getByTestId("order-form-product").selectOption({ index: 1 });
  await page.getByTestId("order-form-quantity").fill("2");
  await page.getByTestId("order-form-submit").click();

  await expect(page.getByText(/Pedido #\d+ creado/)).toBeVisible();
  await expect(page.getByTestId("orders-table").getByText("Cliente E2E")).toBeVisible();
});
