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

export const InvoiceDetails = ({
  invoice,
  availableProducts,
  onUpdate,
}: InvoiceDetailsProps) => {
  const [updatedInvoice, setUpdatedInvoice] = useState<Invoice>(invoice);

  const [newProduct, setNewProduct] = useState<{
    id: string;
    quantity: number;
  }>({ id: "", quantity: 1 });

  const [isAddProductDialogOpen, setIsAddProductDialogOpen] = useState(false);
  const [editingProductIndex, setEditingProductIndex] = useState<number | null>(
    null
  );
  const [discountPercentage, setDiscountPercentage] = useState(
    invoice.discountPercentage || 0
  );
  const [sending, setSending] = useState(false);
  const [updating, setUpdating] = useState(false);
  // const [taxRate, setTaxRate] = useState<number>(5); // Default tax rate
  const [taxRate, setTaxRate] = useState(invoice.taxRate || 0); // Default tax rate
  // const [shippingFee, setShippingFee] = useState<number>(10); // Default shipping fee
  const [shippingFee, setShippingFee] = useState(invoice.shippingFee || 0); // Default shipping fee

  useEffect(() => {
    setUpdatedInvoice(invoice);
  }, [invoice]);

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

  const handleStatusChange = (value: string) => {
    setUpdatedInvoice((prev) => ({
      ...prev,
      status: value as Invoice["status"],
    }));
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
        };
      }
    } else {
      updatedProducts[index] = { ...updatedProducts[index], [field]: value };
    }
    setUpdatedInvoice((prev) => ({ ...prev, products: updatedProducts }));
  };

  const addProduct = () => {
    const selectedProduct = availableProducts.find(
      (p) => p.id === newProduct.id
    );
    if (selectedProduct) {
      const updatedProducts = updatedInvoice.products
        ? [...updatedInvoice.products]
        : []; // Ensure invoice.products is not undefined
      updatedProducts.push({
        id: selectedProduct.id,
        name: selectedProduct.name,
        basePrice: selectedProduct.basePrice,
        quantity: newProduct.quantity,
        price: selectedProduct.basePrice * newProduct.quantity,
      });
      setUpdatedInvoice((prev) => ({ ...prev, products: updatedProducts }));
      setNewProduct({ id: "", quantity: 1 });
      setIsAddProductDialogOpen(false);
    }
  };

  const removeProduct = (index: number) => {
    const updatedProducts = updatedInvoice.products?.filter(
      (_, i) => i !== index
    );
    setUpdatedInvoice((prev) => ({ ...prev, products: updatedProducts }));
  };

  const startEditingProduct = (index: number) => {
    if (updatedInvoice.products) {
      setEditingProductIndex(index);
      const productToEdit = updatedInvoice.products[index];
      setNewProduct({ id: productToEdit.id, quantity: productToEdit.quantity });
      setIsAddProductDialogOpen(true);
    }
  };

  const saveEditedProduct = () => {
    if (editingProductIndex !== null) {
      handleProductChange(editingProductIndex, "id", newProduct.id);
      handleProductChange(editingProductIndex, "quantity", newProduct.quantity);
      setEditingProductIndex(null);
      setIsAddProductDialogOpen(false);
      setNewProduct({ id: "", quantity: 1 });
    }
  };

  const calculateSubtotal = () => {
    return updatedInvoice.products?.reduce(
      (sum, product) => sum + product.basePrice * product.quantity,
      0
    );
  };

  const calculateTotal = () => {
    const subtotal = calculateSubtotal() || 0;
    const discountAmount = subtotal * (discountPercentage / 100);
    const taxAmount = subtotal * (taxRate / 100);
    return (subtotal - discountAmount + taxAmount + shippingFee).toFixed(2);
  };

  const handleUpdateInvoice = async () => {
    try {
      setUpdating(true);
      const updatedInvoiceData = {
        ...updatedInvoice,
        amount: parseFloat(calculateTotal()),
        discountPercentage,
        taxRate,
        shippingFee,
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
  // const total = calculateTotal() || 0;

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Image
                src="/assets/ville.svg"
                alt="Company Logo"
                width={40}
                height={40}
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

      <Card>
        <CardHeader>
          <CardTitle>Invoice Overview</CardTitle>
        </CardHeader>
        <CardContent>
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
                  <SelectItem value="UNPAID">Unpaid</SelectItem>
                  <SelectItem value="DUE">Due</SelectItem>
                  <SelectItem value="PAID">Paid</SelectItem>
                  <SelectItem value="PENDING">Pending</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

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
                        {(product.basePrice * product.quantity).toFixed(2)}
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
              <Button className="mt-4">Add Product</Button>
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
                      {availableProducts.map((p) => (
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
              >
                {editingProductIndex !== null
                  ? "Save Changes"
                  : "Add to Invoice"}
              </Button>
            </DialogContent>
          </Dialog>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Invoice Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span>Subtotal:</span>
              <span>${subTotal.toFixed(2)}</span>
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
                  ${(subTotal * (discountPercentage / 100)).toFixed(2)}
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
                <span>${(subTotal * (taxRate / 100)).toFixed(2)}</span>
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
                  onChange={handleShippingChange}
                />
                <span>${shippingFee.toFixed(2)}</span>
              </div>
            </div>
            <div className="flex justify-between text-lg font-bold">
              <span>Total:</span>
              <span>${calculateTotal()}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex flex-col sm:flex-row gap-4 justify-between">
        <Button
          className="w-full sm:w-auto"
          onClick={handleUpdateInvoice}
          disabled={updating || sending}
        >
          {updating && <Loader className="animate-spin w-4 h-4 mr-2" />}
          Update Invoice
        </Button>
        <Button
          className="w-full sm:w-auto"
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
