import { describe, it, expect } from "vitest";
import { buildPagination } from "@/lib/metrics";

describe("buildPagination", () => {
  it("calcula totalPages y offset", () => {
    const p = buildPagination(300, 2, 50);
    expect(p.totalPages).toBe(6);
    expect(p.offset).toBe(50);
  });
});
