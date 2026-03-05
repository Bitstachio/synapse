import { useQuery } from "@tanstack/react-query";
import { getActiveFramework, type ActiveFramework } from "@/lib/frameworks-api";

export const ACTIVE_FRAMEWORK_QUERY_KEY = ["frameworks", "active"] as const;

export const useActiveFramework = () =>
  useQuery<ActiveFramework>({
    queryKey: ACTIVE_FRAMEWORK_QUERY_KEY,
    queryFn: getActiveFramework,
  });

