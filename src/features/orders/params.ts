import { PAGINATION, PRODUCT_INFO } from "@/config/constants";
import { OrderStatus } from "@/generated/prisma/enums";
import {
  parseAsInteger,
  parseAsIsoDate,
  parseAsString,
  parseAsStringEnum,
} from "nuqs/server";

type StatusFilter = "ALL" | OrderStatus;

const statusValues: StatusFilter[] = ["ALL", ...Object.values(OrderStatus)];

type SortField = "orderNumber" | "customer" | "status" | "total" | "orderDate";
type SortDirection = "asc" | "desc";

const sortFieldValues: SortField[] = [
  "orderNumber",
  "customer",
  "status",
  "total",
  "orderDate",
];
const sortDirectionValues: SortDirection[] = ["asc", "desc"];

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
  startDate: parseAsIsoDate.withOptions({ clearOnDefault: true }),
  endDate: parseAsIsoDate.withOptions({ clearOnDefault: true }),
  minPrice: parseAsInteger.withDefault(0).withOptions({ clearOnDefault: true }),
  maxPrice: parseAsInteger
    .withDefault(PRODUCT_INFO.maxPrice)
    .withOptions({ clearOnDefault: true }),
  sortField: parseAsStringEnum<SortField>(sortFieldValues).withOptions({
    clearOnDefault: true,
  }),
  sortDirection: parseAsStringEnum<SortDirection>(
    sortDirectionValues,
  ).withOptions({
    clearOnDefault: true,
  }),
};
