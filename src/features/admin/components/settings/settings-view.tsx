// src/features/admin/components/settings/settings-view.tsx
"use client";

import { Button } from "@/components/ui/button";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import {
  Briefcase,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  DollarSign,
  Settings,
  TrendingUp,
} from "lucide-react";
import React, { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import {
  Expense,
  Income,
  TransactionFilters,
  YearlyRevenue,
} from "@/lib/types";
import { YearlyRevenueAccordion } from "./yearly-revenue-accordion";
import { SettingsForm } from "./settings-form";
import { SettingsTable } from "./settings-table";
import { useTRPC } from "@/trpc/client";
import {
  useMutation,
  useQueryClient,
  useSuspenseQuery,
} from "@tanstack/react-query";
import { GeneralSettings } from "./general-tab";
import { emptyFilters } from "../../lib/utils";
import { useAdminSettingssParams } from "../../hooks/use-settings-params";
import { SettingsFilterDrawer } from "./settings-filter-dialog";
import { PAGINATION, TRANSACTION_INFO } from "@/config/constants";

const settingsValue = [
  { name: "General Settings", icon: Settings },
  { name: "Revenue Projections", icon: TrendingUp },
  { name: "Expense", icon: DollarSign },
  { name: "Income", icon: Briefcase },
];

type SortField = "name" | "amount" | "category" | "date" | null;
type SortDirection = "asc" | "desc" | null;

const countActiveFilters = (
  category: string,
  startDate: Date | null,
  endDate: Date | null,
  minAmount: number,
  maxAmount: number,
) =>
  [
    category,
    startDate,
    endDate,
    minAmount > 0,
    maxAmount < TRANSACTION_INFO.maxPrice,
  ].filter(Boolean).length;

export const SettingsView = () => {
  const trpc = useTRPC();
  const queryClient = useQueryClient();

  const [params, setParams] = useAdminSettingssParams();

  const {
    tab: activeTab,
    expenseStartDate,
    expenseEndDate,
    expenseCategory,
    expenseMinAmount,
    expenseMaxAmount,
    expensePage,
    expensePageSize,
    expenseSortField,
    expenseSortDirection,
    incomeStartDate,
    incomeEndDate,
    incomeCategory,
    incomeMinAmount,
    incomeMaxAmount,
    incomePage,
    incomePageSize,
    incomeSortField,
    incomeSortDirection,
  } = params;

  const [isLargeScreen, setIsLargeScreen] = useState(false);

  const [showForm, setShowForm] = useState<
    "Revenue" | "Income" | "Expense" | null
  >(null);

  const [editItem, setEditItem] = useState<
    ((Income | Expense) & { type?: "Income" | "Expense" }) | null
  >(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const expenseFilters: TransactionFilters = {
    category: expenseCategory,
    startDate: expenseStartDate ?? null,
    endDate: expenseEndDate ?? null,
    minAmount: expenseMinAmount,
    maxAmount: expenseMaxAmount,
  };

  const incomeFilters: TransactionFilters = {
    category: incomeCategory,
    startDate: incomeStartDate ?? null,
    endDate: incomeEndDate ?? null,
    minAmount: incomeMinAmount,
    maxAmount: incomeMaxAmount,
  };

  const expenseActiveFilterCount = countActiveFilters(
    expenseCategory,
    expenseStartDate,
    expenseEndDate,
    expenseMinAmount,
    expenseMaxAmount,
  );

  const incomeActiveFilterCount = countActiveFilters(
    incomeCategory,
    incomeStartDate,
    incomeEndDate,
    incomeMinAmount,
    incomeMaxAmount,
  );

  const handleApplyExpenseFilters = (filters: TransactionFilters) => {
    setParams({
      expenseCategory: filters.category,
      expenseStartDate: filters.startDate,
      expenseEndDate: filters.endDate,
      expenseMinAmount: filters.minAmount,
      expenseMaxAmount: filters.maxAmount,
      expensePage: 1,
    });
  };

  const handleApplyIncomeFilters = (filters: TransactionFilters) => {
    setParams({
      incomeCategory: filters.category,
      incomeStartDate: filters.startDate,
      incomeEndDate: filters.endDate,
      incomeMinAmount: filters.minAmount,
      incomeMaxAmount: filters.maxAmount,
      incomePage: 1,
    });
  };

  const handleExpensePageChange = (newPage: number) => {
    setParams({ expensePage: newPage });
  };

  const handleIncomePageChange = (newPage: number) => {
    setParams({ incomePage: newPage });
  };

  // Switching tabs clears both tabs' filters & pagination back to defaults
  // (clearOnDefault removes them from the URL entirely).
  const handleTabChange = (value: string) => {
    setParams({
      tab: value,
      expenseCategory: "",
      expenseStartDate: null,
      expenseEndDate: null,
      expenseMinAmount: 0,
      expenseMaxAmount: TRANSACTION_INFO.maxPrice,
      expensePage: PAGINATION.DEFAULT_PAGE,
      expensePageSize: PAGINATION.DEFAULT_PAGE_SIZE,
      expenseSortField: null,
      expenseSortDirection: null,
      incomeCategory: "",
      incomeStartDate: null,
      incomeEndDate: null,
      incomeMinAmount: 0,
      incomeMaxAmount: TRANSACTION_INFO.maxPrice,
      incomePage: PAGINATION.DEFAULT_PAGE,
      incomePageSize: PAGINATION.DEFAULT_PAGE_SIZE,
      incomeSortField: null,
      incomeSortDirection: null,
    });
  };

  const handleResize = useCallback(() => {
    setIsLargeScreen(window.innerWidth > 768);
  }, []);

  useEffect(() => {
    if (typeof window !== "undefined") {
      handleResize();
      window.addEventListener("resize", handleResize);
      return () => window.removeEventListener("resize", handleResize);
    }
  }, [handleResize]);

  // trpc calls
  // revenue
  const { data: revenueProjections, isLoading: isRevenueLoading } =
    useSuspenseQuery(trpc.adminSettingss.getAllRevenueData.queryOptions());

  // expense
  // expense — filtered & paginated by the current URL params
  const { data: expenseData, isLoading: isExpenseLoading } = useSuspenseQuery(
    trpc.adminSettingss.getFilteredExpenses.queryOptions({
      startDate: expenseStartDate ?? undefined,
      endDate: expenseEndDate ?? undefined,
      category: expenseCategory || "ALL",
      minAmount: expenseMinAmount,
      maxAmount: expenseMaxAmount,
      page: expensePage,
      pageSize: expensePageSize,
      sortField: expenseSortField ?? undefined,
      sortDirection: expenseSortDirection ?? undefined,
    }),
  );
  const expenses = expenseData?.expenses ?? [];
  const expenseCategories = expenseData.expenseCategoryList ?? [];

  // income — filtered & paginated by the current URL params
  const { data: incomeData, isLoading: isIncomeLoading } = useSuspenseQuery(
    trpc.adminSettingss.getFilteredIncomes.queryOptions({
      startDate: incomeStartDate ?? undefined,
      endDate: incomeEndDate ?? undefined,
      category: incomeCategory || "ALL",
      minAmount: incomeMinAmount,
      maxAmount: incomeMaxAmount,
      page: incomePage,
      pageSize: incomePageSize,
      sortField: incomeSortField ?? undefined,
      sortDirection: incomeSortDirection ?? undefined,
    }),
  );
  const incomes = incomeData?.incomes ?? [];
  const incomeCategories = incomeData?.incomeCategoryList ?? [];

  const deleteExpenseMutation = useMutation(
    trpc.adminSettingss.deleteExpense.mutationOptions({
      onSuccess: async () => {
        toast.success("Expense deleted successfully");
        queryClient.invalidateQueries(
          trpc.adminSettingss.getAllExpenseData.queryOptions(),
        );
      },
      onError: (error) => {
        toast.error(error.message ?? "Failed to delete expense.");
      },
    }),
  );

  const deleteIncomeMutation = useMutation(
    trpc.adminSettingss.deleteIncome.mutationOptions({
      onSuccess: async () => {
        toast.success("Income deleted successfully");
        queryClient.invalidateQueries(
          trpc.adminSettingss.getAllIncomeData.queryOptions(),
        );
      },
      onError: (error) => {
        toast.error(error.message ?? "Failed to delete income.");
      },
    }),
  );

  const deleteRevenueMutation = useMutation(
    trpc.adminSettingss.deleteRevenue.mutationOptions({
      onSuccess: async () => {
        toast.success("Revenue deleted successfully");
        queryClient.invalidateQueries(
          trpc.adminSettingss.getAllRevenueData.queryOptions(),
        );
      },
      onError: (error) => {
        toast.error(error.message ?? "Failed to delete revenue.");
      },
    }),
  );

  const deleteItem = (id: string, type: "Income" | "Expense" | "Revenue") => {
    if (type === "Income") {
      deleteIncomeMutation.mutate({ id });
    } else if (type === "Expense") {
      deleteExpenseMutation.mutate({ id });
    } else if (type === "Revenue") {
      deleteRevenueMutation.mutate({ id });
    }
  };

  // trpc to update monthly projections after updating revenue
  const updateRevenueMutation = useMutation(
    trpc.adminSettingss.updateRevenue.mutationOptions({
      onSuccess: async () => {
        toast.success("Revenue updated successfully");
        queryClient.invalidateQueries(
          trpc.adminSettingss.getAllRevenueData.queryOptions(),
        );
      },
      onError: (error) => {
        toast.error(error.message ?? "Failed to update revenue.");
      },
    }),
  );

  const updateMonthlyProjections = async (
    year: number,
    updatedProjections: YearlyRevenue["monthlyProjections"],
  ) => {
    const revenueToUpdate = revenueProjections?.find(
      (rev) => rev.year === year,
    );
    if (!revenueToUpdate) {
      toast.error("Revenue data not found for the specified year.");
      return;
    }

    const { id } = revenueToUpdate;

    try {
      updateRevenueMutation.mutate({
        id,
        monthlyProjections: updatedProjections.map((mp) => ({
          id: mp.id!,
          projection: mp.projection,
        })),
      });
    } catch (error) {
      toast.error("Failed to update monthly projections.");
    }
  };

  const handleEdit = (item: Income | Expense, type: "Income" | "Expense") => {
    setEditItem({ ...item, type });
    setIsDialogOpen(true);
  };

  const renderPaginationControls = (
    page: number,
    totalPages: number,
    hasNextPage: boolean,
    hasPreviousPage: boolean,
    onPageChange: (page: number) => void,
  ) => (
    <div className="flex items-center justify-end gap-2 px-2 py-3">
      <Button
        variant="outline"
        size="sm"
        onClick={() => onPageChange(1)}
        disabled={page === 1}
      >
        <ChevronsLeft className="size-4" />
      </Button>
      <Button
        variant="outline"
        size="sm"
        onClick={() => onPageChange(page - 1)}
        disabled={!hasPreviousPage}
      >
        Previous
      </Button>
      <span className="text-sm font-medium px-2">
        Page {page} of {totalPages || 1}
      </span>
      <Button
        variant="outline"
        size="sm"
        onClick={() => onPageChange(page + 1)}
        disabled={!hasNextPage}
      >
        Next
      </Button>
      <Button
        variant="outline"
        size="sm"
        onClick={() => onPageChange(totalPages)}
        disabled={page >= totalPages}
      >
        <ChevronsRight className="size-4" />
      </Button>
    </div>
  );

  return (
    <div className="flex flex-col gap-4 p-4 md:p-6">
      <h2 className="font-semibold text-2xl md:text-3xl text-center mb-6">
        Settings
      </h2>
      <Tabs
        defaultValue="General Settings"
        value={activeTab}
        className="space-y-4"
        onValueChange={handleTabChange}
      >
        <TabsList className="w-full mb-6">
          {isLargeScreen ? (
            <div className="flex justify-between w-full">
              {settingsValue.map((tab) => (
                <TabsTrigger
                  key={tab.name}
                  value={tab.name}
                  className="flex-1 flex items-center"
                >
                  <tab.icon className="mr-2 size-3" />
                  {tab.name}
                </TabsTrigger>
              ))}
            </div>
          ) : (
            <div className="relative w-full">
              <Carousel className="w-full">
                <CarouselContent className="flex">
                  {settingsValue.map((tab) => (
                    <CarouselItem
                      key={tab.name}
                      className="basis-1/3 md:basis-1/4 lg:basis-1/5"
                    >
                      <TabsTrigger
                        value={tab.name}
                        className="w-full px-2 py-2 text-xs md:text-sm "
                      >
                        <tab.icon className="mr-1 size-3" />
                        <span className="truncate">{tab.name}</span>
                      </TabsTrigger>
                    </CarouselItem>
                  ))}
                </CarouselContent>
                {/* Carousel navigation buttons */}
                <CarouselPrevious className="absolute top-1/2 left-0 transform -translate-y-1/2">
                  <Button className="p-2 bg-gray-200 rounded-full shadow">
                    <ChevronLeft />
                  </Button>
                </CarouselPrevious>
                <CarouselNext className="absolute top-1/2 right-0 transform -translate-y-1/2">
                  <Button className="p-2 bg-gray-200 rounded-full shadow">
                    <ChevronRight />
                  </Button>
                </CarouselNext>
              </Carousel>
            </div>
          )}
        </TabsList>

        {/* General Settings Tab View */}
        <TabsContent value="General Settings" className="space-y-4">
          <GeneralSettings />
        </TabsContent>

        {/* Revenue Projections Tab View */}
        <TabsContent value="Revenue Projections" className="space-y-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Revenue Projections</CardTitle>
              {!showForm && (
                <Button onClick={() => setShowForm("Revenue")} variant="create">
                  Add New Year Projection
                </Button>
              )}
            </CardHeader>
            <CardContent>
              <div className="mb-4">
                {showForm === "Revenue" && (
                  <SettingsForm
                    variant="Revenue"
                    onClose={() => setShowForm(null)}
                    isEditing={false}
                  />
                )}
              </div>
              <YearlyRevenueAccordion
                revenueProjections={revenueProjections}
                onUpdate={updateMonthlyProjections}
              />
            </CardContent>
          </Card>
        </TabsContent>

        {/* Expense Tab View */}
        <TabsContent value="Expense" className="space-y-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Expense Tracking</CardTitle>
              <div className="flex items-center gap-2">
                <SettingsFilterDrawer
                  variant="Expense"
                  categories={expenseCategories ?? []}
                  filters={expenseFilters}
                  onApply={handleApplyExpenseFilters}
                  activeCount={expenseActiveFilterCount}
                />
                {!showForm && (
                  <Button
                    onClick={() => setShowForm("Expense")}
                    variant="create"
                  >
                    Add New Expense
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent>
              <div className="mb-2">
                {showForm === "Expense" && (
                  <SettingsForm
                    variant="Expense"
                    onClose={() => setShowForm(null)}
                    initialData={null}
                    isEditing={false}
                  />
                )}
              </div>
              <SettingsTable
                variant="Expense"
                data={expenses}
                onEdit={(item) => handleEdit(item, "Expense")}
                onDelete={(id) => deleteItem(id, "Expense")}
              />
              {!isExpenseLoading &&
                renderPaginationControls(
                  expensePage,
                  expenseData?.totalPages ?? 1,
                  expenseData?.hasNextPage ?? false,
                  expenseData?.hasPreviousPage ?? false,
                  handleExpensePageChange,
                )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Income Tab View */}
        <TabsContent value="Income" className="space-y-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Income</CardTitle>
              <div className="flex items-center gap-2">
                <SettingsFilterDrawer
                  variant="Income"
                  categories={incomeCategories ?? []}
                  filters={incomeFilters}
                  onApply={handleApplyIncomeFilters}
                  activeCount={incomeActiveFilterCount}
                />
                {!showForm && (
                  <Button
                    onClick={() => setShowForm("Income")}
                    variant="create"
                  >
                    Add New Income
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent>
              <div className="mb-2">
                {showForm === "Income" && (
                  <SettingsForm
                    variant="Income"
                    onClose={() => setShowForm(null)}
                    initialData={null}
                    isEditing={false}
                  />
                )}
              </div>
              <SettingsTable
                variant="Income"
                data={incomes}
                onEdit={(item) => handleEdit(item, "Income")}
                onDelete={(id) => deleteItem(id, "Income")}
              />
              {!isIncomeLoading &&
                renderPaginationControls(
                  incomePage,
                  incomeData?.totalPages ?? 1,
                  incomeData?.hasNextPage ?? false,
                  incomeData?.hasPreviousPage ?? false,
                  handleIncomePageChange,
                )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogTitle className="sr-only">
            {editItem ? `Edit ${editItem.type}` : "Add Item"}
          </DialogTitle>
          <SettingsForm
            variant={editItem?.type || "Income"}
            onClose={() => {
              setIsDialogOpen(false);
              setEditItem(null);
            }}
            initialData={editItem}
            isEditing={!!editItem}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
};
