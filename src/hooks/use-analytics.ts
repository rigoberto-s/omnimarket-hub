import { keepPreviousData, useQuery } from "@tanstack/react-query";
import type { PaginationQuery } from "@/lib/types";
import { client } from "./api-client";

export const analyticsKeys = {
  all: ["analytics"] as const,
  list: (query: PaginationQuery) => ["analytics", query] as const,
};

export function useAnalytics(query: PaginationQuery = {}) {
  return useQuery({
    queryKey: analyticsKeys.list(query),
    queryFn: () => client.getAnalytics(query),
    placeholderData: keepPreviousData,
  });
}
