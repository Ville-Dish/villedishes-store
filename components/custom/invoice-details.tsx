import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

import { Trash2, Edit, Loader } from "lucide-react";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { adminEmail } from "@/lib/constantData";
import { formattedCurrency } from "@/lib/helper";
import { InvoiceStatus, isValidInvoiceStatus } from "@/lib/invoiceUtils";

export const InvoiceDetails = ({
  invoice,
  availableProducts,
  onUpdate,
}: InvoiceDetailsProps) => {
  const [updatedInvoice, setUpdatedInvoice] = useState<Invoice>(invoice);

  const [newProduct, setNewProduct] = useState<{
    id: string;
    quantity: number;
    discount: number;
  }>({ id: "", quantity: 1, discount: 0 });

  const [isAddProductDialogOpen, setIsAddProductDialogOpen] = useState(false);
  const [editingProductIndex, setEditingProductIndex] = useState<number | null>(
    null
  );
  const [discountPercentage, setDiscountPercentage] = useState(
    invoice.discountPercentage || 0
  );
  const [productDiscount, setProductDiscount] = useState<number[]>(
    invoice?.products?.map((p) => p.discount) || []
  );
  const [sending, setSending] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [taxRate, setTaxRate] = useState(invoice.taxRate || 0); // Default tax rate
  const [shippingFee, setShippingFee] = useState(invoice.shippingFee || 0); // Default shipping fee
  const [invoiceAmount, setInvoiceAmount] = useState(invoice.amount || 0);
  const [amountPaid, setAmountPaid] = useState(invoice.amountPaid || 0);
  const [amountDue, setAmountDue] = useState(
    invoice.amount - (invoice.amountPaid || 0)
  );
  const [filteredProducts, setFilteredProducts] = useState(availableProducts);
  const [searchTerm, setSearchTerm] = useState("");

  const [serviceCharge, setServiceCharge] = useState(
    invoice.serviceCharge || 0
  );
  const [miscellaneous, setMiscellaneous] = useState(
    invoice.miscellaneous || 0
  );

  useEffect(() => {
    setUpdatedInvoice(invoice);
    setInvoiceAmount(invoice.amount || 0);
    setAmountPaid(invoice.amountPaid || 0);
    setAmountDue(invoice.amount - (invoice.amountPaid || 0));
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
    setDiscountPercentage(isNaN(value) ? 0 : value);
  };
  const handleTaxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseFloat(e.target.value);
    setTaxRate(isNaN(value) ? 0 : value);
  };
  const handleShippingChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseFloat(e.target.value);
    setShippingFee(isNaN(value) ? 0 : value);
  };

  const handleServiceChargeChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const value = parseFloat(e.target.value);
    setServiceCharge(isNaN(value) ? 0 : value);
  };

  const handleMiscellaneousChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const value = parseFloat(e.target.value);
    setMiscellaneous(isNaN(value) ? 0 : value);
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
      setProductDiscount((prev) => {
        return prev.map((p, i) => (i === index ? Number(value) : Number(p)));
      });

      updatedProducts[index] = {
        ...updatedProducts[index],
        discount: Number(value),
        price:
          updatedProducts[index].basePrice *
          updatedProducts[index].quantity *
          (1 - Number(value) / 100),
      };
    } else {
      updatedProducts[index] = { ...updatedProducts[index], [field]: value };
    }
    setUpdatedInvoice((prev) => ({ ...prev, products: updatedProducts }));
  };

  const resetProductDialog = () => {
    setNewProduct({ id: "", quantity: 1, discount: 0 });
    setEditingProductIndex(null);
    setIsAddProductDialogOpen(false);
  };

  const addProduct = () => {
    const selectedProduct = availableProducts.find(
      (p) => p.id === newProduct.id
    );
    if (selectedProduct) {
      const updatedProducts = updatedInvoice.products
        ? [...updatedInvoice.products]
        : []; // Ensure invoice.products is not undefined

      const existingProductIndex = updatedProducts.findIndex(
        (p) => p.id === selectedProduct.id
      );
      if (existingProductIndex !== -1) {
        updatedProducts[existingProductIndex].quantity += newProduct.quantity;
        updatedProducts[existingProductIndex].discount =
          productDiscount[existingProductIndex];
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
      setUpdatedInvoice((prev) => ({ ...prev, products: updatedProducts }));
      resetProductDialog();
    }
  };

  const removeProduct = (index: number) => {
    const updatedProducts = updatedInvoice.products
      ? [...updatedInvoice.products]
      : [];
    updatedProducts.splice(index, 1);
    setUpdatedInvoice((prev) => ({ ...prev, products: updatedProducts }));
  };

  const startEditingProduct = (index: number) => {
    if (updatedInvoice.products) {
      setEditingProductIndex(index);
      const productToEdit = updatedInvoice.products[index];
      setNewProduct({
        id: productToEdit.id,
        quantity: productToEdit.quantity,
        discount: productToEdit.discount,
      });
      setIsAddProductDialogOpen(true);
    }
  };

  const saveEditedProduct = () => {
    if (editingProductIndex !== null) {
      const updatedProducts = updatedInvoice.products
        ? [...updatedInvoice.products]
        : [];
      updatedProducts[editingProductIndex] = {
        ...updatedProducts[editingProductIndex],
        quantity: newProduct.quantity,
        discount: productDiscount[editingProductIndex],
        price:
          updatedProducts[editingProductIndex].basePrice *
          newProduct.quantity *
          (1 - productDiscount[editingProductIndex] / 100),
      };
      setUpdatedInvoice((prev) => ({ ...prev, products: updatedProducts }));
      resetProductDialog();
    }
  };

  const calculateSubtotal = () => {
    return updatedInvoice.products?.reduce(
      (sum, product) =>
        sum +
        product.basePrice *
          product.quantity *
          (1 - (product.discount || 0) / 100),
      0
    );
  };

  const calculateTotal = () => {
    const subtotal = calculateSubtotal() || 0;
    const discountAmount = subtotal * (discountPercentage / 100);
    const taxAmount = subtotal * (taxRate / 100);
    return subtotal - discountAmount + taxAmount + shippingFee;
  };

  const handleUpdateInvoice = async () => {
    try {
      setUpdating(true);
      const updatedInvoiceData = {
        ...updatedInvoice,
        amount: calculateTotal(),
        amountPaid: amountPaid,
        amountDue: amountDue,
        discountPercentage,
        taxRate,
        shippingFee,
        serviceCharge,
        miscellaneous,
        products: updatedInvoice.products,
      };

      onUpdate(updatedInvoiceData);
    } catch (error) {
      console.error("Error updating invoice:", error);
      toast.error("Error trying to update invoice", {
        description: "Failed to update invoice",
      });
    } finally {
      setUpdating(false);
    }
  };

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
                src="/assets/ville-logo.svg"
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
          {updatedInvoice.products && (
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
                  {updatedInvoice.products.map((product, index) => (
                    <TableRow key={index}>
                      <TableCell>{index + 1}</TableCell>
                      <TableCell>{product.name}</TableCell>
                      <TableCell>{product.basePrice.toFixed(2)}</TableCell>
                      <TableCell>{product.quantity}</TableCell>
                      <TableCell>
                        <Input
                          type="number"
                          value={productDiscount[index] || 0}
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
                  ))}
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
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="product" className="text-right">
                    Product
                  </Label>
                  <Select
                    onValueChange={(value) =>
                      setNewProduct((prev) => ({ ...prev, id: value }))
                    }
                    value={newProduct.id}
                  >
                    <SelectTrigger className="col-span-3">
                      <SelectValue placeholder="Select product" />
                    </SelectTrigger>
                    <SelectContent>
                      <Input
                        type="text"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
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
                  <Label htmlFor="quantity" className="text-right">
                    Quantity
                  </Label>
                  <Input
                    id="quantity"
                    type="number"
                    value={newProduct.quantity}
                    onChange={(e) =>
                      setNewProduct((prev) => ({
                        ...prev,
                        quantity: parseInt(e.target.value),
                      }))
                    }
                    className="col-span-3"
                    min="1"
                  />
                </div>
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
                />
                <span>
                  {formattedCurrency.format(
                    subTotal * (discountPercentage / 100)
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
                  onChange={handleTaxChange}
                />
                <span>
                  {formattedCurrency.format(subTotal * (taxRate / 100))}
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
                <span>{formattedCurrency.format(shippingFee)}</span>
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
                <span>{formattedCurrency.format(serviceCharge)}</span>
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
                <span>{formattedCurrency.format(miscellaneous)}</span>
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
