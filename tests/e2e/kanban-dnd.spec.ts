import { test, expect } from "@playwright/test";
import { loginAsTestUser, useResetData } from "./helpers";

useResetData();

// TODO: ajusta ruta y data-testid con Judas (tarea J7).
test("arrastrar una tarjeta a otra columna cambia su estado", async ({ page }) => {
  await loginAsTestUser(page);
  await page.goto("/kanban");

  const card = page.getByTestId("kanban-card-1");
  const target = page.getByTestId("kanban-column-preparing");
  const a = (await card.boundingBox())!;
  const b = (await target.boundingBox())!;

  await page.mouse.move(a.x + a.width / 2, a.y + a.height / 2);
  await page.mouse.down();
  await page.mouse.move(b.x + b.width / 2, b.y + 100, { steps: 15 });
  await page.mouse.up();

  await expect(target.getByTestId("kanban-card-1")).toBeVisible();
});