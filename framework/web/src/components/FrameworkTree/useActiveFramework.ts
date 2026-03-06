import { useQuery } from "@tanstack/react-query";
import { getActiveFramework, type ActiveFramework } from "@/lib/frameworks-api";

export const ACTIVE_FRAMEWORK_QUERY_KEY = ["frameworks", "active"] as const;

type UseActiveFrameworkOptions = {
  /** Only run the query when true. Set to auth state so the request is never sent without a token. */
  enabled?: boolean;
};

export const useActiveFramework = (options: UseActiveFrameworkOptions = {}) => {
  const { enabled = true } = options;

  return useQuery<ActiveFramework>({
    queryKey: ACTIVE_FRAMEWORK_QUERY_KEY,
    queryFn: getActiveFramework,
    enabled,
  });
};

