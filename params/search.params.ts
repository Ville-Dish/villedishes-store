import { DEFAULT_PAGE } from "@/hooks/use-search";
import { parseAsInteger, parseAsString } from "nuqs/server";

export const menuParams = {
  page: parseAsInteger
    .withDefault(DEFAULT_PAGE)
    .withOptions({ clearOnDefault: true }),
  search: parseAsString.withDefault("").withOptions({ clearOnDefault: true }),
};
