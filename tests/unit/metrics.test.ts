import { describe, it, expect } from "vitest";
import { averageTicket, grossMargin } from "@/lib/metrics";

describe("averageTicket", () => {
  it("calcula el promedio de varios totales", () => {
    expect(averageTicket([1000, 2000, 3000])).toBe(2000);
  });
  it("devuelve 0 con una lista vacía", () => {
    expect(averageTicket([])).toBe(0);
  });
});

describe("grossMargin", () => {
  it("calcula el margen en porcentaje", () => {
    expect(grossMargin(1000, 600)).toBe(40);
  });
  it("devuelve 0 cuando el ingreso es 0 (sin dividir entre cero)", () => {
    expect(grossMargin(0, 0)).toBe(0);
  });
  it("devuelve negativo cuando el costo supera al ingreso", () => {
    expect(grossMargin(1000, 1500)).toBe(-50);
  });
});
