import { MutationCache, QueryCache, QueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { createRouter } from "@tanstack/react-router";
import { routeTree } from "./routeTree.gen";

export const getRouter = () => {
  // One client per request: a module-level QueryClient leaks cached data between SSR requests.
  const onError = (e: unknown) => {
    if (typeof window === "undefined") return;
    const status = (e as { status?: number }).status;
    if (status === 401) return; // handled by sign-out redirect
    toast.error(e instanceof Error && e.message ? e.message : "Something went wrong");
  };
  const queryClient = new QueryClient({
    queryCache: new QueryCache({ onError }),
    // Mutations show their own contextual toasts; only surface ones without an onError handler.
    mutationCache: new MutationCache({
      onError: (e, _v, _c, m) => {
        if (!m.options.onError) onError(e);
      },
    }),
    defaultOptions: { queries: { retry: 1, staleTime: 15_000 } },
  });

  const router = createRouter({
    routeTree,
    context: { queryClient },
    scrollRestoration: true,
    // Lets Query own freshness; set caching defaults on the QueryClient, not the router.
    defaultPreloadStaleTime: 0,
  });

  return router;
};
