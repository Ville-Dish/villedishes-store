import React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { X } from "lucide-react";
import { Expense, Income, YearlyRevenue } from "@/lib/types";
import { useForm } from "react-hook-form";
import {
  incomeExpenseSchema,
  IncomeExpenseValue,
  revenueSchema,
  RevenueValue,
} from "../../lib/schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTRPC } from "@/trpc/client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

interface SettingsFormProps {
  variant: "Revenue" | "Income" | "Expense";
  onClose: () => void;
  initialData?: Income | Expense | null;
  isEditing: boolean;
}

export const SettingsForm: React.FC<SettingsFormProps> = ({
  variant,
  onClose,
  initialData,
  isEditing,
}) => {
  return (
    <section className="border rounded-md border-[#fff1e2]">
      {variant === "Revenue" && (
        <RevenueForm onClose={onClose} isEditing={isEditing} />
      )}
      {variant === "Income" && (
        <IncomeForm
          onClose={onClose}
          isEditing={isEditing}
          initialData={initialData as Income}
        />
      )}
      {variant === "Expense" && (
        <ExpenseForm
          onClose={onClose}
          isEditing={isEditing}
          initialData={initialData as Expense}
        />
      )}
    </section>
  );
};

// ─── Shared sub-components ────────────────────────────────────────────────────

const FormHeader: React.FC<{
  variant: string;
  isEditing: boolean;
  onClose: () => void;
}> = ({ variant, isEditing, onClose }) => (
  <div className="flex justify-between items-center mb-4">
    <h3 className="text-lg font-semibold">
      {isEditing ? `Edit ${variant}` : `Add ${variant}`}
    </h3>
    {!isEditing && (
      <Button variant="ghost" size="icon" onClick={onClose}>
        <X className="h-4 w-4 text-[#da281c]" />
        <span className="sr-only">Close</span>
      </Button>
    )}
  </div>
);

const FormFooter: React.FC<{ isEditing: boolean; variant: string }> = ({
  isEditing,
  variant,
}) => (
  <div className="flex justify-end mt-4">
    <Button type="submit" variant="submit">
      {isEditing ? `Update ${variant}` : `Add ${variant}`}
    </Button>
  </div>
);

// ─── Revenue Form ─────────────────────────────────────────────────────────────

const RevenueForm: React.FC<{ onClose: () => void; isEditing: boolean }> = ({
  onClose,
  isEditing,
}) => {
  const trpc = useTRPC();
  const queryClient = useQueryClient();

  const form = useForm<RevenueValue>({
    resolver: zodResolver(revenueSchema),
    defaultValues: {
      year: new Date().getFullYear(),
      yearlyTarget: 0,
      monthlyProjections: [],
    },
  });

  const createRevenue = useMutation(
    trpc.adminSettingss.addRevenue.mutationOptions({
      onSuccess: () => {
        toast.success("Revenue created successfully!");
        form.reset();
        queryClient.invalidateQueries(
          trpc.adminSettingss.getAllRevenueData.queryOptions(),
        );
        onClose();
      },
      onError: (error) => {
        toast.error(`Failed to create revenue: ${error.message}`);
      },
    }),
  );

  const updateRevenue = useMutation(
    trpc.adminSettingss.updateRevenue.mutationOptions({
      onSuccess: () => {
        toast.success("Revenue updated successfully!");
        form.reset();
        queryClient.invalidateQueries(
          trpc.adminSettingss.getAllRevenueData.queryOptions(),
        );
        onClose();
      },
      onError: (error) => {
        toast.error(`Failed to update revenue: ${error.message}`);
      },
    }),
  );

  const onSubmit = (values: RevenueValue) => {
    if (isEditing) {
      updateRevenue.mutate({
        id: values.id!,
        monthlyProjections: values.monthlyProjections,
      });
    } else {
      const { year, yearlyTarget } = values;
      const monthlyTarget = values.yearlyTarget / 12;
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

      const projectionData: YearlyRevenue = {
        year,
        yearlyTarget,
        monthlyProjections: months.map((month) => ({
          month,
          projection: monthlyTarget,
          actual: 0,
        })),
      };
      createRevenue.mutate(projectionData);
    }
  };

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="space-y-4 mx-6 my-2"
      >
        <FormHeader variant="Revenue" isEditing={isEditing} onClose={onClose} />

        <FormField
          control={form.control}
          name="year"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Year</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  {...field}
                  onChange={(e) => field.onChange(Number(e.target.value))}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="yearlyTarget"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Yearly Target</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  {...field}
                  onChange={(e) => field.onChange(Number(e.target.value))}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormFooter isEditing={isEditing} variant="Revenue" />
      </form>
    </Form>
  );
};

// ─── Income Form ──────────────────────────────────────────────────────────────

const IncomeForm: React.FC<{
  onClose: () => void;
  isEditing: boolean;
  initialData?: Income | null;
}> = ({ onClose, isEditing, initialData }) => {
  const trpc = useTRPC();
  const queryClient = useQueryClient();

  const form = useForm<IncomeExpenseValue>({
    resolver: zodResolver(incomeExpenseSchema),
    defaultValues: {
      name: initialData?.name || "",
      category: initialData?.category || "",
      amount: initialData?.amount || 0,
      date: initialData ? new Date(initialData.date) : new Date(),
    },
  });

  const createIncome = useMutation(
    trpc.adminSettingss.addIncome.mutationOptions({
      onSuccess: () => {
        toast.success("Income created successfully!");
        form.reset();
        queryClient.invalidateQueries(
          trpc.adminSettingss.getAllIncomeData.queryOptions(),
        );
        onClose();
      },
      onError: (error) => {
        toast.error(`Failed to create income: ${error.message}`);
      },
    }),
  );

  const updateIncome = useMutation(
    trpc.adminSettingss.updateIncome.mutationOptions({
      onSuccess: () => {
        toast.success("Income updated successfully!");
        form.reset();
        queryClient.invalidateQueries(
          trpc.adminSettingss.getAllIncomeData.queryOptions(),
        );
        onClose();
      },
      onError: (error) => {
        toast.error(`Failed to update income: ${error.message}`);
      },
    }),
  );

  const onSubmit = (values: IncomeExpenseValue) => {
    if (isEditing && initialData?.id) {
      updateIncome.mutate({ id: initialData.id, ...values });
    } else {
      createIncome.mutate(values);
    }
  };

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="space-y-4 mx-6 my-2"
      >
        <FormHeader variant="Income" isEditing={isEditing} onClose={onClose} />
        <IncomeExpenseFields variant="Income" form={form} />
        <FormFooter isEditing={isEditing} variant="Income" />
      </form>
    </Form>
  );
};

// ─── Expense Form ─────────────────────────────────────────────────────────────

const ExpenseForm: React.FC<{
  onClose: () => void;
  isEditing: boolean;
  initialData?: Expense | null;
}> = ({ onClose, isEditing, initialData }) => {
  const trpc = useTRPC();
  const queryClient = useQueryClient();

  const form = useForm<IncomeExpenseValue>({
    resolver: zodResolver(incomeExpenseSchema),
    defaultValues: {
      name: initialData?.name || "",
      category: initialData?.category || "",
      amount: initialData?.amount || 0,
      date: initialData ? new Date(initialData.date) : new Date(),
    },
  });

  const createExpense = useMutation(
    trpc.adminSettingss.addExpense.mutationOptions({
      onSuccess: () => {
        toast.success("Expense created successfully!");
        form.reset();
        queryClient.invalidateQueries(
          trpc.adminSettingss.getAllExpenseData.queryOptions(),
        );
        onClose();
      },
      onError: (error) => {
        toast.error(`Failed to create expense: ${error.message}`);
      },
    }),
  );

  const updateExpense = useMutation(
    trpc.adminSettingss.updateExpense.mutationOptions({
      onSuccess: () => {
        toast.success("Expense updated successfully!");
        form.reset();
        queryClient.invalidateQueries(
          trpc.adminSettingss.getAllExpenseData.queryOptions(),
        );
        onClose();
      },
      onError: (error) => {
        toast.error(`Failed to update expense: ${error.message}`);
      },
    }),
  );

  const onSubmit = (values: IncomeExpenseValue) => {
    if (isEditing && initialData?.id) {
      updateExpense.mutate({ id: initialData.id, ...values });
    } else {
      createExpense.mutate(values);
    }
  };

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="space-y-4 mx-6 my-2"
      >
        <FormHeader variant="Expense" isEditing={isEditing} onClose={onClose} />
        <IncomeExpenseFields variant="Expense" form={form} />
        <FormFooter isEditing={isEditing} variant="Expense" />
      </form>
    </Form>
  );
};

// ─── Shared income/expense fields ─────────────────────────────────────────────

const IncomeExpenseFields: React.FC<{
  variant: "Income" | "Expense";
  form: ReturnType<typeof useForm<IncomeExpenseValue>>;
}> = ({ variant, form }) => {
  const key = variant.toLowerCase();
  return (
    <>
      <FormField
        control={form.control}
        name="name"
        render={({ field }) => (
          <FormItem>
            <FormLabel>{variant} Name</FormLabel>
            <FormControl>
              <Input placeholder={`Enter ${key} name`} {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="category"
        render={({ field }) => (
          <FormItem>
            <FormLabel>{variant} Category</FormLabel>
            <FormControl>
              <Input placeholder={`Enter ${key} category`} {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="amount"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Amount</FormLabel>
            <FormControl>
              <Input
                type="number"
                placeholder="Enter amount"
                {...field}
                onChange={(e) => field.onChange(Number(e.target.value))}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="date"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Date</FormLabel>
            <FormControl>
              <Input
                type="date"
                value={
                  field.value instanceof Date
                    ? field.value.toISOString().split("T")[0]
                    : ""
                }
                onChange={(e) => field.onChange(new Date(e.target.value))}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </>
  );
};
