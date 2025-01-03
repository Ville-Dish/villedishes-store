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
    [
      {
        year: 2023,
        yearlyTarget: 1200000,
        monthlyProjections: [
          { month: "January", projection: 100000, actual: 95000 },
          { month: "February", projection: 100000, actual: 98000 },
          { month: "March", projection: 100000, actual: 105000 },
          { month: "April", projection: 100000, actual: 97000 },
          { month: "May", projection: 100000, actual: 102000 },
          { month: "June", projection: 100000, actual: 99000 },
          { month: "July", projection: 100000, actual: 103000 },
          { month: "August", projection: 100000, actual: 101000 },
          { month: "September", projection: 100000, actual: 98000 },
          { month: "October", projection: 100000, actual: 104000 },
          { month: "November", projection: 100000, actual: 106000 },
          { month: "December", projection: 100000, actual: 110000 },
        ],
      },
      {
        year: 2024,
        yearlyTarget: 1500000,
        monthlyProjections: [
          { month: "January", projection: 125000, actual: 125000 },
          { month: "February", projection: 125000, actual: 120000 },
          { month: "March", projection: 125000, actual: 115000 },
          { month: "April", projection: 125000, actual: 11000 },
          { month: "May", projection: 125000, actual: 25000 },
          { month: "June", projection: 125000, actual: 15000 },
          { month: "July", projection: 125000, actual: 15000 },
          { month: "August", projection: 125000, actual: 12500 },
          { month: "September", projection: 125000, actual: 1250 },
          { month: "October", projection: 125000, actual: 12500 },
          { month: "November", projection: 125000, actual: 125000 },
          { month: "December", projection: 125000, actual: 125200 },
        ],
      },
    ]
  );

  const [expenses, setExpenses] = useState<Expense[]>([
    {
      name: "Office Supplies",
      category: "Operational",
      amount: 500,
      date: "2023-05-15",
    },
    {
      name: "Utilities",
      category: "Operational",
      amount: 1000,
      date: "2023-05-20",
    },
  ]);
  const [incomes, setIncomes] = useState<Income[]>([
    {
      name: "Product Sales",
      category: "Sales",
      amount: 15000,
      date: "2023-05-10",
    },
    {
      name: "Consulting",
      category: "Services",
      amount: 5000,
      date: "2023-05-18",
    },
  ]);

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

  const addRevenueProjection = (event: React.FormEvent<HTMLFormElement>) => {
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

    setRevenueProjections([...revenueProjections, newProjection]);
    form.reset();
    setShowForm(null);
  };

  const updateMonthlyProjections = (
    year: number,
    updatedProjections: YearlyRevenue["monthlyProjections"]
  ) => {
    setRevenueProjections((prevProjections) =>
      prevProjections.map((proj) =>
        proj.year === year
          ? { ...proj, monthlyProjections: updatedProjections }
          : proj
      )
    );
  };

  const addExpense = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = event.currentTarget;
    const formData = new FormData(form);
    const newExpense: Expense = {
      name: formData.get("name") as string,
      category: formData.get("category") as string,
      amount: parseFloat(formData.get("amount") as string),
      date: formData.get("date") as string,
    };
    setExpenses([...expenses, newExpense]);
    form.reset();
    setShowForm(null);
  };

  const addIncome = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = event.currentTarget;
    const formData = new FormData(form);
    const newIncome: Income = {
      name: formData.get("name") as string,
      category: formData.get("category") as string,
      amount: parseFloat(formData.get("amount") as string),
      date: formData.get("date") as string,
    };
    setIncomes([...incomes, newIncome]);
    form.reset();
    setShowForm(null);
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
