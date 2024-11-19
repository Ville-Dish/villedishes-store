/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";
import React, { useEffect, useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { CheckCheck, CircleX, Download, Eye, Search, Plus } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { toast } from "sonner";
import { InvoiceDetails } from "@/components/custom/invoice-details";
import jsPDF from "jspdf";
import "jspdf-autotable";
import { imageToBase64 } from "@/lib/imageToBase64";

// const invoiceData = [
//   {
//     id: "1",
//     invoiceNumber: "INV001",
//     customerName: "John Doe",
//     amount: 100,
//     dateCreated: "2023-05-28",
//     dueDate: "2023-06-01",
//     status: "UNPAID",
//   },
//   {
//     id: "2",
//     invoiceNumber: "INV002",
//     customerName: "Jane Smith",
//     amount: 150,
//     dateCreated: "2023-05-28",
//     dueDate: "2023-06-15",
//     status: "PAID",
//   },
//   {
//     id: "3",
//     invoiceNumber: "INV003",
//     customerName: "Bob Johnson",
//     amount: 320.75,
//     dateCreated: "2023-05-28",
//     dueDate: "2023-10-28",
//     status: "DUE",
//   },
//   {
//     id: "4",
//     invoiceNumber: "INV004",
//     customerName: "Alice Brown",
//     amount: 420.0,
//     dateCreated: "2023-05-28",
//     dueDate: "2023-11-05",
//     status: "PAID",
//   },
//   {
//     id: "5",
//     invoiceNumber: "INV005",
//     customerName: "Charlie Davis",
//     amount: 150.25,
//     dateCreated: "2023-05-28",
//     dueDate: "2023-11-07",
//     status: "PENDING",
//   },
// ];

export default function AdminInvoicesPage() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);

  const [newInvoice, setNewInvoice] = useState<
    Omit<Invoice, "id" | "invoiceNumber" | "dateCreated">
  >({
    customerName: "",
    customerEmail: "",
    customerPhone: "",
    amount: 0,
    dueDate: "",
    status: "UNPAID",
  });

  const [loading, setLoading] = useState<boolean>(true);
  const [dialogOpen, setDialogOpen] = useState(false);

  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);

  const [availableProducts, setAvailableProducts] = useState<
    Array<{ id: string; name: string; basePrice: number }>
  >([]);

  // Fetch invoices from the API
  useEffect(() => {
    const fetchInvoices = async () => {
      try {
        setLoading(true);
        const response = await fetch("/api/invoices", { method: "GET" });
        const data = await response.json();
        if (response.ok) {
          setInvoices(data.data || []);
        } else {
          console.error("Failed to fetch invoices:", data.message);
        }
      } catch (error) {
        console.error("Error fetching invoices:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchInvoices();
  }, []);

  // Fetch available products from the API
  useEffect(() => {
    const fetchAvailableProducts = async () => {
      try {
        const response = await fetch("/api/products", { method: "GET" });
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const products = (await response.json()).data.map((product: any) => ({
          id: product.id,
          name: product.name,
          basePrice: product.price, // Assuming 'price' is the field in the database
        }));
        setAvailableProducts(products);
      } catch (error) {
        console.error("Error fetching products:", error);
      }
    };

    fetchAvailableProducts();
  }, []);

  const handleCreateInvoice = async () => {
    const { customerName, customerEmail, customerPhone, dueDate, status } =
      newInvoice;

    // Client-side validation
    if (
      !customerName ||
      customerName.trim() === "" ||
      !customerEmail ||
      customerEmail.trim() === "" ||
      !customerPhone ||
      customerPhone.trim() === "" ||
      !dueDate
    ) {
      alert("Please fill out all fields with valid values.");
      return;
    }

    try {
      const response = await fetch("/api/invoices", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...newInvoice,
          dateCreated: new Date().toISOString().split("T")[0],
        }),
      });

      const result = await response.json();

      if (response.ok) {
        setInvoices((prev) => [...prev, result.data]);
        setNewInvoice({
          customerName: "",
          customerEmail: "",
          customerPhone: "",
          amount: 0,
          dueDate: "",
          status: "UNPAID",
        });
        // Close the dialog
        setDialogOpen(false);

        // Show a success message
        toast.success("Invoice created successfully!");
      } else {
        toast.error(`Failed to create invoice: ${result.message}`);
        console.error("Failed to create invoice:", result.message);
      }
    } catch (error) {
      toast.error("An unexpected error occurred. Please try again.");
      console.error("Error creating invoice:", error);
    }
  };

  const handleUpdateInvoice = async (updatedInvoice: Invoice) => {
    console.log({ updatedInvoice });
    try {
      const response = await fetch(`/api/invoices`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updatedInvoice),
      });

      if (!response.ok) {
        throw new Error("Failed to update invoice");
      }

      const result = await response.json();
      setInvoices(
        invoices.map((inv) =>
          inv.id === updatedInvoice.id ? result.data : inv
        )
      );
      setSelectedInvoice(null);
      toast.success("Invoice updated successfully");
    } catch (error) {
      console.error("Error updating invoice:", error);
      toast.error("Failed to update invoice");
    }
  };

  const handleViewInvoice = (invoice: Invoice) => {
    setSelectedInvoice(invoice);
  };

  const handleDeleteInvoice = (invoice: Invoice) => {
    setSelectedInvoice(invoice);
  };

  const handleDownloadInvoice = (invoice: Invoice) => {
    toast.info(`Downloading Invoice ${invoice.invoiceNumber}`);
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.width;
    const pageHeight = doc.internal.pageSize.height;

    let yPosition = 20;

    // const logoBase64 = imageToBase64("/assets/ville.svg");
    // console.log("Logo Base64 For SVG", logoBase64);

    const logoPNGBase64 = imageToBase64("/assets/villeCap.png");
    console.log("Logo Base64 For PNG", logoPNGBase64);

    // Helper function to add a card-like section
    const addCard = (
      title: string,
      content: () => void,
      width: number,
      height: number
    ) => {
      if (yPosition + height > pageHeight - 20) {
        doc.addPage();
        yPosition = 20;
      }

      doc.setDrawColor(200);
      doc.setFillColor(250, 250, 250);
      doc.roundedRect(10, yPosition, width, height, 3, 3, "FD");
      doc.setFont("helvetica", "bold");
      doc.setFontSize(12);
      doc.setTextColor(44, 62, 80);
      doc.text(title, 10 + width / 2, yPosition + 10, { align: "center" });
      doc.setFont("helvetica", "normal");
      doc.setFontSize(10);
      doc.setTextColor(52, 73, 94);
      content();
      yPosition += height + 5; // Reduced spacing between sections
    };

    // Helper function to add bold text
    const addBoldText = (text: string, x: number, y: number) => {
      doc.setFont("helvetica", "bold");
      doc.text(text, x, y);
      doc.setFont("helvetica", "normal");
    };

    // Add header with invoice title
    doc.setFont("helvetica", "bold");
    doc.setFontSize(24);
    doc.setTextColor(44, 62, 80);
    doc.text("INVOICE", pageWidth / 2, yPosition, { align: "center" });
    yPosition += 15;

    // Bill From and Bill To cards side by side
    const cardWidth = (pageWidth - 30) / 2;
    doc.setDrawColor(200);
    doc.setFillColor(250, 250, 250);
    doc.roundedRect(10, yPosition, cardWidth, 60, 3, 3, "FD");
    doc.roundedRect(20 + cardWidth, yPosition, cardWidth, 60, 3, 3, "FD");

    // Bill From card
    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.text("Bill From", 10 + cardWidth / 2, yPosition + 10, {
      align: "center",
    });
    // doc.addImage(logoBase64, "SVG", 15, yPosition + 15, 20, 20);
    // doc.addImage(logoPNGBase64, "PNG", 15, yPosition + 15, 20, 20);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    addBoldText("Company Name:", 15, yPosition + 25);
    doc.text("VilleDishes", 50, yPosition + 25);
    addBoldText("Company Email:", 15, yPosition + 35);
    doc.text("villedishes@gmail.com", 50, yPosition + 35);
    addBoldText("Company Phone:", 15, yPosition + 45);
    doc.text("587-984-4409", 50, yPosition + 45);
    doc.text("Pay via Interac using:", 15, yPosition + 55);
    addBoldText("villedishes@gmail.com", 50, yPosition + 55);

    // Bill To card
    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.text("Bill To", 20 + cardWidth * 1.5, yPosition + 10, {
      align: "center",
    });
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    addBoldText("Customer Name:", 25 + cardWidth, yPosition + 25);
    doc.text(invoice.customerName, 65 + cardWidth, yPosition + 25);
    addBoldText("Customer Email:", 25 + cardWidth, yPosition + 35);
    doc.text(invoice.customerEmail, 65 + cardWidth, yPosition + 35);
    addBoldText("Customer Phone:", 25 + cardWidth, yPosition + 45);
    doc.text(invoice.customerPhone, 65 + cardWidth, yPosition + 45);

    yPosition += 65;

    // Invoice Overview card
    addCard(
      "Invoice Overview",
      () => {
        const labelX = 15;
        const valueX = 15;
        const lineHeight = 7;

        doc.setFont("helvetica", "bold");
        doc.text("Invoice Number", labelX, yPosition + 20);
        doc.text("Date Created", labelX + 50, yPosition + 20);
        doc.text("Due Date", labelX + 100, yPosition + 20);
        doc.text("Status", labelX + 150, yPosition + 20);

        doc.setFont("helvetica", "normal");
        doc.text(invoice.invoiceNumber, valueX, yPosition + 20 + lineHeight);
        doc.text(invoice.dateCreated, valueX + 50, yPosition + 20 + lineHeight);
        doc.text(invoice.dueDate, valueX + 100, yPosition + 20 + lineHeight);
        doc.text(invoice.status, valueX + 150, yPosition + 20 + lineHeight);
      },
      pageWidth - 20,
      40
    );

    // Product Details card
    addCard(
      "Invoice Product Details",
      () => {
        if (invoice.products && invoice.products.length > 0) {
          const tableColumn = [
            "S/N",
            "Product",
            "Base Price ($)",
            "Quantity",
            "Price ($)",
          ];
          const tableRows = invoice.products.map((product, index) => [
            index + 1,
            product.name,
            product.basePrice.toFixed(2),
            product.quantity,
            (product.basePrice * product.quantity).toFixed(2),
          ]);

          (doc as any).autoTable({
            startY: yPosition + 15,
            head: [tableColumn],
            body: tableRows,
            theme: "grid",
            headStyles: {
              fillColor: [41, 128, 185],
              textColor: 255,
              fontSize: 10,
              fontStyle: "bold",
            },
            bodyStyles: { textColor: 50, fontSize: 9 },
            alternateRowStyles: { fillColor: [242, 242, 242] },
            margin: { top: 15, right: 10, bottom: 10, left: 10 },
            // startY: yPosition + 15,
          });
        } else {
          doc.text("No products found", 15, yPosition + 25);
        }
      },
      pageWidth - 20,
      (doc as any).autoTable.previous.finalY
        ? (doc as any).autoTable.previous.finalY - yPosition + 20
        : 40
    );

    yPosition = (doc as any).autoTable.previous.finalY + 10;

    // Invoice Summary card
    addCard(
      "Invoice Summary",
      () => {
        const subtotal = invoice.products
          ? invoice.products.reduce(
              (sum, product) => sum + product.basePrice * product.quantity,
              0
            )
          : 0;
        const discountAmount =
          subtotal * ((invoice.discountPercentage || 0) / 100);
        const taxAmount = subtotal * ((invoice.taxRate || 0) / 100);
        const total =
          subtotal - discountAmount + taxAmount + (invoice.shippingFee || 0);

        const addSummaryRow = (
          label: string,
          value: string,
          y: number,
          isBold: boolean = false
        ) => {
          if (isBold) doc.setFont("helvetica", "bold");
          doc.text(label, 15, y);
          doc.text(value, pageWidth - 15, y, { align: "right" });
          if (isBold) doc.setFont("helvetica", "normal");
        };

        addSummaryRow("Subtotal:", `$${subtotal.toFixed(2)}`, yPosition + 25);
        addSummaryRow(
          "Discount:",
          `$${discountAmount.toFixed(2)}`,
          yPosition + 32
        );
        addSummaryRow("Tax:", `$${taxAmount.toFixed(2)}`, yPosition + 39);
        addSummaryRow(
          "Shipping Fee:",
          `$${(invoice.shippingFee || 0).toFixed(2)}`,
          yPosition + 46
        );
        addSummaryRow("Total:", `$${total.toFixed(2)}`, yPosition + 56, true);
      },
      pageWidth - 20,
      70
    );

    // Add a footer
    doc.setFont("helvetica", "italic");
    doc.setFontSize(8);
    doc.setTextColor(127, 140, 141);
    doc.text("Thank you for your business!", pageWidth / 2, pageHeight - 10, {
      align: "center",
    });

    // Save the PDF
    doc.save(`Invoice_${invoice.invoiceNumber}.pdf`);
    toast.info(`Downloaded Invoice ${invoice.invoiceNumber} successfully`);
  };

  if (loading) {
    return <p>Loading invoices...</p>;
  }

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row items-center justify-between space-y-2 sm:space-y-0">
        <h2 className="text-3xl font-bold tracking-tight">Invoices</h2>
        <div className="flex items-center space-x-2">
          <Input placeholder="Search invoices..." className="max-w-[200px]" />
          <Button>
            <Search className="mr-2 h-4 w-4" /> Search
          </Button>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => setDialogOpen(true)}>
                <Plus className="mr-2 h-4 w-4" /> Create New Invoice
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create New Invoice</DialogTitle>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="customerName" className="text-right">
                    Customer Name
                  </Label>
                  <Input
                    id="customerName"
                    value={newInvoice.customerName}
                    onChange={(e) =>
                      setNewInvoice({
                        ...newInvoice,
                        customerName: e.target.value,
                      })
                    }
                    className="col-span-3"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="customerEmail" className="text-right">
                    Customer Email
                  </Label>
                  <Input
                    id="customerEmail"
                    type="email"
                    value={newInvoice.customerEmail}
                    onChange={(e) =>
                      setNewInvoice({
                        ...newInvoice,
                        customerEmail: e.target.value,
                      })
                    }
                    className="col-span-3"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="customerPhone" className="text-right">
                    Customer Phone
                  </Label>
                  <Input
                    id="customerPhone"
                    value={newInvoice.customerPhone}
                    onChange={(e) =>
                      setNewInvoice({
                        ...newInvoice,
                        customerPhone: e.target.value,
                      })
                    }
                    className="col-span-3"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="amount" className="text-right">
                    Amount
                  </Label>
                  <Input
                    id="amount"
                    type="number"
                    value={newInvoice.amount}
                    onChange={(e) =>
                      setNewInvoice({
                        ...newInvoice,
                        amount: parseFloat(e.target.value),
                      })
                    }
                    className="col-span-3"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="dueDate" className="text-right">
                    Due Date
                  </Label>
                  <Input
                    id="dueDate"
                    type="date"
                    value={newInvoice.dueDate}
                    onChange={(e) =>
                      setNewInvoice({ ...newInvoice, dueDate: e.target.value })
                    }
                    className="col-span-3"
                  />
                </div>
              </div>
              <Button onClick={handleCreateInvoice}>Create Invoice</Button>
            </DialogContent>
          </Dialog>
        </div>
      </div>
      <div className="border rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Invoice Number</TableHead>
              <TableHead>Customer</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Due Date</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {invoices.map((invoice) => (
              <TableRow key={invoice.id}>
                <TableCell>{invoice.invoiceNumber}</TableCell>
                <TableCell>{invoice.customerName}</TableCell>
                <TableCell>${invoice.amount.toFixed(2)}</TableCell>
                <TableCell>{invoice.dueDate}</TableCell>
                <TableCell>{invoice.status}</TableCell>
                <TableCell>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleViewInvoice(invoice)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>View</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>

                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDownloadInvoice(invoice)}
                        >
                          <Download className="h-4 w-4" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Download</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>

                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() =>
                            handleUpdateInvoice({
                              ...invoice,
                              status:
                                invoice.status === "PAID" ? "UNPAID" : "PAID",
                            })
                          }
                        >
                          {invoice.status === "PAID" ? (
                            <CircleX className="h-4 w-4" />
                          ) : (
                            <CheckCheck className="h-4 w-4" />
                          )}
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>
                          {invoice.status === "PAID"
                            ? "Mark as Unpaid"
                            : "Mark as Paid"}
                        </p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {selectedInvoice && (
        <Dialog
          open={!!selectedInvoice}
          onOpenChange={() => setSelectedInvoice(null)}
        >
          <DialogContent className="max-w-4xl w-full max-h-[90vh]">
            <DialogHeader>
              <DialogTitle>Invoice Details</DialogTitle>
              <DialogDescription className="sr-only">
                Invoice details {selectedInvoice.invoiceNumber}
              </DialogDescription>
            </DialogHeader>
            <ScrollArea className="max-h-[calc(90vh-100px)] pr-4">
              <InvoiceDetails
                invoice={selectedInvoice}
                availableProducts={availableProducts}
                onUpdate={handleUpdateInvoice}
              />
            </ScrollArea>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
