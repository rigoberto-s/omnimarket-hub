import { api, type ApiClient } from "@/lib/api";
import { USE_MOCKS } from "@/mocks/data";
import { mockApi } from "@/mocks/mock-api";

/** Cliente que usan los hooks: la API real o los mocks si NEXT_PUBLIC_USE_MOCKS=true. */
export const client: ApiClient = USE_MOCKS ? mockApi : api;
