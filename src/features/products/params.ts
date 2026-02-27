import { PAGINATION, PRODUCT_INFO } from "@/config/constants";
import { parseAsInteger, parseAsString } from "nuqs/server";

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
};
