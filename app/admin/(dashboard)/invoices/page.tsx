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

interface Invoice {
  id: string;
  invoiceNumber: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  amount: number;
  dateCreated: string;
  dueDate: string;
  status: "PAID" | "UNPAID" | "DUE" | "PENDING";
  products?: Array<{
    id: string;
    name: string;
    basePrice: number;
    quantity: number;
    price: number;
  }>;
}

const invoiceData = [
  {
    id: "1",
    invoiceNumber: "INV001",
    customerName: "John Doe",
    amount: 100,
    dateCreated: "2023-05-28",
    dueDate: "2023-06-01",
    status: "UNPAID",
  },
  {
    id: "2",
    invoiceNumber: "INV002",
    customerName: "Jane Smith",
    amount: 150,
    dateCreated: "2023-05-28",
    dueDate: "2023-06-15",
    status: "PAID",
  },
  {
    id: "3",
    invoiceNumber: "INV003",
    customerName: "Bob Johnson",
    amount: 320.75,
    dateCreated: "2023-05-28",
    dueDate: "2023-10-28",
    status: "DUE",
  },
  {
    id: "4",
    invoiceNumber: "INV004",
    customerName: "Alice Brown",
    amount: 420.0,
    dateCreated: "2023-05-28",
    dueDate: "2023-11-05",
    status: "PAID",
  },
  {
    id: "5",
    invoiceNumber: "INV005",
    customerName: "Charlie Davis",
    amount: 150.25,
    dateCreated: "2023-05-28",
    dueDate: "2023-11-07",
    status: "PENDING",
  },
];

export default function AdminInvoicesPage() {
  // const [invoices, setInvoices] = useState<Invoice[]>(invoiceData);
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

  /* const handleCreateInvoice = () => {
    if (
      !newInvoice.customerName ||
      newInvoice.amount <= 0 ||
      !newInvoice.dueDate
    ) {
      alert("Please fill out all fields with valid values.");
      return;
    }

    const newId = (invoices.length + 1).toString();
    const newInvoiceNumber = `INV${String(
      Math.max(0, ...invoices.map((i) => parseInt(i.id.replace("INV", "")))) + 1
    ).padStart(3, "0")}`;

    const invoice: Invoice = {
      ...newInvoice,
      id: newId,
      invoiceNumber: newInvoiceNumber,
      amount: newInvoice.amount > 0 ? newInvoice.amount : 0,
      dateCreated: new Date().toISOString().split("T")[0],
    };
    setInvoices([...invoices, invoice]);
    setNewInvoice({
      customerName: "",
      amount: 0,
      dateCreated: "",
      dueDate: "",
      status: "UNPAID",
    });
  }; */

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
                        <Button variant="ghost" size="sm">
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
