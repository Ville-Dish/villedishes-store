// src/features/admin/lib/utils.ts

import { TRANSACTION_INFO } from "@/config/constants";
import { Expense, Income, TransactionFilters } from "@/lib/types";

export function filterTransactions<T extends Income | Expense>(
  data: T[],
  filters: TransactionFilters,
): T[] {
  return data.filter((item) => {
    if (filters.category && item.category !== filters.category) return false;

    const itemDate = new Date(item.date);
    if (filters.startDate && itemDate < new Date(filters.startDate))
      return false;
    if (filters.endDate && itemDate > new Date(filters.endDate)) return false;

    if (filters.minAmount && item.amount < Number(filters.minAmount))
      return false;
    if (filters.maxAmount && item.amount > Number(filters.maxAmount))
      return false;

    return true;
  });
}

export const emptyFilters: TransactionFilters = {
  category: "",
  startDate: null,
  endDate: null,
  minAmount: 0,
  maxAmount: TRANSACTION_INFO.maxPrice,
};
