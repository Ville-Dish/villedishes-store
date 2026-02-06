import { menuParams } from "@/src/params/search.params";
import { useQueryStates } from "nuqs";

export const useSearchParams = () => {
  return useQueryStates(menuParams);
};
