import { useQueryStates } from "nuqs";
import { productParams } from "../params";

export const useProductsParams = () => {
  return useQueryStates(productParams);
};
