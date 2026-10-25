import { describe, it, expect } from "vitest";
import { formatCurrency } from "@/lib/format";

describe("formatCurrency", () => {
  it("formatea centavos como pesos mexicanos", () => {
    expect(formatCurrency(123456)).toBe("$1,234.56");
  });
  it("formatea cero", () => {
    expect(formatCurrency(0)).toBe("$0.00");
  });
});
