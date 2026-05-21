import { useQueryStates } from "nuqs";
import { invoiceParams } from "../params";

export const useInvoicesParams = () => {
  return useQueryStates(invoiceParams);
};
