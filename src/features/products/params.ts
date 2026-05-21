import { PAGINATION, PRODUCT_INFO } from "@/config/constants";
import { parseAsInteger, parseAsString, parseAsStringEnum } from "nuqs/server";

type SortField = "name" | "price" | "category" | "rating";
type SortDirection = "asc" | "desc";

const sortFieldValues: SortField[] = ["name", "price", "category", "rating"];
const sortDirectionValues: SortDirection[] = ["asc", "desc"];

export const productParams = {
  page: parseAsInteger
    .withDefault(PAGINATION.DEFAULT_PAGE)
    .withOptions({ clearOnDefault: true }),
  pageSize: parseAsInteger
    .withDefault(PAGINATION.DEFAULT_PAGE_SIZE)
    .withOptions({ clearOnDefault: true }),
  search: parseAsString.withDefault("").withOptions({ clearOnDefault: true }),
  category: parseAsString
    .withDefault("ALL")
    .withOptions({ clearOnDefault: true }),
  rating: parseAsString
    .withDefault("ALL")
    .withOptions({ clearOnDefault: true }),
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
