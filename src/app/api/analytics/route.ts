import { NextRequest } from "next/server";
import { analyticsResponse } from "@/lib/services/analytics";

export const dynamic = "force-dynamic";

export function GET(req: NextRequest) {
  return analyticsResponse(req);
}
