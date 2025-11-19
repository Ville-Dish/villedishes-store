"use client";

import { Button } from "@/components/ui/button";
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
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  CheckCheck,
  ChevronsLeft,
  ChevronsRight,
  CircleX,
  Download,
  Eye,
  Pencil,
  Plus,
} from "lucide-react";
import { lazy, useCallback, useEffect, useState } from "react";
import { toast } from "sonner";

import { createInvoicePDF } from "@/lib/invoicePdfGenerate";
import { saveAs } from "file-saver";
import "jspdf-autotable";

import { DatePickerWithRange } from "@/components/custom/date-range-picker";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { useLoading } from "@/context/LoadingContext";
import { cn } from "@/lib/utils";

const InvoiceDetails = lazy(() =>
  import("@/components/custom/invoice-details").then((module) => ({
    default: module.InvoiceDetails,
  }))
);

// const generatePDF = lazy(() => import("@/lib/invoicePdfGenerate").then(module => ({
//   default: module.createInvoicePDF
// })));

type InvoiceProduct = {
  id: string;
  name: string;
  basePrice: number;
};

type SortField = "customerName" | "amount" | "dueDate" | null;
type SortDirection = "asc" | "desc" | null;

export default function AdminInvoicesPage() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [filteredInvoices, setFilteredInvoices] = useState<Invoice[]>([]);
  const [newInvoice, setNewInvoice] = useState<
    Omit<Invoice, "id" | "invoiceNumber" | "dateCreated">
  >({
    customerName: "",
    customerEmail: "",
    customerPhone: "",
    amount: 0,
    amountPaid: 0,
    amountDue: 0,
    dueDate: "",
    status: "PENDING",
  });

  const { setIsLoading } = useLoading();
  const [loading, setLoading] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);

  // PDF Preview
  const [pdfPreviewUrl, setPdfPreviewUrl] = useState<string | null>(null);
  const [pdfPreviewOpen, setPdfPreviewOpen] = useState(false);

  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);

  const [availableProducts, setAvailableProducts] = useState<InvoiceProduct[]>(
    []
  );
  const [searchTerm, setSearchTerm] = useState<string>("");

  //Filter state
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [dateRange, setDateRange] = useState<{
    from: Date | undefined;
    to: Date | undefined;
  }>({
    from: undefined,
    to: undefined,
  });
  const [amountRange, setAmountRange] = useState<[number, number]>([0, 10000]);
  const [maxAmount, setMaxAmount] = useState<number>(10000);

  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(20);
  const [totalPages, setTotalPages] = useState(1);

  const [sortField, setSortField] = useState<SortField>(null);
  const [sortDirection, setSortDirection] = useState<SortDirection>(null);

  // Add this sorting handler
  const handleSort = (field: SortField) => {
    if (sortField === field) {
      // Cycle through: asc -> desc -> null
      if (sortDirection === "asc") {
        setSortDirection("desc");
      } else if (sortDirection === "desc") {
        setSortDirection(null);
        setSortField(null);
      }
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  // Add this after the existing useEffect hooks
  useEffect(() => {
    // Update URL when page changes (only for pages > 1)
    if (currentPage > 1) {
      window.history.pushState({}, "", `?page=${currentPage}`);
    } else {
      window.history.pushState({}, "", window.location.pathname);
    }
  }, [currentPage]);

  // Add this effect to handle initial page from URL
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const page = parseInt(params.get("page") || "1");
    setCurrentPage(page);
  }, []);

  // Fetch invoices from the API
  useEffect(() => {
    const fetchInvoices = async () => {
      try {
        setLoading(true);
        const response = await fetch("/api/invoices", { method: "GET" });
        const data = await response.json();
        if (response.ok) {
          setInvoices(data.data || []);
          setFilteredInvoices(data.data || []);

          // Calculate the maximum amount for the slider
          const maxInvoiceAmount = Math.max(
            ...data.data.map((invoice: Invoice) => invoice.amount)
          );
          const roundedMaxAmount = Math.ceil(maxInvoiceAmount / 1000) * 1000; // Round up to the nearest thousand
          setMaxAmount(roundedMaxAmount);
          setAmountRange([0, roundedMaxAmount]);
        } else {
          console.error("Failed to fetch invoices:", data.message);
        }
      } catch (error) {
        console.error("Error fetching invoices:", error);
      } finally {
        setLoading(false);
        setIsLoading(false);
      }
    };
    fetchInvoices();
  }, [setIsLoading]);

  // Fetch available products from the API
  useEffect(() => {
    const fetchAvailableProducts = async () => {
      try {
        const response = await fetch("/api/products", { method: "GET" });
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const products = (await response.json()).data.map(
          (product: MenuItem) => ({
            id: product.id,
            name: product.name,
            basePrice: product.price, // Assuming 'price' is the field in the database
          })
        );
        setAvailableProducts(products);
      } catch (error) {
        console.error("Error fetching products:", error);
      }
    };

    fetchAvailableProducts();
  }, []);

  const applyFiltersAndSearch = useCallback(() => {
    let filtered = [...invoices];

    // Apply search
    if (searchTerm.trim() !== "") {
      filtered = filtered.filter((invoice) =>
        Object.values(invoice).some((value) =>
          String(value).toLowerCase().includes(searchTerm.toLowerCase())
        )
      );
    }

    // Apply status filter
    if (statusFilter && statusFilter !== "all") {
      filtered = filtered.filter((invoice) => invoice.status === statusFilter);
    }

    // Apply date range filter
    if (dateRange.from && dateRange.to) {
      filtered = filtered.filter((invoice) => {
        const invoiceDate = new Date(invoice.dateCreated);
        return invoiceDate >= dateRange.from! && invoiceDate <= dateRange.to!;
      });
    }

    // Apply amount range filter
    filtered = filtered.filter(
      (invoice) =>
        invoice.amount >= amountRange[0] && invoice.amount <= amountRange[1]
    );

    // Apply sorting
    if (sortField && sortDirection) {
      filtered.sort((a, b) => {
        if (sortField === "customerName") {
          return sortDirection === "asc"
            ? a.customerName.localeCompare(b.customerName)
            : b.customerName.localeCompare(a.customerName);
        }
        if (sortField === "amount") {
          return sortDirection === "asc"
            ? a.amount - b.amount
            : b.amount - a.amount;
        }
        if (sortField === "dueDate") {
          const dateA = new Date(a.dueDate).getTime();
          const dateB = new Date(b.dueDate).getTime();
          return sortDirection === "asc" ? dateA - dateB : dateB - dateA;
        }
        return 0;
      });
    }

    // Update total pages
    setTotalPages(Math.ceil(filtered.length / itemsPerPage));

    // Apply pagination
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    filtered = filtered.slice(startIndex, endIndex);

    setFilteredInvoices(filtered);
  }, [
    searchTerm,
    statusFilter,
    dateRange,
    amountRange,
    invoices,
    currentPage,
    itemsPerPage,
    sortField,
    sortDirection,
  ]);

  // Add this pagination handler
  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
    window.scrollTo(0, 0);
  };

  useEffect(() => {
    applyFiltersAndSearch();
  }, [applyFiltersAndSearch]);

  const handleCreateInvoice = async () => {
    const { customerName, customerEmail, customerPhone, dueDate } = newInvoice;

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
        applyFiltersAndSearch();
        setNewInvoice({
          customerName: "",
          customerEmail: "",
          customerPhone: "",
          amount: 0,
          amountPaid: 0,
          amountDue: 0,
          dueDate: "",
          status: "PENDING",
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

      // Ensure the returned data has all the necessary fields
      const updatedData = {
        ...result.data,
        products: updatedInvoice.products, // Preserve products if not returned from API
      };

      // Update the invoices state
      setInvoices((prevInvoices) =>
        prevInvoices.map((inv) =>
          inv.id === updatedInvoice.id ? updatedData : inv
        )
      );

      // Update filtered invoices
      setFilteredInvoices((prevFiltered) =>
        prevFiltered.map((inv) =>
          inv.id === updatedInvoice.id ? result.data : inv
        )
      );

      // Update selected invoice if it's the one being edited
      if (selectedInvoice?.id === updatedInvoice.id) {
        setSelectedInvoice(updatedData);
      }

      return updatedData; // Return the updated data
    } catch (error) {
      console.error("Error updating invoice:", error);
      toast.error("Failed to update invoice");
      throw error;
    }
  };

  const handleViewInvoice = (invoice: Invoice) => {
    setSelectedInvoice(invoice);
  };

  const handleDownloadInvoice = async (invoice: Invoice) => {
    try {
      toast.info(`Downloading Invoice ${invoice.invoiceNumber}`);

      const invoiceName = (invoice.customerName || "")
        .replace(/[^\w\s]/g, "") // remove special characters
        .replace(/\s+/g, "_") // replaces all spaces (and tabs/newlines) with underscores
        .slice(0, 20)
        .toUpperCase(); // limit to 20 characters

      // Call createInvoicePDF to generate the PDF content as Uint8Array
      // const pdfModule = await generatePDF
      const pdfData = await createInvoicePDF(invoice);

      // Create a new Uint8Array to ensure we have a proper ArrayBuffer
      const uint8Array = new Uint8Array(pdfData);

      // Create a Blob from the Uint8Array and download it
      const blob = new Blob([uint8Array], { type: "application/pdf" });
      saveAs(
        blob,
        invoiceName
          ? `${invoiceName}.pdf`
          : `Invoice_${invoice.invoiceNumber}.pdf`
      );

      toast.info(`Downloaded Invoice ${invoice.invoiceNumber} successfully`);
    } catch (error) {
      console.error("Error generating invoice PDF:", error);
      toast.error("Failed to download the invoice. Please try again.");
    }
  };

  const handlePreviewInvoice = async (invoice: Invoice) => {
    try {
      const pdfData = await createInvoicePDF(invoice);

      // Create a new Uint8Array to ensure we have a proper ArrayBuffer
      const uint8Array = new Uint8Array(pdfData);

      const blob = new Blob([uint8Array], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);

      setPdfPreviewUrl(url); // store in state
      setPdfPreviewOpen(true); // open dialog/modal
    } catch (err) {
      console.error(err);
      toast.error("Failed to load PDF preview");
    }
  };

  const getInvoiceIndex = (invoice: Invoice) => {
    return invoices.findIndex((inv) => inv.id === invoice.id);
  };

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row items-center justify-between space-y-2 sm:space-y-0">
        <h2 className="text-3xl font-bold tracking-tight">Invoices</h2>
        <div className="flex items-center space-x-2">
          <Input
            placeholder="Search invoices..."
            className="max-w-[200px]"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => setDialogOpen(true)} variant="create">
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
              <Button onClick={handleCreateInvoice} variant="submit">
                Create Invoice
              </Button>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="flex space-x-4 mb-4">
        <Select onValueChange={(value) => setStatusFilter(value)}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter by Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="PAID">Paid</SelectItem>
            <SelectItem value="UNPAID">Unpaid</SelectItem>
            <SelectItem value="DUE">Due</SelectItem>
          </SelectContent>
        </Select>
        <DatePickerWithRange
          date={{
            from: dateRange.from,
            to: dateRange.to,
          }}
          setDate={(newDateRange) => {
            setDateRange({
              from: newDateRange?.from || undefined,
              to: newDateRange?.to || undefined,
            });
          }}
        />
        <div />
        <div className="w-full md:w-2/4">
          <Label htmlFor="amount-range">Amount Range</Label>
          <div className="flex items-center space-x-2">
            <span className="text-sm font-medium">${amountRange[0]}</span>
            <Slider
              id="amount-range"
              min={0}
              max={maxAmount}
              step={20}
              value={amountRange}
              onValueChange={(value: number[]) =>
                setAmountRange(value as [number, number])
              }
              className="flex-1"
              variant="both"
            />
            <span className="text-sm font-medium">${amountRange[1]}</span>
          </div>
        </div>
      </div>

      <div className="border rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>S/N</TableHead>
              <TableHead>Invoice Number</TableHead>
              <TableHead
                className="cursor-pointer hover:bg-muted/50"
                onClick={() => handleSort("customerName")}
              >
                <div className="flex items-center">
                  Customer
                  {sortField === "customerName" && (
                    <span className="ml-2">
                      {sortDirection === "asc" ? "↑" : "↓"}
                    </span>
                  )}
                </div>
              </TableHead>
              <TableHead
                className="cursor-pointer hover:bg-muted/50"
                onClick={() => handleSort("amount")}
              >
                <div className="flex items-center">
                  Amount
                  {sortField === "amount" && (
                    <span className="ml-2">
                      {sortDirection === "asc" ? "↑" : "↓"}
                    </span>
                  )}
                </div>
              </TableHead>
              <TableHead
                className="cursor-pointer hover:bg-muted/50"
                onClick={() => handleSort("dueDate")}
              >
                <div className="flex items-center">
                  Due Date
                  {sortField === "dueDate" && (
                    <span className="ml-2">
                      {sortDirection === "asc" ? "↑" : "↓"}
                    </span>
                  )}
                </div>
              </TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={7} className="h-24 text-center">
                  <div className="flex justify-center items-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                  </div>
                </TableCell>
              </TableRow>
            ) : filteredInvoices.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="h-24 text-center">
                  <p className="text-lg text-muted-foreground">
                    {searchTerm
                      ? "No matching invoices found"
                      : "There are no invoices yet"}
                  </p>
                </TableCell>
              </TableRow>
            ) : (
              filteredInvoices.map((invoice) => (
                <TableRow key={invoice.id}>
                  <TableCell>{getInvoiceIndex(invoice) + 1}</TableCell>
                  <TableCell>{invoice.invoiceNumber}</TableCell>
                  <TableCell>{invoice.customerName}</TableCell>
                  <TableCell>${invoice.amount.toFixed(2)}</TableCell>
                  <TableCell>{invoice.dueDate}</TableCell>
                  <TableCell>
                    <span
                      className={cn(
                        "font-medium border rounded-md px-3 py-1 text-white text-center inline-block cursor-default transition-colors",
                        {
                          "bg-[#d57771] border-[#d57771] hover:bg-[#d3736d]":
                            invoice.status === "UNPAID",
                          "bg-green-500 border-green-500 hover:bg-green-600":
                            invoice.status === "PAID",
                          "bg-[#da281c] border-[#da281c] hover:bg-[#b4443c]":
                            invoice.status === "DUE",
                          "bg-[#fe9e1d] border-[#fe9e1d] hover:bg-[#c6893a]":
                            invoice.status === "PENDING",
                        }
                      )}
                    >
                      {invoice.status}
                    </span>
                  </TableCell>
                  <TableCell>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="cursor-pointer"
                            onClick={() => handleViewInvoice(invoice)}
                          >
                            <Pencil className="size-4" color="#fe9e1d" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Edit Invoice</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>

                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="cursor-pointer"
                            onClick={() => handlePreviewInvoice(invoice)}
                          >
                            <Eye className="size-4 text-blue-500" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>View Invoice</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>

                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="cursor-pointer"
                            onClick={() => handleDownloadInvoice(invoice)}
                          >
                            <Download className="size-4" color="#c7c940" />
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
                            className="cursor-pointer"
                            onClick={() =>
                              handleUpdateInvoice({
                                ...invoice,
                                status:
                                  invoice.status === "PAID" ? "UNPAID" : "PAID",
                                amountPaid:
                                  invoice.status === "PAID"
                                    ? invoice.amount
                                    : invoice.amountPaid,
                                amountDue:
                                  invoice.status === "PAID"
                                    ? 0
                                    : invoice.amountDue,
                              })
                            }
                          >
                            {invoice.status === "PAID" ? (
                              <CircleX className="size-4" color="#d57771" />
                            ) : (
                              <CheckCheck className="size-4" color="#107a47" />
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
              ))
            )}
          </TableBody>
        </Table>

        {/* Add pagination controls */}
        {!loading && (
          <div className="flex items-center justify-between px-4 py-4 border-t">
            <div className="text-sm text-muted-foreground">
              Showing {(currentPage - 1) * itemsPerPage + 1} to{" "}
              {(currentPage - 1) * itemsPerPage + filteredInvoices.length} of{" "}
              {invoices.length} entries
            </div>
            <div className="flex space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(1)}
                disabled={currentPage === 1}
              >
                <ChevronsLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
              >
                Previous
              </Button>
              <div className="flex items-center space-x-1">
                <span className="text-sm font-medium">
                  Page {currentPage} of {totalPages}
                </span>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage >= totalPages}
              >
                Next
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(totalPages)}
                disabled={currentPage >= totalPages}
              >
                <ChevronsRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
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

      <Dialog open={pdfPreviewOpen} onOpenChange={setPdfPreviewOpen}>
        <DialogContent className="max-w-5xl w-full h-[90vh] p-0 flex flex-col">
          <DialogHeader className="p-4 border-b">
            <DialogTitle>PDF Preview</DialogTitle>
            <DialogDescription>
              Preview your Invoice before downloading or sending it to customer
            </DialogDescription>
          </DialogHeader>

          <div className="flex-1 overflow-hidden">
            {pdfPreviewUrl ? (
              <iframe src={pdfPreviewUrl} className="w-full h-full" />
            ) : (
              <p>Loading PDF...</p>
            )}
          </div>
          <DialogFooter>
            <Button
              className="mt-4 cursor-pointer"
              onClick={() => saveAs(pdfPreviewUrl!, "invoice.pdf")}
            >
              Download Invoice
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
