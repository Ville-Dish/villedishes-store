"use client";

import React, { useEffect, useState } from "react";

import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { PageHeader } from "../page-header";
import { testEmail } from "@/lib/constantData";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";
import { CalendarIcon, Check, CheckCircle, X } from "lucide-react";
import { MdFoodBank } from "react-icons/md";
import { Calendar } from "@/components/ui/calendar";
import { cn, formatDate } from "@/lib/utils";
import { addMonths, format } from "date-fns";
import Image from "next/image";

interface CateringDetails {
  name: string;
  email: string;
  cateringDate: Date;
  phone: string;
  message?: string;
  products: string[];
}

const formSchema = z.object({
  name: z.string().min(2, { message: "Name is required" }).max(50),
  email: z.email("Valid email is required"),
  phone: z.string().min(10, "Phone number must be at least 10 digits").max(12),
  cateringDate: z.date().min(1, "Catering date is required"),
  message: z.string().optional(),
  products: z.array(z.string()).min(1, "Please select at least one product"),
});

const CateringPage = () => {
  const [products, setProducts] = useState<MenuItem[]>([]);
  const [searchQuery, setSearchQuery] = useState("");

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      message: "",
      cateringDate: undefined,
      products: [],
    },
  });

  // Fetch products from the API
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await fetch("/api/menu", { method: "GET" });
        const data = await response.json();

        if (response.ok) {
          setProducts(data.data);
        } else {
          console.error("Error fetching products:", data.message);
        }
      } catch (error) {
        console.error("Error fetching products:", error);
      }
    };

    fetchProducts();
  }, []);

  const sendEmail = (cateringDetails: CateringDetails) => {
    fetch("/api/emails/catering", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: cateringDetails.email,
        to: process.env.SMTP_EMAIL || "villedishes@gmail.com",
        name: cateringDetails.name,
        email: cateringDetails.email,
        phone: cateringDetails.phone,
        products: cateringDetails.products,
        notStrictEqual: cateringDetails.message,
        date: cateringDetails.cateringDate,
      }),
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error("Failed to send email");
        }
        return response.json();
      })
      .then((data) => {
        toast.success("Email Sent", {
          description:
            "An email has been sent to the admin. You should get a response soon.",
        });
        // form.reset(); // Clear the form fields after successful submission
      })
      .catch((error) => {
        toast.error("Something went wrong", {
          description:
            error instanceof Error
              ? error.message
              : "An unknown error occurred",
        });
        console.error("Error sending email:", error);
      });
  };

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    console.log({ values });
    const cateringData = {
      name: values.name,
      email: values.email,
      phone: values.phone,
      cateringDate: values.cateringDate,
      products: values.products,
      messages: values.message,
    };

    console.log({ cateringData });
    sendEmail(cateringData);
  };

  const productsValue = form.watch("products");
  const selectedProducts = Array.isArray(productsValue) ? productsValue : [];

  const toggleProduct = (productName: string) => {
    const currentProducts = form.getValues("products");
    const isSelected = currentProducts.includes(productName);

    if (isSelected) {
      form.setValue(
        "products",
        currentProducts.filter((p) => p !== productName)
      );
    } else {
      form.setValue("products", [...currentProducts, productName]);
    }
  };

  const filteredProducts = products.filter((product) =>
    product.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="w-full flex flex-col gap-4 pl-8 pt-4">
      <main>
        <PageHeader title="Catering Order" url="/catering" />
        <section className="w-full py-2 md:py-4 lg:py-6">
          <div className="px-4 md:px-6">
            <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl text-center mb-3">
              Catering
            </h1>
            <div className="grid gap-6 lg:grid-cols-2 lg:gap-12 items-start">
              <div className="space-y-4">
                <p className="text-gray-500 dark:text-gray-400">
                  Fill the form below for your catering order to help us create
                  your invoice.
                </p>
                <div className="hidden md:grid md:grid-cols-2 md:gap-2">
                  <div className="overflow-hidden rounded-lg">
                    <Image
                      src="https://res.cloudinary.com/dxt7vk5dg/image/upload/v1741136078/Tray_of_Smokey_Party_Jollof_Rice_fx3v0v.jpg"
                      alt="Food"
                      width={350}
                      height={100}
                    />
                  </div>
                  <div className="overflow-hidden rounded-lg">
                    <Image
                      src="https://res.cloudinary.com/dxt7vk5dg/image/upload/v1741136076/fried_fish_m7paxv.jpg"
                      alt="Food"
                      width={350}
                      height={100}
                    />
                  </div>
                </div>
              </div>

              <Form {...form}>
                <form
                  onSubmit={form.handleSubmit(onSubmit)}
                  className="space-y-4"
                >
                  {/* Customer Name */}
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <Input placeholder="Name*" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Customer Email */}
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <Input placeholder="Email Address*" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Customer Phone Number */}
                  <FormField
                    control={form.control}
                    name="phone"
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <Input placeholder="Phone Number*" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Catering Date */}
                  <FormField
                    control={form.control}
                    name="cateringDate"
                    render={({ field }) => {
                      const today = new Date();
                      today.setHours(0, 0, 0, 0);
                      const maxDate = addMonths(today, 3);
                      const maxMonth = addMonths(today, 4);
                      return (
                        <FormItem>
                          <Popover>
                            <PopoverTrigger asChild>
                              <FormControl>
                                <Button
                                  variant={"outline"}
                                  className={cn(
                                    "w-full pl-3 text-left font-normal",
                                    !field.value && "text-muted-foreground"
                                  )}
                                >
                                  {field.value ? (
                                    format(field.value, "PPP")
                                  ) : (
                                    <span className="text-muted-foreground">
                                      Pick a catering date*
                                    </span>
                                  )}
                                  <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                </Button>
                              </FormControl>
                            </PopoverTrigger>
                            <PopoverContent
                              className="w-[var(--radix-popover-trigger-width)] p-0"
                              align="start"
                            >
                              <Calendar
                                mode="single"
                                selected={field.value}
                                onSelect={field.onChange}
                                disabled={(date) =>
                                  date < today || date > maxDate
                                }
                                defaultMonth={field.value || today}
                                endMonth={maxMonth}
                                captionLayout="dropdown"
                                className="w-auto"
                              />
                            </PopoverContent>
                          </Popover>
                          <FormMessage />
                        </FormItem>
                      );
                    }}
                  />

                  {/* Product List */}
                  <FormField
                    control={form.control}
                    name="products"
                    render={({ field }) => (
                      <FormItem>
                        <Popover>
                          <PopoverTrigger asChild>
                            <FormControl>
                              <Button
                                variant="outline"
                                role="combobox"
                                className={cn(
                                  "w-full justify-between",
                                  !selectedProducts.length &&
                                    "text-muted-foreground"
                                )}
                              >
                                {selectedProducts.length > 0
                                  ? `${selectedProducts.length} product${selectedProducts.length > 1 ? "s" : ""} selected`
                                  : "Select products*"}
                                <MdFoodBank className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                              </Button>
                            </FormControl>
                          </PopoverTrigger>
                          <PopoverContent
                            className="w-[var(--radix-popover-trigger-width)] p-0"
                            align="start"
                          >
                            <div className="flex flex-col">
                              <div className="border-b p-2">
                                <Input
                                  placeholder="Search products..."
                                  value={searchQuery}
                                  onChange={(e) =>
                                    setSearchQuery(e.target.value)
                                  }
                                  className="h-9"
                                />
                              </div>
                              {/* Product list */}
                              <div className="max-h-[300px] overflow-y-auto p-1">
                                {products.length === 0 ? (
                                  <div className="py-6 text-center text-sm text-muted-foreground">
                                    Loading products...
                                  </div>
                                ) : filteredProducts.length === 0 ? (
                                  <div className="py-6 text-center text-sm text-muted-foreground">
                                    No products found
                                  </div>
                                ) : (
                                  filteredProducts.map((product) => {
                                    const isSelected =
                                      selectedProducts.includes(product.name);
                                    return (
                                      <div
                                        key={product.id}
                                        onClick={() =>
                                          toggleProduct(product.name)
                                        }
                                        className={cn(
                                          "flex items-center gap-2 rounded-md px-3 py-2 text-sm cursor-pointer transition-colors hover:bg-accent hover:text-accent-foreground",
                                          isSelected && "bg-accent"
                                        )}
                                      >
                                        <div
                                          className={cn(
                                            "flex h-4 w-4 items-center justify-center rounded-sm border border-primary",
                                            isSelected
                                              ? "bg-primary text-primary-foreground"
                                              : "opacity-50"
                                          )}
                                        >
                                          {isSelected && (
                                            <Check className="h-3 w-3" />
                                          )}
                                        </div>
                                        <span className="flex-1">
                                          {product.name}
                                        </span>
                                      </div>
                                    );
                                  })
                                )}
                              </div>
                            </div>
                          </PopoverContent>
                        </Popover>

                        {selectedProducts.length > 0 && (
                          <div className="flex flex-wrap gap-2 mt-2">
                            {selectedProducts.map((productName) => (
                              <Badge
                                key={productName}
                                variant="secondary"
                                className="gap-1 pl-2 pr-1"
                              >
                                <span>{productName}</span>
                                <Button
                                  type="button"
                                  onClick={(e) => {
                                    e.preventDefault();
                                    toggleProduct(productName);
                                  }}
                                  size="icon"
                                  variant="ghost"
                                  className="h-4 w-4 p-0 hover:bg-transparent"
                                >
                                  <X className="h-3 w-3" />
                                  <span className="sr-only">
                                    Remove {productName}
                                  </span>
                                </Button>
                              </Badge>
                            ))}
                          </div>
                        )}
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Additional Note */}
                  <FormField
                    control={form.control}
                    name="message"
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <Textarea
                            placeholder="Message*"
                            {...field}
                            className="h-32 resize-none"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Submit Button */}
                  <div className="flex justify-center w-full">
                    <Button
                      type="submit"
                      className="w-full sm:w-auto bg-[#f5ad07]"
                    >
                      Send Message
                    </Button>
                  </div>
                </form>
              </Form>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
};

export default CateringPage;
