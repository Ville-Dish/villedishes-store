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

interface Invoice {
  id: number;
  customerName: string;
  amount: number;
  dueDate: string;
  status: "paid" | "unpaid";
}

export default function AdminInvoicesPage() {
  const [invoices, setInvoices] = useState<Invoice[]>([
    {
      id: 1,
      customerName: "John Doe",
      amount: 100,
      dueDate: "2023-06-01",
      status: "unpaid",
    },
    {
      id: 2,
      customerName: "Jane Smith",
      amount: 150,
      dueDate: "2023-06-15",
      status: "paid",
    },
  ]);

  const [newInvoice, setNewInvoice] = useState<Omit<Invoice, "id">>({
    customerName: "",
    amount: 0,
    dueDate: "",
    status: "unpaid",
  });

  const handleCreateInvoice = () => {
    const invoice: Invoice = {
      ...newInvoice,
      id: Math.max(0, ...invoices.map((i) => i.id)) + 1,
    };
    setInvoices([...invoices, invoice]);
    setNewInvoice({
      customerName: "",
      amount: 0,
      dueDate: "",
      status: "unpaid",
    });
  };

  const handleUpdateInvoice = (id: number, updates: Partial<Invoice>) => {
    setInvoices(
      invoices.map((invoice) =>
        invoice.id === id ? { ...invoice, ...updates } : invoice
      )
    );
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Invoices</h1>
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
                  setNewInvoice({ ...newInvoice, customerName: e.target.value })
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
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Invoice ID</TableHead>
            <TableHead>Customer</TableHead>
            <TableHead>Amount</TableHead>
            <TableHead>Due Date</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Action</TableHead>
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
                <Button
                  onClick={() =>
                    handleUpdateInvoice(invoice.id, {
                      status: invoice.status === "paid" ? "unpaid" : "paid",
                    })
                  }
                >
                  Mark as {invoice.status === "paid" ? "Unpaid" : "Paid"}
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
