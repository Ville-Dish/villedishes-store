import { useQueryStates } from "nuqs";
import { adminSettingsParams } from "../params";

export const useAdminSettingssParams = () => {
  return useQueryStates(adminSettingsParams);
};
