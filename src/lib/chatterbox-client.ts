import createClient from "openapi-fetch";
import type { paths } from "@/types/chatterbox-api";
import { env } from "./env";

console.log("🔵 Chatterbox client init:");
console.log("  URL:", env.CHATTERBOX_API_URL);
console.log("  API Key exists:", !!env.CHATTERBOX_API_KEY);
console.log("  API Key value:", env.CHATTERBOX_API_KEY);

export const chatterbox = createClient<paths>({
  baseUrl: env.CHATTERBOX_API_URL,
  headers: {
    "x-api-key": env.CHATTERBOX_API_KEY,
  },
});