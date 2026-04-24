import { useQuery } from "@tanstack/react-query";
import { getActiveFramework, getFrameworkById, type ActiveFramework } from "@/lib/frameworks-api";

export const ACTIVE_FRAMEWORK_QUERY_KEY = ["frameworks", "active"] as const;

export const frameworkByIdQueryKey = (id: string) => ["frameworks", "byId", id] as const;

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

export const useFrameworkById = (id: string | null, options: UseActiveFrameworkOptions = {}) => {
  const { enabled = true } = options;

  return useQuery<ActiveFramework>({
    queryKey: frameworkByIdQueryKey(id ?? ""),
    queryFn: () => getFrameworkById(id!),
    enabled: enabled && !!id,
  });
};

