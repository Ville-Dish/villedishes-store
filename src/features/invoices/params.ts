import { PAGINATION, PRODUCT_INFO } from "@/config/constants";
// import { InvoiceStatus } from "@/lib/schemas/invoiceSchema";
import { InvoiceStatus } from "@/lib/utils";
import {
  parseAsInteger,
  parseAsIsoDate,
  parseAsString,
  parseAsStringEnum,
} from "nuqs/server";

type InvoiceFilter = "ALL" | InvoiceStatus;

const statusValues: InvoiceFilter[] = ["ALL", ...Object.values(InvoiceStatus)];

type SortField =
  | "invoiceNumber"
  | "customerName"
  | "amount"
  | "dueDate"
  | "status";
type SortDirection = "asc" | "desc";

const sortFieldValues: SortField[] = [
  "invoiceNumber",
  "customerName",
  "status",
  "amount",
  "dueDate",
];
const sortDirectionValues: SortDirection[] = ["asc", "desc"];

export const invoiceParams = {
  page: parseAsInteger
    .withDefault(PAGINATION.DEFAULT_PAGE)
    .withOptions({ clearOnDefault: true }),
  pageSize: parseAsInteger
    .withDefault(PAGINATION.DEFAULT_PAGE_SIZE)
    .withOptions({ clearOnDefault: true }),
  search: parseAsString.withDefault("").withOptions({ clearOnDefault: true }),
  status: parseAsStringEnum<InvoiceFilter>(statusValues)
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
