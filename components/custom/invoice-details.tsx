import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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

import { Edit, Loader, Trash2 } from "lucide-react";

import { ScrollArea } from "@/components/ui/scroll-area";
import { adminEmail } from "@/lib/constantData";
import { formattedCurrency } from "@/lib/helper";
import { InvoiceStatus, isValidInvoiceStatus } from "@/lib/invoiceUtils";
import { cn } from "@/lib/utils";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";

export const InvoiceDetails = ({
  invoice,
  availableProducts,
  onUpdate,
}: InvoiceDetailsProps) => {
  const [updatedInvoice, setUpdatedInvoice] = useState<Invoice>(invoice);

  const [newProducts, setNewProducts] = useState<
    Array<{
      id: string;
      quantity: number;
      discount: number;
    }>
  >([{ id: "", quantity: 1, discount: 0 }]);

  const [isAddProductDialogOpen, setIsAddProductDialogOpen] = useState(false);
  const [editingProductIndex, setEditingProductIndex] = useState<number | null>(
    null
  );
  const [discountPercentage, setDiscountPercentage] = useState(
    String(invoice.discountPercentage || 0)
  );
  const [productDiscount, setProductDiscount] = useState<string[]>(
    invoice?.products?.map((p) => String(p.discount)) || []
  );
  const [sending, setSending] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [taxRate, setTaxRate] = useState(String(invoice.taxRate || 0)); // Default tax rate
  const [shippingFee, setShippingFee] = useState(
    String(invoice.shippingFee || 0)
  ); // Default shipping fee
  const [invoiceAmount, setInvoiceAmount] = useState(invoice.amount || 0);
  const [amountPaid, setAmountPaid] = useState(invoice.amountPaid || 0);
  const [amountDue, setAmountDue] = useState(
    invoice.amount - (invoice.amountPaid || 0)
  );
  const [filteredProducts, setFilteredProducts] = useState(availableProducts);
  const [searchTerm, setSearchTerm] = useState("");

  const [serviceCharge, setServiceCharge] = useState(
    String(invoice.serviceCharge || 0)
  );
  const [miscellaneous, setMiscellaneous] = useState(
    String(invoice.miscellaneous || 0)
  );

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

  useEffect(() => {
    setAmountDue(invoiceAmount - amountPaid);
  }, [invoiceAmount, amountPaid]);

  useEffect(() => {
    const filtered = availableProducts.filter((product) =>
      product.name.toLowerCase().includes(searchTerm.toLowerCase())
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
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const value = parseFloat(e.target.value);
    setServiceCharge(isNaN(value) ? "" : String(value));
  };

  const handleMiscellaneousChange = (
    e: React.ChangeEvent<HTMLInputElement>
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
    setNewProducts([{ id: "", quantity: 1, discount: 0 }]);
    setEditingProductIndex(null);
    setIsAddProductDialogOpen(false);
    setSearchTerm(""); // Clear search term
  };

  const handleProductChange = (
    index: number,
    field: string,
    value: string | number
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
        (p) => p.id === newProduct.id
      );
      if (selectedProduct) {
        // const updatedProducts = updatedInvoice.products ? [...updatedInvoice.products] : [];

        const existingProductIndex = updatedProducts.findIndex(
          (p) => p.id === selectedProduct.id
        );
        if (existingProductIndex !== -1) {
          updatedProducts[existingProductIndex].quantity += newProduct.quantity;
          updatedProducts[existingProductIndex].discount = Number(
            productDiscount[existingProductIndex]
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
      0
    );
  }, [updatedInvoice]);

  const calculateTotal = useCallback(() => {
    const subtotal = calculateSubtotal() || 0;
    const discountAmount = subtotal * ((Number(discountPercentage) || 0) / 100);
    const taxAmount = subtotal * ((Number(taxRate) || 0) / 100);
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
    miscellaneous,
    serviceCharge,
    shippingFee,
    taxRate,
  ]);

  const handleUpdateInvoice = async () => {
    try {
      setUpdating(true);
      const total = calculateTotal();

      // Get the latest products state
      const currentProducts =
        updatedInvoice.products?.map((product) => ({
          ...product,
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
        taxRate: Number(taxRate),
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

  const handleSendInvoiceEmail = async () => {
    try {
      setSending(true);
      const response = await fetch("/api/emails/invoice", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from: adminEmail,
          to: updatedInvoice.customerEmail,
          subject: `Your Invoice ${updatedInvoice.invoiceNumber} from VilleDishes is ready`,
          customerName: updatedInvoice.customerName,
          invoiceNumber: updatedInvoice.invoiceNumber,
          invoice: updatedInvoice,
        }),
      });

      if (response.ok) {
        toast.success("Invoice sent successfully");
      } else {
        throw new Error("Failed to send invoice");
      }
    } catch (error) {
      console.error("Error sending invoice email:", error);
      toast.error("Failed to send invoice email", {
        description: "Please try again later",
      });
    } finally {
      setSending(false);
    }
  };

  const subTotal = calculateSubtotal() || 0;

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
                        <TableCell>{product.quantity}</TableCell>
                        <TableCell>
                          <Input
                            type="number"
                            value={productDiscount[index] || "0"}
                            onChange={(e) =>
                              handleProductChange(
                                index,
                                "discount",
                                e.target.value
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
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeProduct(index)}
                          >
                            <Trash2 className="h-4 w-4" />
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
                className="mt-4"
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
                <ScrollArea className="max-h-[400px] pr-4">
                  <div className="space-y-4">
                    {newProducts.map((product, index) => (
                      <div
                        key={index}
                        className={cn(
                          "space-y-4 border-b border-input py-4",
                          newProducts.length === 1 && "pr-2"
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
                              <Select
                                onValueChange={(value) => {
                                  const updated = [...newProducts];
                                  updated[index].id = value;
                                  setNewProducts(updated);
                                }}
                                value={product.id}
                              >
                                <SelectTrigger className="col-span-3">
                                  <SelectValue placeholder="Select product" />
                                </SelectTrigger>
                                <SelectContent>
                                  <Input
                                    type="text"
                                    value={searchTerm}
                                    onChange={(e) =>
                                      setSearchTerm(e.target.value)
                                    }
                                    placeholder="Filter Product"
                                  />
                                  {filteredProducts.map((p) => (
                                    <SelectItem key={p.id} value={p.id}>
                                      {p.name} - ${p.basePrice.toFixed(2)}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
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
                                  updated[index].quantity = parseInt(
                                    e.target.value
                                  );
                                  setNewProducts(updated);
                                }}
                                className="col-span-3"
                                min="1"
                              />
                            </div>
                          </div>
                          {newProducts.length > 1 && ( // Only show remove button if there's more than one product
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                const updated = newProducts.filter(
                                  (_, i) => i !== index
                                );
                                setNewProducts(updated);
                              }}
                              className="ml-2 hover:bg-transparent"
                            >
                              <Trash2 className="h-4 w-4 text-red-500" />
                            </Button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>

                <Button
                  type="button"
                  variant="outline"
                  onClick={() =>
                    setNewProducts([
                      ...newProducts,
                      { id: "", quantity: 1, discount: 0 },
                    ])
                  }
                >
                  Add Another Product
                </Button>
              </div>
              <Button
                onClick={
                  editingProductIndex !== null ? saveEditedProduct : addProduct
                }
                variant={editingProductIndex !== null ? "submit" : "create"}
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
              <span>Discount (%):</span>
              <div className="flex items-center">
                <Input
                  type="number"
                  value={discountPercentage}
                  onChange={handleDiscountChange}
                  className="w-20 mr-2"
                  min="0"
                  max="100"
                  step={0.01}
                />
                <span>
                  {formattedCurrency.format(
                    subTotal * (Number(discountPercentage) / 100)
                  )}
                </span>
              </div>
            </div>
            <div className="flex justify-between items-center">
              <span>Tax (%):</span>
              <div className="flex items-center">
                <Input
                  id="taxRate"
                  type="number"
                  value={taxRate}
                  className="w-20 mr-2"
                  min="0"
                  step={0.01}
                  onChange={handleTaxChange}
                />
                <span>
                  {formattedCurrency.format(subTotal * (Number(taxRate) / 100))}
                </span>
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
          className="w-full sm:w-auto"
          variant="submit"
          onClick={handleUpdateInvoice}
          disabled={updating || sending}
        >
          {updating && <Loader className="animate-spin w-4 h-4 mr-2" />}
          Update Invoice
        </Button>
        <Button
          className="w-full sm:w-auto"
          variant="send"
          onClick={handleSendInvoiceEmail}
          disabled={sending || updating}
        >
          {sending && <Loader className="animate-spin w-4 h-4 mr-2" />}
          Send Invoice
        </Button>
      </div>
    </div>
  );
};
