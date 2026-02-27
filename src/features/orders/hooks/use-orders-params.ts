import { useQueryStates } from "nuqs";
import { orderParams } from "../params";

export const useOrdersParams = () => {
  return useQueryStates(orderParams);
};
