import { test, expect } from "@playwright/test";
import { loginAsTestUser, resetDataBeforeEach } from "./helpers";

resetDataBeforeEach();

test("arrastrar una tarjeta a otra columna cambia su estado y persiste", async ({ page, request }) => {
  await loginAsTestUser(page);
  await page.goto("/kanban");

  const card = page.getByTestId("kanban-card-1");
  const target = page.getByTestId("kanban-column-preparing");
  await expect(card).toBeVisible();

  const a = (await card.boundingBox())!;
  const b = (await target.boundingBox())!;

  // dnd-kit necesita movimientos graduales del puntero
  await page.mouse.move(a.x + a.width / 2, a.y + a.height / 2);
  await page.mouse.down();
  await page.mouse.move(b.x + b.width / 2, b.y + 100, { steps: 15 });
  await page.mouse.up();

  await expect(target.getByTestId("kanban-card-1")).toBeVisible();

  // Persistencia: tras recargar sigue en la columna nueva y la API lo confirma
  await page.reload();
  await expect(page.getByTestId("kanban-column-preparing").getByTestId("kanban-card-1")).toBeVisible();

  const res = await request.get("/api/test/kanban-status?orderId=1");
  expect((await res.json()).status).toBe("preparing");
});
