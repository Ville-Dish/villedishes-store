// src/features/admin/params.ts

import { PAGINATION, TRANSACTION_INFO } from "@/config/constants";
import { subDays } from "date-fns/subDays";
import {
  parseAsInteger,
  parseAsIsoDate,
  parseAsString,
  parseAsStringEnum,
} from "nuqs/server";

type SortField = "name" | "date" | "category" | "amount";
type SortDirection = "asc" | "desc";

const sortFieldValues: SortField[] = ["name", "date", "category", "amount"];
const sortDirectionValues: SortDirection[] = ["asc", "desc"];

const today = new Date();
today.setHours(23, 59, 59, 999); // end of day for endDate default

const thirtyDaysAgo = subDays(today, 30);
thirtyDaysAgo.setHours(0, 0, 0, 0); // start of day for startDate default

export const adminSettingsParams = {
  tab: parseAsString
    .withDefault("General Settings")
    .withOptions({ clearOnDefault: true }),

  // ─── Expense tab — filters & pagination, independent of Income ─────────
  expenseStartDate: parseAsIsoDate,
  expenseEndDate: parseAsIsoDate,
  expenseCategory: parseAsString
    .withDefault("")
    .withOptions({ clearOnDefault: true }),
  expenseMinAmount: parseAsInteger
    .withDefault(0)
    .withOptions({ clearOnDefault: true }),
  expenseMaxAmount: parseAsInteger
    .withDefault(TRANSACTION_INFO.maxPrice)
    .withOptions({ clearOnDefault: true }),
  expenseSortField: parseAsStringEnum<SortField>(sortFieldValues).withOptions({
    clearOnDefault: true,
  }),
  expenseSortDirection: parseAsStringEnum<SortDirection>(
    sortDirectionValues,
  ).withOptions({ clearOnDefault: true }),
  expensePage: parseAsInteger
    .withDefault(PAGINATION.DEFAULT_PAGE)
    .withOptions({ clearOnDefault: true }),
  expensePageSize: parseAsInteger
    .withDefault(PAGINATION.DEFAULT_PAGE_SIZE)
    .withOptions({ clearOnDefault: true }),

  // ─── Income tab — filters & pagination, independent of Expense ─────────
  incomeStartDate: parseAsIsoDate,
  incomeEndDate: parseAsIsoDate,
  incomeCategory: parseAsString
    .withDefault("")
    .withOptions({ clearOnDefault: true }),
  incomeMinAmount: parseAsInteger
    .withDefault(0)
    .withOptions({ clearOnDefault: true }),
  incomeMaxAmount: parseAsInteger
    .withDefault(TRANSACTION_INFO.maxPrice)
    .withOptions({ clearOnDefault: true }),
  incomeSortField: parseAsStringEnum<SortField>(sortFieldValues).withOptions({
    clearOnDefault: true,
  }),
  incomeSortDirection: parseAsStringEnum<SortDirection>(
    sortDirectionValues,
  ).withOptions({ clearOnDefault: true }),
  incomePage: parseAsInteger
    .withDefault(PAGINATION.DEFAULT_PAGE)
    .withOptions({ clearOnDefault: true }),
  incomePageSize: parseAsInteger
    .withDefault(PAGINATION.DEFAULT_PAGE_SIZE)
    .withOptions({ clearOnDefault: true }),
};
