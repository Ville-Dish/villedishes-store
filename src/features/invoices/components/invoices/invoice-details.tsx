"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
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
import Image from "next/image";

import {
  CheckIcon,
  ChevronsUpDownIcon,
  EditIcon,
  LoaderIcon,
  Trash2Icon,
} from "lucide-react";

import { ScrollArea } from "@/components/ui/scroll-area";
import { adminEmail } from "@/lib/constantData";
import { formattedCurrency } from "@/lib/utils";
import { InvoiceStatus, isValidInvoiceStatus } from "@/lib/utils";
import { cn } from "@/lib/utils";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { MixedFraction } from "./fractions";
import {
  ColumnMappings,
  DEFAULT_COLUMN_MAPPINGS,
  InvoiceDisplayMode,
} from "@/lib/invoicePdfGenerate";
import { Invoice, InvoiceDetailsProps } from "@/lib/types";
import z from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useMutation } from "@tanstack/react-query";
import { useTRPC } from "@/trpc/client";

const allowsHalfQuantity = (productName?: string, popoverOpen?: boolean) => {
  if (!productName || popoverOpen) return false;

  return (
    productName.toLowerCase().includes("tray") ||
    /\b\d+(\.\d+)?\s?(l|ml)\b/i.test(productName)
  );
};

const sendInvoiceSchema = z.object({
  email: z.email({ message: "Email address is required" }),
});

type SendInvoiceValue = z.infer<typeof sendInvoiceSchema>;

export const InvoiceDetails = ({
  invoice,
  availableProducts,
  onUpdate,
  categoryMappings = {},
  columnMappings = DEFAULT_COLUMN_MAPPINGS,
}: InvoiceDetailsProps & {
  categoryMappings?: Record<string, string>;
  columnMappings?: ColumnMappings;
}) => {
  const trpc = useTRPC();

  const [updatedInvoice, setUpdatedInvoice] = useState<Invoice>(invoice);

  // TODO: review for trpc integration
  const [newProducts, setNewProducts] = useState<
    Array<{
      id: string;
      quantity: number;
      discount: number;
      category: string;
    }>
  >([{ id: "", quantity: 1, discount: 0, category: "" }]);

  const [isAddProductDialogOpen, setIsAddProductDialogOpen] = useState(false);

  const [isOpen, setIsOpen] = useState(false);
  const [selectedProductIds, setSelectedProductIds] = useState<string[]>([]);
  const [selectedProductIndex, setSelectedProductIndex] = useState<
    number | null
  >(null);
  const [editingProductIndex, setEditingProductIndex] = useState<number | null>(
    null,
  );
  const [discountPercentage, setDiscountPercentage] = useState(
    String(invoice.discountPercentage || 0),
  );
  const [discountType, setDiscountType] = useState(
    invoice.discountType || "PERCENT",
  );
  const [productDiscount, setProductDiscount] = useState<string[]>(
    invoice?.products?.map((p) => String(p.discount)) || [],
  );
  const [sendInvoiceOpen, setSendInvoiceOpen] = useState(false);
  const [emailDisplayMode, setEmailDisplayMode] =
    useState<InvoiceDisplayMode>("detailed");
  const [sending, setSending] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [taxRate, setTaxRate] = useState(String(invoice.taxRate || 0)); // Default tax rate
  const [taxType, setTaxType] = useState(invoice.taxType || "PERCENT");
  const [shippingFee, setShippingFee] = useState(
    String(invoice.shippingFee || 0),
  ); // Default shipping fee
  const [invoiceAmount, setInvoiceAmount] = useState(invoice.amount || 0);
  const [amountPaid, setAmountPaid] = useState(invoice.amountPaid || 0);
  const [amountDue, setAmountDue] = useState(
    invoice.amount - (invoice.amountPaid || 0),
  );
  const [filteredProducts, setFilteredProducts] = useState(availableProducts);
  const [searchTerm, setSearchTerm] = useState("");

  const [serviceCharge, setServiceCharge] = useState(
    String(invoice.serviceCharge || 0),
  );
  const [miscellaneous, setMiscellaneous] = useState(
    String(invoice.miscellaneous || 0),
  );

  const sendEmailForm = useForm<SendInvoiceValue>({
    resolver: zodResolver(sendInvoiceSchema),
    defaultValues: {
      email: updatedInvoice.customerEmail || "",
    },
  });

  useEffect(() => {
    setUpdatedInvoice(invoice);
    setAmountPaid(invoice.amountPaid || 0);
    setAmountDue(invoice.amountDue || 0);
    setDiscountPercentage(String(invoice.discountPercentage || 0));
    setTaxRate(String(invoice.taxRate || 0));
    setShippingFee(String(invoice.shippingFee || 0));
    setServiceCharge(String(invoice.serviceCharge || 0));
    setMiscellaneous(String(invoice.miscellaneous || 0));
    setProductDiscount(invoice.products?.map((p) => String(p.discount)) || []);
  }, [invoice]);

  // Initialize selectedProductIds when dialog opens or when editing
  useEffect(() => {
    if (isAddProductDialogOpen) {
      if (editingProductIndex !== null) {
        // When editing, set the selected product for that specific row
        setSelectedProductIds([newProducts[0]?.id || ""]);
      } else {
        // When adding new, initialize with empty strings for each new product
        setSelectedProductIds(newProducts.map((p) => p.id || ""));
      }
    }
  }, [isAddProductDialogOpen, editingProductIndex, newProducts]);

  useEffect(() => {
    setAmountDue(invoiceAmount - amountPaid);
  }, [invoiceAmount, amountPaid]);

  useEffect(() => {
    const filtered = availableProducts.filter((product) =>
      product.name.toLowerCase().includes(searchTerm.toLowerCase()),
    );
    setFilteredProducts(filtered);
  }, [searchTerm, availableProducts]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setUpdatedInvoice((prev) => ({ ...prev, [name]: value }));
  };

  const handleDiscountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseFloat(e.target.value);
    setDiscountPercentage(isNaN(value) ? "" : String(value));
  };

  const handleTaxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseFloat(e.target.value);
    setTaxRate(isNaN(value) ? "" : String(value));
  };

  const handleShippingChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseFloat(e.target.value);
    setShippingFee(isNaN(value) ? "" : String(value));
  };

  const handleServiceChargeChange = (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const value = parseFloat(e.target.value);
    setServiceCharge(isNaN(value) ? "" : String(value));
  };

  const handleMiscellaneousChange = (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const value = parseFloat(e.target.value);
    setMiscellaneous(isNaN(value) ? "" : String(value));
  };

  const handleStatusChange = (value: string) => {
    if (isValidInvoiceStatus(value)) {
      setUpdatedInvoice((prev) => {
        const newStatus = value as InvoiceStatus;
        let newAmountPaid = prev.amountPaid;
        let newAmountDue = prev.amountDue;

        if (newStatus === "PAID") {
          newAmountPaid = prev.amount;
          newAmountDue = 0;
        } else {
          newAmountPaid = 0;
          newAmountDue = prev.amount;
        }

        return {
          ...prev,
          status: newStatus,
          amountPaid: newAmountPaid,
          amountDue: newAmountDue,
        };
      });
    }
  };

  const resetProductDialog = () => {
    setNewProducts([{ id: "", quantity: 1, discount: 0, category: "" }]);
    setEditingProductIndex(null);
    setIsAddProductDialogOpen(false);
    setSearchTerm(""); // Clear search term
    setSelectedProductIds([]);
  };

  const handleProductChange = (
    index: number,
    field: string,
    value: string | number,
  ) => {
    const updatedProducts = updatedInvoice.products
      ? [...updatedInvoice.products]
      : []; // Ensure invoice.products is not undefined
    if (field === "id") {
      const selectedProduct = availableProducts.find((p) => p.id === value);
      if (selectedProduct) {
        updatedProducts[index] = {
          ...updatedProducts[index],
          id: selectedProduct.id,
          name: selectedProduct.name,
          basePrice: selectedProduct.basePrice,
          quantity: updatedProducts[index].quantity || 1,
          price:
            selectedProduct.basePrice * updatedProducts[index].quantity || 0,
          discount: updatedProducts[index].discount || 0,
        };
      }
    } else if (field === "discount") {
      const numValue = parseFloat(String(value)) || 0;
      const clamped = Math.max(0, Math.min(100, numValue));

      setProductDiscount((prev) => {
        const updated = [...prev];
        updated[index] = String(clamped);
        return updated;
      });

      updatedProducts[index] = {
        ...updatedProducts[index],
        discount: clamped,
        price:
          updatedProducts[index].basePrice *
          updatedProducts[index].quantity *
          (1 - clamped / 100),
      };
    } else {
      updatedProducts[index] = { ...updatedProducts[index], [field]: value };
    }
    setUpdatedInvoice((prev) => ({ ...prev, products: updatedProducts }));
  };

  const addProduct = () => {
    const validProducts = newProducts.filter((product) => product.id !== "");

    // Create a copy of the current products array
    const updatedProducts = updatedInvoice.products
      ? [...updatedInvoice.products]
      : [];

    validProducts.forEach((newProduct) => {
      const selectedProduct = availableProducts.find(
        (p) => p.id === newProduct.id,
      );
      if (selectedProduct) {
        // const updatedProducts = updatedInvoice.products ? [...updatedInvoice.products] : [];

        const existingProductIndex = updatedProducts.findIndex(
          (p) => p.id === selectedProduct.id,
        );
        if (existingProductIndex !== -1) {
          updatedProducts[existingProductIndex].quantity += newProduct.quantity;
          updatedProducts[existingProductIndex].discount = Number(
            productDiscount[existingProductIndex],
          );
          updatedProducts[existingProductIndex].price =
            updatedProducts[existingProductIndex].basePrice *
            updatedProducts[existingProductIndex].quantity *
            (1 - updatedProducts[existingProductIndex].discount / 100);
        } else {
          updatedProducts.push({
            id: selectedProduct.id,
            name: selectedProduct.name,
            basePrice: selectedProduct.basePrice,
            quantity: newProduct.quantity,
            price:
              selectedProduct.basePrice * newProduct.quantity * (1 - 0 / 100),
            discount: 0,
            category: newProduct.category,
          });
        }
      }
    });

    setUpdatedInvoice((prev) => ({ ...prev, products: updatedProducts }));
    resetProductDialog();
  };

  const removeProduct = async (index: number) => {
    // Create new products array with the item removed
    const updatedProducts = updatedInvoice.products
      ? [...updatedInvoice.products]
      : [];
    updatedProducts.splice(index, 1);

    // Update the invoice state with new products array
    await setUpdatedInvoice((prev) => {
      const newState = { ...prev, products: updatedProducts };
      return newState;
    });

    // Update product discounts array to stay in sync
    setProductDiscount((prevDiscounts) => {
      const newDiscounts = [...prevDiscounts];
      newDiscounts.splice(index, 1);
      return newDiscounts;
    });
  };

  const startEditingProduct = (index: number) => {
    if (updatedInvoice.products) {
      setEditingProductIndex(index);
      const productToEdit = updatedInvoice.products[index];
      setNewProducts([
        {
          id: productToEdit.id,
          quantity: productToEdit.quantity,
          discount: productToEdit.discount,
          category: productToEdit.category,
        },
      ]);
      setIsAddProductDialogOpen(true);
    }
  };

  const saveEditedProduct = () => {
    // Check that we have a valid editing index and valid product data
    if (
      editingProductIndex === null ||
      !newProducts?.length ||
      !newProducts[0]?.id
    ) {
      toast.error("Invalid product data");
      return;
    }

    const updatedProducts = updatedInvoice.products
      ? [...updatedInvoice.products]
      : [];

    // Ensure the editing index is within bounds
    if (
      editingProductIndex >= 0 &&
      editingProductIndex < updatedProducts.length
    ) {
      updatedProducts[editingProductIndex] = {
        ...updatedProducts[editingProductIndex],
        quantity: newProducts[0].quantity,
        discount: Number(productDiscount[editingProductIndex]),
        price:
          updatedProducts[editingProductIndex].basePrice *
          newProducts[0].quantity *
          (1 - Number(productDiscount[editingProductIndex]) / 100),
      };
      setUpdatedInvoice((prev) => ({ ...prev, products: updatedProducts }));
      resetProductDialog();
    } else {
      toast.error("Invalid product index");
    }
  };

  const calculateSubtotal = useCallback(() => {
    return updatedInvoice.products?.reduce(
      (sum, product) =>
        sum +
        product.basePrice *
          product.quantity *
          (1 - (product.discount || 0) / 100),
      0,
    );
  }, [updatedInvoice]);

  const calculateTotal = useCallback(() => {
    const subtotal = calculateSubtotal() || 0;
    const discountAmount =
      discountType === "PERCENT"
        ? subtotal * ((Number(discountPercentage) || 0) / 100)
        : Number(discountPercentage) || 0;
    const taxAmount =
      taxType === "PERCENT"
        ? subtotal * ((Number(taxRate) || 0) / 100)
        : Number(taxRate) || 0;
    return (
      subtotal -
      discountAmount +
      taxAmount +
      (Number(shippingFee) || 0) +
      (Number(serviceCharge) || 0) +
      (Number(miscellaneous) || 0)
    );
  }, [
    calculateSubtotal,
    discountPercentage,
    discountType,
    taxType,
    miscellaneous,
    serviceCharge,
    shippingFee,
    taxRate,
  ]);

  const subTotal = calculateSubtotal() || 0;

  const discountAmount =
    discountType === "PERCENT"
      ? subTotal * (Number(discountPercentage) / 100)
      : Number(discountPercentage);

  const taxAmount =
    taxType === "PERCENT"
      ? subTotal * ((Number(taxRate) || 0) / 100)
      : Number(taxRate) || 0;

  const handleUpdateInvoice = async () => {
    try {
      setUpdating(true);
      const total = calculateTotal();

      // Get the latest products state
      const currentProducts =
        updatedInvoice.products?.map((product) => ({
          ...product,
          quantity: product.quantity,
          price:
            product.basePrice *
            product.quantity *
            (1 - (product.discount || 0) / 100),
        })) || [];

      const updatedInvoiceData = {
        ...updatedInvoice,
        amount: total,
        amountPaid: amountPaid,
        amountDue: amountDue,
        discountPercentage: Number(discountPercentage),
        discountType: discountType,
        taxRate: Number(taxRate),
        taxType: taxType,
        shippingFee: Number(shippingFee),
        serviceCharge: Number(serviceCharge),
        miscellaneous: Number(miscellaneous),
        products: currentProducts,
      };

      await onUpdate(updatedInvoiceData);

      // Update local state to reflect changes
      setUpdatedInvoice(updatedInvoiceData);
      setInvoiceAmount(total);
      setAmountDue(total - amountPaid);

      toast.success("Invoice updated successfully");
    } catch (error) {
      console.error("Error updating invoice:", error);
      toast.error("Error trying to update invoice", {
        description: "Failed to update invoice",
      });
    } finally {
      setUpdating(false);
    }
  };

  // Modify the useEffect to properly track product changes
  useEffect(() => {
    const total = calculateTotal();
    setInvoiceAmount(total);
    setAmountDue(total - amountPaid);
  }, [
    // Add updatedInvoice as a dependency to ensure updates when products change
    updatedInvoice,
    discountPercentage,
    taxRate,
    shippingFee,
    serviceCharge,
    miscellaneous,
    amountPaid,
    calculateTotal,
  ]);

  const sendMail = useMutation(
    trpc.mail.sendEmail.mutationOptions({
      onSuccess: () => {
        setSendInvoiceOpen(false);
        toast.success("Invoice Sent", {
          description:
            "An email with the invoice details has been sent to the customer.",
        });
        setSending(false);
      },
      onError: (error) => {
        console.error("Error sending invoice email:", error);
        toast.error("Failed to send invoice email", {
          description:
            error instanceof Error
              ? error.message
              : "An unknown error occurred",
        });
      },
    }),
  );

  const handleSendInvoiceEmail = async (data: SendInvoiceValue) => {
    setSending(true);
    const parsed = sendInvoiceSchema.safeParse(data);
    if (!parsed.success) {
      toast.error("Failed to send Invoice email", {
        description: "Please check the email address format",
      });
      return;
    }

    const emailData = {
      customerName: updatedInvoice.customerName,
      invoiceNumber: updatedInvoice.invoiceNumber,
      invoice: updatedInvoice,
      displayMode: emailDisplayMode,
      categoryMappings,
      columnMappings,
    };

    sendMail.mutate({
      type: "invoice",
      to: parsed.data.email,
      ...emailData,
    });
  };

  const trayFractionToNumber = (value: string) => {
    // "1/2" => 0.5, "11/2" => 1.5
    if (value.includes("1/2")) {
      const whole = parseInt(value.replace("1/2", ""), 10);
      return isNaN(whole) ? 0.5 : whole + 0.5;
    }

    return parseFloat(value);
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Seller Data */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Image
                src="https://res.cloudinary.com/dxt7vk5dg/image/upload/v1743187728/ville-logo_u98blv.png"
                alt="Company Logo"
                width={80}
                height={80}
              />
              <span>Bill From</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <p>
                <span className="font-medium">Company Name:</span> VilleDishes
              </p>
              <p>
                <span className="font-medium">Company Email:</span>{" "}
                villedishes@gmail.com
              </p>
              <p>
                <span className="font-medium">Phone:</span> 587-984-4409
              </p>
              <p>
                <span className="font-medium">Pay via Interac using:</span>{" "}
                villedishes@gmail.com
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Customer Data */}
        <Card>
          <CardHeader>
            <CardTitle>Bill To</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <Label htmlFor="customerName">Name</Label>
                <Input
                  id="customerName"
                  name="customerName"
                  value={updatedInvoice.customerName}
                  onChange={handleInputChange}
                />
              </div>
              <div>
                <Label htmlFor="customerEmail">Email</Label>
                <Input
                  id="customerEmail"
                  name="customerEmail"
                  value={updatedInvoice.customerEmail}
                  onChange={handleInputChange}
                />
              </div>
              <div>
                <Label htmlFor="customerPhone">Phone</Label>
                <Input
                  id="customerPhone"
                  name="customerPhone"
                  value={updatedInvoice.customerPhone}
                  onChange={handleInputChange}
                />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Invoice Overview */}
      <Card>
        <CardHeader>
          <CardTitle>Invoice Overview</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div>
              <p className="font-medium">Invoice Number:</p>
              <p>{updatedInvoice.invoiceNumber}</p>
            </div>
            <div>
              <p className="font-medium">Date Created:</p>
              <p>{updatedInvoice.dateCreated}</p>
            </div>
            <div>
              <Label htmlFor="dueDate">Due Date</Label>
              <Input
                id="dueDate"
                name="dueDate"
                type="date"
                value={updatedInvoice.dueDate}
                onChange={handleInputChange}
              />
            </div>
            <div>
              <Label htmlFor="status">Status</Label>
              <Select
                onValueChange={handleStatusChange}
                value={updatedInvoice.status}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={InvoiceStatus.PENDING}>Pending</SelectItem>
                  <SelectItem value={InvoiceStatus.UNPAID}>Unpaid</SelectItem>
                  <SelectItem value={InvoiceStatus.OVERDUE}>Due</SelectItem>
                  <SelectItem value={InvoiceStatus.PAID}>Paid</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="w-full grid grid-cols-3 gap-x-24">
            {/*Invoice Amount div starts here */}
            <div className="">
              <Label htmlFor="invoiceAmount">Invoice Amount</Label>
              <p className="">
                {formattedCurrency.format(updatedInvoice.amount)}
              </p>
            </div>
            {/*Invoice Amount div ends here */}

            {/*Amount Paid div starts here */}
            <div>
              <Label htmlFor="amountPaid">Amount Paid</Label>
              <div className="flex items-center justify-center">
                <span className="h-9 p-1 border border-input bg-slate-200 rounded-md rounded-r-none italic text-muted-foreground">
                  $
                </span>
                <Input
                  id="amountPaid"
                  name="amountPaid"
                  type="number"
                  value={amountPaid.toFixed(2)}
                  onChange={(e) => setAmountPaid(parseFloat(e.target.value))}
                  className="border-l-0 rounded-l-none"
                />
              </div>
            </div>
            {/*Amount Paid div ends here */}

            {/*Amount Due div starts here */}
            <div>
              <Label htmlFor="amountDue">Amount Due</Label>
              <p>{formattedCurrency.format(amountDue)}</p>
            </div>
            {/*Amount Due div ends here */}
          </div>
        </CardContent>
      </Card>

      {/* Invoice Product Details */}
      <Card>
        <CardHeader>
          <CardTitle>Invoice Product Details</CardTitle>
        </CardHeader>
        <CardContent>
          {updatedInvoice?.products && updatedInvoice?.products?.length > 0 && (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>S/N</TableHead>
                    <TableHead>Product</TableHead>
                    <TableHead>Base price($)</TableHead>
                    <TableHead>Quantity</TableHead>
                    <TableHead>Discount(%)</TableHead>
                    <TableHead>Price($)</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {updatedInvoice.products.map((product, index) => {
                    return (
                      <TableRow key={index}>
                        <TableCell>{index + 1}</TableCell>
                        <TableCell>{product.name}</TableCell>
                        <TableCell>{product.basePrice.toFixed(2)}</TableCell>
                        <TableCell>
                          <MixedFraction value={product.quantity} />
                        </TableCell>
                        <TableCell>
                          <Input
                            type="number"
                            value={productDiscount[index] || "0"}
                            onChange={(e) =>
                              handleProductChange(
                                index,
                                "discount",
                                e.target.value,
                              )
                            }
                            className="w-16"
                            min="0"
                            max="100"
                          />
                        </TableCell>
                        <TableCell>
                          {(
                            product.basePrice *
                            product.quantity *
                            (1 - (product.discount || 0) / 100)
                          ).toFixed(2)}
                        </TableCell>
                        <TableCell>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => startEditingProduct(index)}
                            className="cursor-pointer"
                          >
                            <EditIcon className="size-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeProduct(index)}
                            className="cursor-pointer text-destructive hover:text-destructive"
                          >
                            <Trash2Icon className="size-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}

          <Dialog
            open={isAddProductDialogOpen}
            onOpenChange={setIsAddProductDialogOpen}
          >
            <DialogTrigger asChild>
              <Button
                onClick={resetProductDialog}
                className="mt-4 cursor-pointer"
                variant="create"
              >
                Add Product
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>
                  {editingProductIndex !== null
                    ? "Edit Product"
                    : "Add Product to Invoice"}
                </DialogTitle>
              </DialogHeader>
              <div className="grid gap-4 py-4 pt-8">
                <ScrollArea className="max-h-100 pr-4">
                  <div className="space-y-4">
                    {newProducts.map((product, index) => {
                      const selectedProduct = filteredProducts.find(
                        (p) => p.id === selectedProductIds[index],
                      );

                      const halfStep = allowsHalfQuantity(
                        selectedProduct?.name,
                        isOpen,
                      );

                      return (
                        <div
                          key={index}
                          className={cn(
                            "space-y-4 border-b border-input py-4",
                            newProducts.length === 1 && "pr-2",
                          )}
                        >
                          <div className="flex justify-between items-start">
                            <div className="flex-1 space-y-2">
                              <div className="grid grid-cols-4 items-center gap-4">
                                <Label
                                  htmlFor={`product-${index}`}
                                  className="text-right"
                                >
                                  Product {index + 1}
                                </Label>
                                <Popover
                                  open={
                                    isOpen && selectedProductIndex === index
                                  }
                                  onOpenChange={(open) => {
                                    setIsOpen(open);
                                    if (open) {
                                      setSelectedProductIndex(index);
                                    } else {
                                      setSelectedProductIndex(null);
                                    }
                                  }}
                                >
                                  <PopoverTrigger
                                    asChild
                                    className="col-span-3"
                                  >
                                    <Button
                                      variant="outline"
                                      role="combobox"
                                      aria-expanded={
                                        isOpen && selectedProductIndex === index
                                      }
                                      className="w-full justify-between"
                                    >
                                      {(selectedProductIds[index] &&
                                        filteredProducts.find(
                                          (p) =>
                                            p.id === selectedProductIds[index],
                                        )?.name) ||
                                        "Select a product"}
                                      <ChevronsUpDownIcon className="opacity-30" />
                                    </Button>
                                  </PopoverTrigger>
                                  <PopoverContent className="w-full p-0">
                                    <Command>
                                      <CommandInput
                                        placeholder="Filter products"
                                        value={searchTerm}
                                        onValueChange={setSearchTerm}
                                      />

                                      <CommandList>
                                        <CommandEmpty>
                                          No product found.
                                        </CommandEmpty>
                                        <CommandGroup>
                                          {filteredProducts.map((product) => (
                                            <CommandItem
                                              key={product.id}
                                              value={product.name}
                                              className="cursor-pointer justify-between"
                                              onSelect={() => {
                                                // Update the newProducts array with selected product
                                                const updated = [
                                                  ...newProducts,
                                                ];

                                                updated[index].id = product.id;
                                                setNewProducts(updated);

                                                // Update selectedProductIds for display
                                                const updatedIds = [
                                                  ...selectedProductIds,
                                                ];
                                                updatedIds[index] = product.id;
                                                setSelectedProductIds(
                                                  updatedIds,
                                                );

                                                setSearchTerm("");
                                                setIsOpen(false);
                                                setSelectedProductIndex(null);
                                              }}
                                            >
                                              {product.name} - $
                                              {product.basePrice.toFixed(2)}
                                              <CheckIcon
                                                className={cn(
                                                  "size-4",
                                                  selectedProductIds[index] ===
                                                    product.id
                                                    ? "opacity-100"
                                                    : "opacity-0",
                                                )}
                                              />
                                            </CommandItem>
                                          ))}
                                        </CommandGroup>
                                      </CommandList>
                                    </Command>
                                  </PopoverContent>
                                </Popover>
                              </div>
                              <div className="grid grid-cols-4 items-center gap-4">
                                <Label
                                  htmlFor={`quantity-${index}`}
                                  className="text-right"
                                >
                                  Quantity
                                </Label>
                                <Input
                                  id={`quantity-${index}`}
                                  type="number"
                                  value={product.quantity}
                                  onChange={(e) => {
                                    const updated = [...newProducts];
                                    const raw = e.target.value;

                                    updated[index].quantity = halfStep
                                      ? trayFractionToNumber(raw)
                                      : parseInt(raw, 10);
                                    setNewProducts(updated);
                                  }}
                                  className="col-span-3"
                                  step={halfStep ? 0.5 : 1}
                                  min={halfStep ? 0.5 : 1}
                                />
                              </div>
                            </div>
                            {newProducts.length > 1 && ( // Only show remove button if there's more than one product
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                  const updated = newProducts.filter(
                                    (_, i) => i !== index,
                                  );
                                  setNewProducts(updated);

                                  // Also remove from selectedProductIds
                                  const updatedIds = selectedProductIds.filter(
                                    (_, i) => i !== index,
                                  );
                                  setSelectedProductIds(updatedIds);
                                }}
                                className="ml-2 hover:bg-transparent"
                              >
                                <Trash2Icon className="size-4 text-red-500" />
                              </Button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </ScrollArea>

                <Button
                  type="button"
                  variant="outline"
                  className="cursor-pointer"
                  onClick={() => {
                    setNewProducts([
                      ...newProducts,
                      { id: "", quantity: 1, discount: 0, category: "" },
                    ]);
                    setSelectedProductIds([...selectedProductIds, ""]);
                  }}
                >
                  Add Another Product
                </Button>
              </div>
              <Button
                onClick={
                  editingProductIndex !== null ? saveEditedProduct : addProduct
                }
                variant={editingProductIndex !== null ? "submit" : "create"}
                className="cursor-pointer"
              >
                {editingProductIndex !== null
                  ? "Save Changes"
                  : "Add to Invoice"}
              </Button>
            </DialogContent>
          </Dialog>
        </CardContent>
      </Card>

      {/* Invoice Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Invoice Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span>Subtotal:</span>
              <span>{formattedCurrency.format(subTotal)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="flex items-center">
                Discount
                <Select
                  value={discountType}
                  onValueChange={(value) => setDiscountType(value as any)}
                >
                  <SelectTrigger className="border rounded px-2 py-1 mx-2">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="PERCENT">%</SelectItem>
                    <SelectItem value="AMOUNT">$</SelectItem>
                  </SelectContent>
                </Select>
                :
              </span>
              <div className="flex items-center">
                <Input
                  type="number"
                  value={discountPercentage}
                  onChange={handleDiscountChange}
                  className="w-20 mr-2"
                  min="0"
                  max={discountType === "PERCENT" ? 100 : undefined}
                  step={discountType === "PERCENT" ? 0.01 : 1}
                />
                <span>{formattedCurrency.format(discountAmount)}</span>
              </div>
            </div>
            <div className="flex justify-between items-center">
              <span className="flex items-center">
                Tax
                <Select
                  value={taxType}
                  onValueChange={(value) => setTaxType(value as any)}
                >
                  <SelectTrigger className="border rounded px-2 py-1 mx-2">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="PERCENT">%</SelectItem>
                    <SelectItem value="AMOUNT">$</SelectItem>
                  </SelectContent>
                </Select>
                :
              </span>
              <div className="flex items-center">
                <Input
                  id="taxRate"
                  type="number"
                  value={taxRate}
                  onChange={handleTaxChange}
                  className="w-20 mr-2"
                  min="0"
                  max={taxType === "PERCENT" ? 100 : undefined}
                  step={taxType === "PERCENT" ? 0.01 : 1}
                />
                <span>{formattedCurrency.format(taxAmount)}</span>
              </div>
            </div>

            <div className="flex justify-between">
              <span>Shipping Fee:</span>
              <div className="flex items-center">
                <Input
                  id="shippingFee"
                  type="number"
                  value={shippingFee}
                  className="w-20 mr-2"
                  min="0"
                  step={0.05}
                  onChange={handleShippingChange}
                />
                <span>{formattedCurrency.format(Number(shippingFee))}</span>
              </div>
            </div>
            <div className="flex justify-between">
              <span>Service Charge:</span>
              <div className="flex items-center">
                <Input
                  id="serviceCharge"
                  type="number"
                  value={serviceCharge}
                  className="w-20 mr-2"
                  min="0"
                  step={0.05}
                  onChange={handleServiceChargeChange}
                />
                <span>{formattedCurrency.format(Number(serviceCharge))}</span>
              </div>
            </div>
            <div className="flex justify-between">
              <span>Miscellaneous:</span>
              <div className="flex items-center">
                <Input
                  id="miscellaneous"
                  type="number"
                  value={miscellaneous}
                  className="w-20 mr-2"
                  min="0"
                  step={0.05}
                  onChange={handleMiscellaneousChange}
                />
                <span>{formattedCurrency.format(Number(miscellaneous))}</span>
              </div>
            </div>
            <div className="flex justify-between text-lg font-bold">
              <span>Total:</span>
              <span>{formattedCurrency.format(calculateTotal())}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex flex-col sm:flex-row gap-4 justify-between">
        <Button
          className="w-full sm:w-auto cursor-pointer"
          variant="submit"
          onClick={handleUpdateInvoice}
          disabled={updating || sending}
        >
          {updating && <LoaderIcon className="animate-spin size-4" />}
          Update Invoice
        </Button>

        <Dialog open={sendInvoiceOpen} onOpenChange={setSendInvoiceOpen}>
          <DialogTrigger asChild>
            <Button
              className="w-full sm:w-auto cursor-pointer"
              variant="send"
              // disabled={sending || updating}
            >
              {sending && <LoaderIcon className="animate-spin size-4 mr-2" />}
              Send Invoice
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Send Invoice</DialogTitle>
              <DialogDescription>
                Choose how to display the invoice and edit the recipient email
                as needed.
              </DialogDescription>
            </DialogHeader>
            <Form {...sendEmailForm}>
              <form
                className="space-y-2"
                onSubmit={sendEmailForm.handleSubmit(handleSendInvoiceEmail)}
              >
                {/* Display Mode Selection */}
                <div className="space-y-2">
                  <FormLabel>Invoice Display Mode</FormLabel>
                  <Select
                    value={emailDisplayMode}
                    onValueChange={(value: InvoiceDisplayMode) =>
                      setEmailDisplayMode(value)
                    }
                  >
                    <SelectTrigger disabled={sending || updating}>
                      <SelectValue placeholder="Select display mode" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="detailed">Detailed View</SelectItem>
                      <SelectItem value="category-summary">
                        Category Summary
                      </SelectItem>
                      <SelectItem value="category-grouped">
                        Category Grouped
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <FormField
                  control={sendEmailForm.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Enter email address"
                          {...field}
                          disabled={sending || updating}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <DialogFooter>
                  <Button
                    type="submit"
                    className="bg-yellow-600 cursor-pointer hover:bg-yellow-700"
                    disabled={sending || updating}
                  >
                    {sending && <LoaderIcon className="animate-spin size-4" />}
                    Send Invoice
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};
