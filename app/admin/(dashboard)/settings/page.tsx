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
import { SettingsTable } from "@/components/custom/settings/settings-table";
import { SettingsForm } from "@/components/custom/settings/settings-form";
import { YearlyRevenueAccordion } from "@/components/custom/settings/yearly-revenue-accordion";

const settingsValue = [
  { name: "General Settings", icon: Settings },
  { name: "Revenue Projections", icon: TrendingUp },
  { name: "Expense", icon: DollarSign },
  { name: "Income", icon: Briefcase },
];

const AdminSetting = () => {
  const [isLargeScreen, setIsLargeScreen] = useState(false);

  const [revenueProjections, setRevenueProjections] = useState<YearlyRevenue[]>(
    []
  );

  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [incomes, setIncomes] = useState<Income[]>([]);

  const [showForm, setShowForm] = useState<
    "Revenue" | "Income" | "Expense" | null
  >(null);

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

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [revenueResponse, expenseResponse, incomesResponse] =
          await Promise.all([
            fetch("/api/admin/revenue"),
            fetch("/api/admin/expense"),
            fetch("/api/admin/income"),
          ]);

        const [revenueData, expenseData, incomeData] = await Promise.all([
          revenueResponse.json(),
          expenseResponse.json(),
          incomesResponse.json(),
        ]);

        setRevenueProjections(revenueData);
        setExpenses(expenseData);
        setIncomes(incomeData);
      } catch (error) {
        console.error("Failed to fetch data", error);
      }
    };

    fetchData();
  });

  //Database functions
  const addRevenueProjection = async (
    event: React.FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();
    const form = event.currentTarget;
    const formData = new FormData(form);
    const year = parseInt(formData.get("year") as string);
    const yearlyTarget = parseFloat(formData.get("yearlyTarget") as string);

    const monthlyTarget = yearlyTarget / 12;
    const months = [
      "January",
      "February",
      "March",
      "April",
      "May",
      "June",
      "July",
      "August",
      "September",
      "October",
      "November",
      "December",
    ];

    const newProjection: YearlyRevenue = {
      year,
      yearlyTarget,
      monthlyProjections: months.map((month) => ({
        month,
        projection: monthlyTarget,
        actual: 0,
      })),
    };

    try {
      const response = await fetch("/api/revenue", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newProjection),
      });

      if (response.ok) {
        const createdRevenue = await response.json();
        setRevenueProjections([...revenueProjections, createdRevenue]);
        form.reset();
        setShowForm(null);
      } else {
        console.error("Failed to create revenue projection");
      }
    } catch (error) {
      console.error("Error creating revenue projection:", error);
    }
  };

  const updateMonthlyProjections = async (
    year: number,
    updatedProjections: YearlyRevenue["monthlyProjections"]
  ) => {
    const revenueToUpdate = revenueProjections.find(
      (proj) => proj.year === year
    );
    if (!revenueToUpdate) return;

    try {
      const response = await fetch("/api/revenue", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id: revenueToUpdate.id,
          year: revenueToUpdate.year,
          yearlyTarget: revenueToUpdate.yearlyTarget,
          monthlyProjections: updatedProjections,
        }),
      });

      if (response.ok) {
        const updatedRevenue = await response.json();
        setRevenueProjections((prevProjections) =>
          prevProjections.map((proj) =>
            proj.year === year ? updatedRevenue : proj
          )
        );
      } else {
        console.error("Failed to update revenue projection");
      }
    } catch (error) {
      console.error("Error updating revenue projection:", error);
    }
  };

  const addExpense = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = event.currentTarget;
    const formData = new FormData(form);
    const newExpense: Expense = {
      name: formData.get("name") as string,
      category: formData.get("category") as string,
      amount: parseFloat(formData.get("amount") as string),
      date: formData.get("date") as string,
    };

    try {
      const response = await fetch("/api/expense", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newExpense),
      });

      if (response.ok) {
        const createdExpense = await response.json();
        setExpenses([...expenses, createdExpense]);
        form.reset();
        setShowForm(null);
      } else {
        console.error("Failed to create expense");
      }
    } catch (error) {
      console.error("Error creating expense:", error);
    }
  };

  const addIncome = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = event.currentTarget;
    const formData = new FormData(form);
    const newIncome: Income = {
      name: formData.get("name") as string,
      category: formData.get("category") as string,
      amount: parseFloat(formData.get("amount") as string),
      date: formData.get("date") as string,
    };

    try {
      const response = await fetch("/api/income", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newIncome),
      });

      if (response.ok) {
        const createdIncome = await response.json();
        setIncomes([...incomes, createdIncome]);
        form.reset();
        setShowForm(null);
      } else {
        console.error("Failed to create income");
      }
    } catch (error) {
      console.error("Error creating income:", error);
    }
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
                <TabsTrigger key={tab.name} value={tab.name} className="flex-1">
                  <tab.icon className="mr-2 h-4 w-4" />
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
                        className="w-full px-2 py-2 text-xs md:text-sm"
                      >
                        <tab.icon className="mb-1 h-4 w-4" />
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
              <div className="space-y-2">
                <Label htmlFor="company-name">Company Name</Label>
                <Input id="company-name" placeholder="Enter company name" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Contact Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter contact email"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Customer Service Number</Label>
                <Input
                  id="phone"
                  type="phone"
                  placeholder="Enter contact number"
                />
              </div>
              <div className="flex justify-end mt-2">
                <Button className="bg-[#1cd396]">Save Changes</Button>
              </div>
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
                    onSubmit={addRevenueProjection}
                    onClose={() => setShowForm(null)}
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
                    onSubmit={addExpense}
                    onClose={() => setShowForm(null)}
                  />
                )}
              </div>
              <SettingsTable variant="Expense" data={expenses} />
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
                    onSubmit={addIncome}
                    onClose={() => setShowForm(null)}
                  />
                )}
              </div>
              <SettingsTable variant="Income" data={incomes} />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminSetting;
