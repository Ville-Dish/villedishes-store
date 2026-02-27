import { PAGINATION, PRODUCT_INFO } from "@/config/constants";
import { OrderStatus } from "@/lib/utils";
import {
  parseAsInteger,
  parseAsIsoDate,
  parseAsString,
  parseAsStringEnum,
} from "nuqs/server";

type StatusFilter = "ALL" | OrderStatus;

const statusValues: StatusFilter[] = ["ALL", ...Object.values(OrderStatus)];

export const orderParams = {
  page: parseAsInteger
    .withDefault(PAGINATION.DEFAULT_PAGE)
    .withOptions({ clearOnDefault: true }),
  pageSize: parseAsInteger
    .withDefault(PAGINATION.DEFAULT_PAGE_SIZE)
    .withOptions({ clearOnDefault: true }),
  search: parseAsString.withDefault("").withOptions({ clearOnDefault: true }),
  status: parseAsStringEnum<StatusFilter>(statusValues)
    .withDefault("ALL")
    .withOptions({ clearOnDefault: true }),
  startDate: parseAsIsoDate
    // .withDefault("undefined")
    .withOptions({ clearOnDefault: true }),
  endDate: parseAsIsoDate
    // .withDefault("Today")
    .withOptions({ clearOnDefault: true }),
  minPrice: parseAsInteger.withDefault(0).withOptions({ clearOnDefault: true }),
  maxPrice: parseAsInteger
    .withDefault(PRODUCT_INFO.maxPrice)
    .withOptions({ clearOnDefault: true }),
};
