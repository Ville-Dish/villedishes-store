import { menuParams } from "@/params/search.params";
import { useQueryStates } from "nuqs";

export const useSearchParams = () => {
  return useQueryStates(menuParams);
};
