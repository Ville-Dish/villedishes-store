import { useQueryStates } from "nuqs";

import { dashboardParams } from "../params";

export const useDashboardParams = () => {
  return useQueryStates(dashboardParams);
};
