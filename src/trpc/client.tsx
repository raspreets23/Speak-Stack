"use client";
// ^-- to make sure we can mount the Provider from a server component
import type { QueryClient } from "@tanstack/react-query";
import { QueryClientProvider } from "@tanstack/react-query";
import { createTRPCClient, httpBatchLink } from "@trpc/client";
import { createTRPCContext } from "@trpc/tanstack-react-query";
import { useState } from "react";
import { makeQueryClient } from "./query-client";
import type { AppRouter } from "./routers/_app";
import superjson from "superjson";

export const { TRPCProvider, useTRPC } = createTRPCContext<AppRouter>();

let browserQueryClient: QueryClient;
function getQueryClient() {
  if (typeof window === "undefined") {
    console.log("🟣 [tRPC] Server: creating new query client");
    return makeQueryClient();
  }
  if (!browserQueryClient) {
    console.log("🟣 [tRPC] Browser: creating new query client");
    browserQueryClient = makeQueryClient();
  }
  return browserQueryClient;
}

function getUrl() {
  const base = (() => {
    if (typeof window !== "undefined") {
      console.log("🟣 [tRPC] Browser: using relative URL");
      return "";
    }
    if (process.env.APP_URL) {
      console.log("🟣 [tRPC] Server: using APP_URL:", process.env.APP_URL);
      return process.env.APP_URL;
    }
    console.log("🟣 [tRPC] Server: using localhost fallback");
    return "http://localhost:3000";
  })();
  const fullUrl = `${base}/api/trpc`;
  console.log("🟣 [tRPC] Full URL:", fullUrl);
  return fullUrl;
}

export function TRPCReactProvider(
  props: Readonly<{
    children: React.ReactNode;
  }>,
) {
  console.log("🟣 [tRPC] TRPCReactProvider rendering");
  
  const queryClient = getQueryClient();
  console.log("🟣 [tRPC] Query client created");

  const [trpcClient] = useState(() => {
    console.log("🟣 [tRPC] Creating tRPC client...");
    return createTRPCClient<AppRouter>({
      links: [
        httpBatchLink({
          transformer: superjson,
          url: getUrl(),
        }),
      ],
    });
  });
  console.log("🟣 [tRPC] tRPC client created");

  return (
    <QueryClientProvider client={queryClient}>
      <TRPCProvider trpcClient={trpcClient} queryClient={queryClient}>
        {props.children}
      </TRPCProvider>
    </QueryClientProvider>
  );
}