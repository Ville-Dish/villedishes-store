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
  PieChart,
  Settings,
  TrendingUp,
} from "lucide-react";
import React, { useCallback, useEffect, useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Switch } from "@/components/ui/switch";

const settingsValue = [
  { name: "General Settings", icon: Settings },
  { name: "Revenue Projections", icon: TrendingUp },
  { name: "Expense", icon: DollarSign },
  { name: "Income", icon: Briefcase },
  { name: "Budget", icon: PieChart },
];

interface YearlyProjection {
  type: "yearly";
  year: number;
  amount: number;
}

interface MonthlyProjection {
  type: "monthly";
  year: number;
  month: string;
  amount: number;
}

type RevenueProjection = YearlyProjection | MonthlyProjection;

const AdminSetting = () => {
  // const [activeTab, setActiveTab] = useState("General Settings");
  const [isLargeScreen, setIsLargeScreen] = useState(false);

  const [revenueProjections, setRevenueProjections] = useState<
    RevenueProjection[]
  >([
    { type: "monthly", year: 2023, month: "January", amount: 10000 },
    { type: "monthly", year: 2023, month: "February", amount: 12000 },
    { type: "yearly", year: 2023, amount: 150000 },
  ]);
  const [expenses, setExpenses] = useState([
    { category: "Office Supplies", amount: 500 },
    { category: "Utilities", amount: 1000 },
  ]);
  const [incomes, setIncomes] = useState([
    { source: "Product Sales", amount: 15000 },
    { source: "Consulting", amount: 5000 },
  ]);
  const [budgets, setBudgets] = useState([
    { category: "Marketing", amount: 5000 },
    { category: "R&D", amount: 10000 },
  ]);

  const [isYearlyProjection, setIsYearlyProjection] = useState(false);

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
    const newProjection: RevenueProjection = isYearlyProjection
      ? {
          type: "yearly",
          year: parseInt(formData.get("year") as string),
          amount: parseFloat(formData.get("amount") as string),
        }
      : {
          type: "monthly",
          year: parseInt(formData.get("year") as string),
          month: formData.get("month") as string,
          amount: parseFloat(formData.get("amount") as string),
        };
    setRevenueProjections([...revenueProjections, newProjection]);
    form.reset();
  };

  const addExpense = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = event.currentTarget;
    const formData = new FormData(form);
    const newExpense = {
      category: formData.get("category") as string,
      amount: parseFloat(formData.get("amount") as string),
    };
    setExpenses([...expenses, newExpense]);
    form.reset();
  };

  const addIncome = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = event.currentTarget;
    const formData = new FormData(form);
    const newIncome = {
      source: formData.get("source") as string,
      amount: parseFloat(formData.get("amount") as string),
    };
    setIncomes([...incomes, newIncome]);
    form.reset();
  };

  const addBudget = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = event.currentTarget;
    const formData = new FormData(form);
    const newBudget = {
      category: formData.get("category") as string,
      amount: parseFloat(formData.get("amount") as string),
    };
    setBudgets([...budgets, newBudget]);
    form.reset();
  };

  return (
    <div className="flex flex-col gap-4 p-4 md:p-6">
      <h2 className="font-semibold text-2xl md:text-3xl text-center mb-6">
        Settings
      </h2>
      <Tabs
        defaultValue="General Settings"
        className="space-y-4"
        // onValueChange={setActiveTab}
      >
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
              <Button>Save Changes</Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Revenue Projections Tab View */}
        <TabsContent value="Revenue Projections" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Revenue Projections</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Year</TableHead>
                    <TableHead>Month</TableHead>
                    <TableHead>Amount</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {revenueProjections.map((projection, index) => (
                    <TableRow key={index}>
                      <TableCell>{projection.year}</TableCell>
                      <TableCell>
                        {projection.type === "monthly"
                          ? projection.month
                          : "Yearly"}
                      </TableCell>
                      <TableCell>
                        ${projection.amount.toLocaleString()}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              <section>
                <form
                  onSubmit={addRevenueProjection}
                  className="mt-4 space-y-4"
                >
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="yearly-projection"
                      checked={isYearlyProjection}
                      onCheckedChange={setIsYearlyProjection}
                    />
                    <Label htmlFor="projection-type">
                      {isYearlyProjection
                        ? "Yearly Projection"
                        : "Monthly Projection"}
                    </Label>
                  </div>
                  <div className="flex space-x-4">
                    <div className="flex-1">
                      <Label htmlFor="year">Year</Label>
                      <Input id="year" name="year" type="number" required />
                    </div>
                    {!isYearlyProjection && (
                      <div className="flex-1">
                        <Label htmlFor="month">Month</Label>
                        <Select name="month" required>
                          <SelectTrigger>
                            <SelectValue placeholder="Select month" />
                          </SelectTrigger>
                          <SelectContent>
                            {[
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
                            ].map((month) => (
                              <SelectItem key={month} value={month}>
                                {month}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    )}
                    <div className="flex-1">
                      <Label htmlFor="amount">Amount</Label>
                      <Input id="amount" name="amount" type="number" required />
                    </div>
                  </div>
                  <Button type="submit">Add Projection</Button>
                </form>
              </section>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Expense Tab View */}
        <TabsContent value="Expense" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Expense Tracking</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Category</TableHead>
                    <TableHead>Amount</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {expenses.map((expense, index) => (
                    <TableRow key={index}>
                      <TableCell>{expense.category}</TableCell>
                      <TableCell>${expense.amount.toLocaleString()}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              <form onSubmit={addExpense} className="mt-4 space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="expense-category">Expense Category</Label>
                  <Input
                    id="expense-category"
                    name="category"
                    placeholder="Enter expense category"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="expense-amount">Amount</Label>
                  <Input
                    id="expense-amount"
                    name="amount"
                    type="number"
                    placeholder="Enter amount"
                    required
                  />
                </div>
                <Button type="submit">Add Expense</Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Income Tab View */}
        <TabsContent value="Income" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Income</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Source</TableHead>
                    <TableHead>Amount</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {incomes.map((income, index) => (
                    <TableRow key={index}>
                      <TableCell>{income.source}</TableCell>
                      <TableCell>${income.amount.toLocaleString()}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              <form onSubmit={addIncome} className="mt-4 space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="income-source">Income Source</Label>
                  <Input
                    id="income-source"
                    name="source"
                    placeholder="Enter income source"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="income-amount">Amount</Label>
                  <Input
                    id="income-amount"
                    name="amount"
                    type="number"
                    placeholder="Enter amount"
                    required
                  />
                </div>
                <Button type="submit">Add Income</Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Budget Tab View */}
        <TabsContent value="Budget" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Budget Overview</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Category</TableHead>
                    <TableHead>Amount</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {budgets.map((budget, index) => (
                    <TableRow key={index}>
                      <TableCell>{budget.category}</TableCell>
                      <TableCell>${budget.amount.toLocaleString()}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              <form onSubmit={addBudget} className="mt-4 space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="budget-category">Budget Category</Label>
                  <Input
                    id="budget-category"
                    name="category"
                    placeholder="Enter budget category"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="budget-amount">Amount</Label>
                  <Input
                    id="budget-amount"
                    name="amount"
                    type="number"
                    placeholder="Enter amount"
                    required
                  />
                </div>
                <Button type="submit">Add Budget</Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminSetting;
