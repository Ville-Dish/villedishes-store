import { subDays } from "date-fns";
import {
  createLoader,
  parseAsInteger,
  parseAsIsoDate,
  parseAsString,
} from "nuqs/server";

const today = new Date();
today.setHours(23, 59, 59, 999); // end of day for endDate default

const thirtyDaysAgo = subDays(today, 30);
thirtyDaysAgo.setHours(0, 0, 0, 0); // start of day for startDate default

export { today, thirtyDaysAgo };

export const dashboardParams = {
  tab: parseAsString
    .withDefault("overview")
    .withOptions({ clearOnDefault: true }),

  // Overview
  startDate: parseAsIsoDate
    .withDefault(thirtyDaysAgo)
    .withOptions({ clearOnDefault: true }),
  endDate: parseAsIsoDate
    .withDefault(today)
    .withOptions({ clearOnDefault: true }),

  // Performance
  selectedYear: parseAsInteger
    .withDefault(today.getFullYear())
    .withOptions({ clearOnDefault: true }),

  // Analytics
  selectedAnalyticsMonth: parseAsInteger
    .withDefault(today.getMonth() + 1)
    .withOptions({ clearOnDefault: true }),
  selectedAnalyticsYear: parseAsInteger
    .withDefault(today.getFullYear())
    .withOptions({ clearOnDefault: true }),

  // Reports
  selectedReportYear: parseAsInteger
    .withDefault(today.getFullYear())
    .withOptions({ clearOnDefault: true }),
};

export const dashboardParamsLoader = createLoader(dashboardParams);
