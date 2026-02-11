"use client";

import React, { useState } from "react";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  createInvoiceSchema,
  CreateInvoiceSchema,
} from "@/lib/schemas/invoiceSchema";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { CustomPhoneInput } from "../phone-input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { cn, formatDate } from "@/lib/utils";
import { addMonths, format } from "date-fns";
import { CalendarIcon, Loader2Icon } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import { toast } from "sonner";

interface InvoiceFormProps {
  setDialog: (value: boolean) => void;
  setSelectedInvoice: (data: Invoice | null) => void;
}

export const InvoiceForm = ({
  setDialog,
  setSelectedInvoice,
}: InvoiceFormProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const form = useForm<CreateInvoiceSchema>({
    resolver: zodResolver(createInvoiceSchema),
    defaultValues: {
      customerName: "",
      customerEmail: "",
      customerPhone: "",
      amount: 1,
      dueDate: new Date(),
      status: "PENDING",
    },
  });

  const onSubmit = async (values: CreateInvoiceSchema) => {
    const validatedFields = await createInvoiceSchema.safeParseAsync({
      values,
    });

    if (!validatedFields.success) {
      toast.error(
        validatedFields.error.message || "Please fill in all required fields",
      );
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch("/api/invoices", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...validatedFields.data,
          dateCreated: new Date().toISOString().split("T")[0],
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        toast.error(`Failed to create invoice: ${result.message}`);
      }

      toast.success(
        "Invoice created successfully! Complete the invoice in Invoice Details",
      );
      form.reset();
      setDialog(false);

      // Open the edit invoice
      setSelectedInvoice(result.data);
    } catch (error) {
      toast.error("An unexpected error occurred. Please try again.");
      console.error("Error creating invoice:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="overflow-y-auto">
      <CardHeader>
        <CardTitle className="text-lg">Invoice Form</CardTitle>
        <CardDescription>
          Please provide the details for new invoice
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-6 w-full min-w-0"
          >
            {/* Customer name */}
            <FormField
              control={form.control}
              name="customerName"
              render={({ field }) => (
                <FormItem className="space-y-2">
                  <FormLabel className="after:content-['*'] after:text-sm after:text-red-500 after:-ml-1 -mt-1">
                    Customer Name
                  </FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      id="customerName"
                      name="customerName"
                      placeholder="Customer Name"
                      disabled={isLoading}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Customer email */}
            <FormField
              control={form.control}
              name="customerEmail"
              render={({ field }) => (
                <FormItem className="space-y-2">
                  <FormLabel className="after:content-['*'] after:text-sm after:text-red-500 after:-ml-1 -mt-1">
                    Customer Email
                  </FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      id="customerEmail"
                      name="customerEmail"
                      placeholder="Customer Email"
                      disabled={isLoading}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Customer phone */}
            <FormField
              control={form.control}
              name="customerPhone"
              render={({ field, fieldState }) => (
                <FormItem className="space-y-2">
                  <FormLabel className="after:content-['*'] after:text-sm after:text-red-500 after:-ml-1 -mt-1">
                    Customer Email
                  </FormLabel>
                  <FormControl>
                    <CustomPhoneInput
                      placeholder="(123) 456-7890"
                      defaultCountry="CA"
                      value={field.value}
                      onChange={field.onChange}
                      onBlur={field.onBlur}
                      error={fieldState.error}
                      disabled={isLoading}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Amount */}
            <FormField
              control={form.control}
              name="amount"
              render={({ field }) => (
                <FormItem className="space-y-2">
                  <FormLabel className="after:content-['*'] after:text-sm after:text-red-500 after:-ml-1 -mt-1">
                    Amount
                  </FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      id="amount"
                      name="amout"
                      //   placeholder="Customer Phone"
                      disabled={isLoading}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Due Date */}
            <FormField
              control={form.control}
              name="amount"
              render={({ field }) => {
                const today = new Date();
                today.setHours(0, 0, 0, 0);

                const maxEndMonth = addMonths(today, 12);
                return (
                  <FormItem className="space-y-2">
                    <FormLabel className="after:content-['*'] after:text-sm after:text-red-500 after:-ml-1 -mt-1">
                      Due Date
                    </FormLabel>
                    <FormControl>
                      <Popover>
                        <PopoverTrigger
                          asChild
                          className="w-full"
                          disabled={isLoading}
                        >
                          <FormControl>
                            <Button
                              variant={"outline"}
                              className={cn(
                                "w-full pl-3 text-left font-normal",
                                !field.value && "text-muted-foreground",
                              )}
                            >
                              {field.value ? (
                                format(
                                  // new Date(field.value),
                                  new Date(Date.now()),
                                  "PPP",
                                )
                              ) : (
                                <span>Select a date</span>
                              )}
                              <CalendarIcon className="ml-auto size-4 opacity-50" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-full p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={
                              field.value
                                ? new Date(formatDate(new Date(field.value)))
                                : undefined
                            }
                            onSelect={field.onChange}
                            endMonth={maxEndMonth}
                            defaultMonth={
                              field.value ? new Date(field.value) : today
                            }
                            disabled={(date) => date < today}
                            captionLayout="dropdown"
                          />
                        </PopoverContent>
                      </Popover>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                );
              }}
            />

            {/* Submit Button */}
            <div className="flex justify-end space-x-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setDialog(false)}
              >
                Cancel
              </Button>

              <Button
                type="submit"
                disabled={isLoading || !form.formState.isDirty}
              >
                {isLoading && <Loader2Icon className="size-4 animate-spin" />}
                {isLoading ? "Creating Invoice..." : "Create Invoice"}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};
