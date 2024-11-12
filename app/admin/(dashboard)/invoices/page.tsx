"use client";
import React, { useState } from "react";
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
import { CheckCheck, CircleX, Download, Eye, Search } from "lucide-react";

import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface Invoice {
  id: string;
  customerName: string;
  amount: number;
  dateCreated: string;
  dueDate: string;
  status: "paid" | "unpaid" | "due" | "pending";
}

export default function AdminInvoicesPage() {
  const [invoices, setInvoices] = useState<Invoice[]>([
    {
      id: "INV001",
      customerName: "John Doe",
      amount: 100,
      dateCreated: "2023-05-28",
      dueDate: "2023-06-01",
      status: "unpaid",
    },
    {
      id: "INV002",
      customerName: "Jane Smith",
      amount: 150,
      dateCreated: "2023-05-28",
      dueDate: "2023-06-15",
      status: "paid",
    },
    {
      id: "INV003",
      customerName: "Bob Johnson",
      amount: 320.75,
      dateCreated: "2023-05-28",
      dueDate: "2023-10-28",
      status: "due",
    },
    {
      id: "INV004",
      customerName: "Alice Brown",
      amount: 420.0,
      dateCreated: "2023-05-28",
      dueDate: "2023-11-05",
      status: "paid",
    },
    {
      id: "INV005",
      customerName: "Charlie Davis",
      amount: 150.25,
      dateCreated: "2023-05-28",
      dueDate: "2023-11-07",
      status: "pending",
    },
  ]);

  const [newInvoice, setNewInvoice] = useState<Omit<Invoice, "id">>({
    customerName: "",
    amount: 0,
    dateCreated: "",
    dueDate: "",
    status: "unpaid",
  });

  const handleCreateInvoice = () => {
    const newId = `INV${String(
      Math.max(0, ...invoices.map((i) => parseInt(i.id.replace("INV", "")))) + 1
    ).padStart(3, "0")}`;

    const invoice: Invoice = {
      ...newInvoice,
      id: newId,
      amount: newInvoice.amount > 0 ? newInvoice.amount : 0,
      dateCreated: new Date().toISOString().split("T")[0], // Default to today's date if not provided
    };
    setInvoices([...invoices, invoice]);
    setNewInvoice({
      customerName: "",
      amount: 0,
      dateCreated: "",
      dueDate: "",
      status: "unpaid",
    });
  };

  const handleUpdateInvoice = (id: string, updates: Partial<Invoice>) => {
    const index = invoices.findIndex((invoice) => invoice.id === id);

    if (index === -1) {
      console.warn(`Invoice with id ${id} not found.`);
      return;
    }

    setInvoices(
      invoices.map((invoice) =>
        invoice.id === id ? { ...invoice, ...updates } : invoice
      )
    );
  };

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Invoices</h2>
        <div className="flex items-center space-x-2">
          <Input placeholder="Search invoices..." className="max-w-sm" />
          <Button>
            <Search className="mr-2 h-4 w-4" /> Search
          </Button>
          <Dialog>
            <DialogTrigger asChild>
              <Button className="mb-4">Create New Invoice</Button>
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
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Invoice ID</TableHead>
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
              <TableCell>{invoice.id}</TableCell>
              <TableCell>{invoice.customerName}</TableCell>
              <TableCell>${invoice.amount.toFixed(2)}</TableCell>
              <TableCell>{invoice.dueDate}</TableCell>
              <TableCell>{invoice.status}</TableCell>
              <TableCell>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button variant="ghost" size="sm">
                        <Eye className="mr-2 h-4 w-4" />
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
                        <Download className="mr-2 h-4 w-4" />
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
                        onClick={() =>
                          handleUpdateInvoice(invoice.id, {
                            status:
                              invoice.status === "paid" ? "unpaid" : "paid",
                          })
                        }
                      >
                        {invoice.status === "paid" ? (
                          <CircleX />
                        ) : (
                          <CheckCheck />
                        )}
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>
                        {invoice.status === "paid"
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
  );
}
