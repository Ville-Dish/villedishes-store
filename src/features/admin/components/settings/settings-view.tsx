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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Briefcase,
  ChevronLeft,
  ChevronRight,
  DollarSign,
  Settings,
  TrendingUp,
} from "lucide-react";
import React, { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { Expense, Income, YearlyRevenue } from "@/lib/types";
import { YearlyRevenueAccordion } from "./yearly-revenue-accordion";
import { SettingsForm } from "./settings-form";
import { SettingsTable } from "./settings-table";
import { useTRPC } from "@/trpc/client";
import {
  useMutation,
  useQueryClient,
  useSuspenseQuery,
} from "@tanstack/react-query";

const settingsValue = [
  { name: "General Settings", icon: Settings },
  { name: "Revenue Projections", icon: TrendingUp },
  { name: "Expense", icon: DollarSign },
  { name: "Income", icon: Briefcase },
];

export const SettingsView = () => {
  const trpc = useTRPC();
  const queryClient = useQueryClient();

  const [isLargeScreen, setIsLargeScreen] = useState(false);

  const [showForm, setShowForm] = useState<
    "Revenue" | "Income" | "Expense" | null
  >(null);

  const [editItem, setEditItem] = useState<
    ((Income | Expense) & { type?: "Income" | "Expense" }) | null
  >(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [generalSettings, setGeneralSettings] = useState({
    companyName: "VilleDishes",
    email: "villedishes@gmail.com",
    phone: "012-345-6789",
  });

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
  const { data: expenses, isLoading: isExpenseLoading } = useSuspenseQuery(
    trpc.adminSettingss.getAllExpenseData.queryOptions(),
  );

  // income
  const { data: incomes, isLoading: isIncomeLoading } = useSuspenseQuery(
    trpc.adminSettingss.getAllIncomeData.queryOptions(),
  );

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

  const updateGeneralSettings = async (
    event: React.FormEvent<HTMLFormElement>,
  ) => {
    event.preventDefault();
    const form = event.currentTarget;
    const formData = new FormData(form);
    const updatedSettings = {
      companyName: formData.get("company-name") as string,
      email: formData.get("email") as string,
      phone: formData.get("phone") as string,
    };

    setGeneralSettings(updatedSettings);

    console.log({ generalSettings });
    toast.success("General Settings updated successfully");

    // try {
    //   const response = await fetch("/api/admin/settings", {
    //     method: "PUT",
    //     headers: { "Content-Type": "application/json" },
    //     body: JSON.stringify(updatedSettings),
    //   });

    //   if (response.ok) {
    //     setGeneralSettings(updatedSettings);
    //   } else {
    //     console.error("Failed to update general settings");
    //   }
    // } catch (error) {
    //   console.error("Error updating general settings:", error);
    // }
  };

  return (
    <div className="flex flex-col gap-4 p-4 md:p-6">
      <h2 className="font-semibold text-2xl md:text-3xl text-center mb-6">
        Settings
      </h2>
      <Tabs defaultValue="General Settings" className="space-y-4">
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
          <Card>
            <CardHeader>
              <CardTitle>General Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <form onSubmit={updateGeneralSettings}>
                <div className="space-y-2">
                  <Label htmlFor="company-name">Company Name</Label>
                  <Input
                    id="company-name"
                    name="company-name"
                    defaultValue={generalSettings.companyName}
                    placeholder="Enter company name"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Contact Email</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    defaultValue={generalSettings.email}
                    placeholder="Enter contact email"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Customer Service Number</Label>
                  <Input
                    id="phone"
                    name="phone"
                    type="tel"
                    defaultValue={generalSettings.phone}
                    placeholder="Enter contact number"
                  />
                </div>
                <div className="flex justify-end mt-2">
                  <Button type="submit" variant="submit">
                    Save Changes
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
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
              {!showForm && (
                <Button onClick={() => setShowForm("Expense")} variant="create">
                  Add New Expense
                </Button>
              )}
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
            </CardContent>
          </Card>
        </TabsContent>

        {/* Income Tab View */}
        <TabsContent value="Income" className="space-y-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Income</CardTitle>
              {!showForm && (
                <Button onClick={() => setShowForm("Income")} variant="create">
                  Add New Income
                </Button>
              )}
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
