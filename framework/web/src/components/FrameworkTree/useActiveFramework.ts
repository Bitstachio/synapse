import { useQuery } from "@tanstack/react-query";
import type { Framework } from "@/types/framework";
import { getActiveFramework } from "@/lib/frameworks-api";

export const ACTIVE_FRAMEWORK_QUERY_KEY = ["frameworks", "active"] as const;

export const useActiveFramework = () => {
  return useQuery<Framework>({
    queryKey: ACTIVE_FRAMEWORK_QUERY_KEY,
    queryFn: getActiveFramework,
  });
};
