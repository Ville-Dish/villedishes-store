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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuPortal,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
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
  CheckCheck,
  ChevronsLeft,
  ChevronsRight,
  CircleX,
  Download,
  Eye,
  MoreVerticalIcon,
  Pencil,
  Plus,
  TrashIcon,
  XCircle,
} from "lucide-react";
import { lazy, useState } from "react";
import { toast } from "sonner";

import {
  ColumnMappings,
  createInvoicePDF,
  DEFAULT_COLUMN_MAPPINGS,
  InvoiceDisplayMode,
} from "@/lib/invoicePdfGenerate";
import { saveAs } from "file-saver";
import "jspdf-autotable";

import { formatDate } from "@/lib/utils";

import { DatePickerWithRange } from "@/components/custom/date-range-picker";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { cn } from "@/lib/utils";
import { InvoiceForm } from "./invoice-form";
import { Invoice } from "@/lib/types";
import { CategoryMappingDialog } from "@/features/invoices/components/category-mapping-dialog";
import { ColumnMappingDialog } from "@/features/invoices/components/column-mapping-dialog";
import { useTRPC } from "@/trpc/client";
import {
  useMutation,
  useQueryClient,
  useSuspenseQuery,
} from "@tanstack/react-query";
import { useInvoicesParams } from "@/features/invoices/hooks/use-invoices-params";
import { useDebounce } from "@/hooks/use-debounce";
import { PRODUCT_INFO } from "@/config/constants";
import { useConfirm } from "@/hooks/use-confirm";

const InvoiceDetails = lazy(() =>
  import("@/features/invoices/components/invoices/invoice-details").then(
    (module) => ({
      default: module.InvoiceDetails,
    }),
  ),
);

type InvoiceProduct = {
  id: string;
  name: string;
  basePrice: number;
};

type SortField =
  | "invoiceNumber"
  | "customerName"
  | "amount"
  | "dueDate"
  | "status"
  | null;
type SortDirection = "asc" | "desc" | null;

export const InvoiceList = () => {
  const trpc = useTRPC();
  const queryClient = useQueryClient();

  const [params, setParams] = useInvoicesParams();

  // destructure params
  const {
    page,
    pageSize,
    search,
    status,
    startDate,
    endDate,
    minPrice,
    maxPrice,
    sortField,
    sortDirection,
  } = params;

  // Add debounced search
  const debouncedSearch = useDebounce(params.search, 500);

  // normalize dates
  const normalizedStartDate = startDate ?? undefined;
  const normalizedEndDate = endDate ?? undefined;

  // get invoices
  const { data: invoiceData, isLoading: loadingInvoices } = useSuspenseQuery(
    trpc.invoices.getPaginatedInvoices.queryOptions({
      startDate: normalizedStartDate,
      endDate: normalizedEndDate,
      status,
      search: debouncedSearch,
      page,
      pageSize,
      minPrice,
      maxPrice,
      sortField: sortField ?? undefined,
      sortDirection: sortDirection ?? undefined,
    }),
  );

  const invoices = invoiceData?.invoices;
  const availableProducts = invoiceData?.products || [];
  const totalCount = invoiceData?.totalCount || 0;
  const totalPages = invoiceData?.totalPages || 1;
  const hasNextPage = invoiceData?.hasNextPage || false;
  const hasPreviousPage = invoiceData?.hasPreviousPage || false;

  const [dialogOpen, setDialogOpen] = useState(false);

  // PDF Preview
  const [pdfPreviewUrl, setPdfPreviewUrl] = useState<string | null>(null);
  const [pdfPreviewOpen, setPdfPreviewOpen] = useState(false);

  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);

  // Category Mapping state
  const [categoryMappings, setCategoryMappings] = useState<
    Record<string, string>
  >({});
  const [showCategoryDialog, setShowCategoryDialog] = useState(false);
  const [columnMappings, setColumnMappings] = useState<ColumnMappings>(
    DEFAULT_COLUMN_MAPPINGS,
  );
  const [showColumnDialog, setShowColumnDialog] = useState(false);

  // Add this sorting handler
  const handleSort = (field: SortField) => {
    if (sortField === field) {
      if (sortDirection === "asc") {
        setParams({
          ...params,
          sortField: field,
          sortDirection: "desc",
          page: 1,
        });
      } else if (sortDirection === "desc") {
        setParams({ ...params, sortField: null, sortDirection: null, page: 1 });
      }
    } else {
      setParams({ ...params, sortField: field, sortDirection: "asc", page: 1 });
    }
  };

  const handleStatusFilterChange = (value: typeof params.status) => {
    setParams({
      ...params,
      status: value,
      page: 1,
    });
  };

  const handlePageChange = (page: number) => {
    setParams({
      ...params,
      page,
    });
  };

  const handleSearchChange = (value: string) => {
    setParams({
      ...params,
      search: value,
      page: 1,
    });
  };

  const handlePriceSliderChange = (value: number[]) => {
    setParams({ ...params, minPrice: value[0], maxPrice: value[1], page: 1 });
  };

  const handleDateChange = (
    startDate: Date | undefined,
    endDate: Date | undefined,
  ) => {
    setParams({
      ...params,
      startDate: startDate ?? null,
      endDate: endDate ?? null,
      page: 1,
    });
  };

  const clearFilters = () => {
    setParams({
      page: 1,
      pageSize: params.pageSize,
      search: "",
      status: "ALL",
      startDate: null,
      endDate: null,
      minPrice: 0,
      maxPrice: PRODUCT_INFO.maxPrice,
    });
  };

  const isFiltered =
    status !== "ALL" ||
    search !== "" ||
    startDate != null ||
    endDate != null ||
    minPrice != 0 ||
    maxPrice != PRODUCT_INFO.maxPrice;

  // use update trpc code
  const updateInvoiceMutation = useMutation(
    trpc.invoices.updateInvoice.mutationOptions({
      onSuccess: async (data) => {
        toast.success("Invoice updated successfully");
        setSelectedInvoice(null);
        await queryClient.invalidateQueries(
          trpc.invoices.getPaginatedInvoices.queryOptions({}),
        );
      },
      onError: (error) => {
        toast.error(error.message ?? "Failed to update invoice");
      },
    }),
  );

  const handleUpdateInvoice = async (updatedInvoice: Invoice) => {
    updateInvoiceMutation.mutate(updatedInvoice);
  };

  const [DeleteInvoiceDialog, confirmDeleteInvoice] = useConfirm({
    title: "Delete Invoice",
    message: "Are you sure you want to delete this invoice?",
    update: false,
  });

  // use delete trpc code
  const deleteInvoiceMutation = useMutation(
    trpc.invoices.deleteInvoice.mutationOptions({
      onSuccess: async () => {
        toast.success("Invoice deleted successfully");
        await queryClient.invalidateQueries(
          trpc.invoices.getPaginatedInvoices.queryOptions({}),
        );
      },
      onError: (error) => {
        toast.error(error.message ?? "Failed to delete invoice");
      },
    }),
  );

  const handleDeleteInvoice = async (id: string) => {
    const result = await confirmDeleteInvoice();

    if (result.action !== "confirm") return;
    deleteInvoiceMutation.mutate({ id });
  };

  const handleViewInvoice = (invoice: Invoice) => {
    setSelectedInvoice(invoice);
  };

  const handleDownloadInvoice = async (
    invoice: Invoice,
    displayMode: InvoiceDisplayMode = "detailed",
  ) => {
    try {
      toast.info(`Downloading Invoice ${invoice.invoiceNumber}`);

      const invoiceName = (invoice.customerName || "")
        .replace(/[^\w\s]/g, "") // remove special characters
        .replace(/\s+/g, "_") // replaces all spaces (and tabs/newlines) with underscores
        .slice(0, 20)
        .toUpperCase(); // limit to 20 characters

      // Call createInvoicePDF to generate the PDF content as Uint8Array
      // const pdfModule = await generatePDF
      const pdfData = await createInvoicePDF(
        invoice,
        displayMode,
        categoryMappings,
        columnMappings,
      );

      // Create a new Uint8Array to ensure we have a proper ArrayBuffer
      const uint8Array = new Uint8Array(pdfData);

      // Create a Blob from the Uint8Array and download it
      const blob = new Blob([uint8Array], { type: "application/pdf" });
      saveAs(
        blob,
        invoiceName
          ? `${invoiceName}.pdf`
          : `Invoice_${invoice.invoiceNumber}.pdf`,
      );

      toast.info(`Downloaded Invoice ${invoice.invoiceNumber} successfully`);
    } catch (error) {
      console.error("Error generating invoice PDF:", error);
      toast.error("Failed to download the invoice. Please try again.");
    }
  };

  const handlePreviewInvoice = async (
    invoice: Invoice,
    displayMode: InvoiceDisplayMode = "detailed",
  ) => {
    try {
      const pdfData = await createInvoicePDF(
        invoice,
        displayMode,
        categoryMappings,
        columnMappings,
      );

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

  const [UpdateStatusDialog, confirmUpdateStatus] = useConfirm({
    title: "Update Invoice Status",
    message: "Are you sure you want to update this invoice's status?",
    update: true,
  });

  // ─── Pagination display helpers ───────────────────────────────────────────────
  // "Showing X to Y of Z entries"
  const firstEntry = totalCount === 0 ? 0 : (page - 1) * pageSize + 1;
  const lastEntry = Math.min(page * pageSize, totalCount);

  return (
    <>
      <DeleteInvoiceDialog />
      <UpdateStatusDialog />
      <div className="flex-1 space-y-4 p-4 md:p-8 max-w-7xl mx-auto">
        <div className="flex items-center justify-between">
          <h2 className="text-3xl font-bold tracking-tight mr-4">Invoices</h2>

          <div className="space-x-1">
            {isFiltered && (
              <Button variant="outline" onClick={clearFilters}>
                <XCircle className="size-4" />
                Clear Filters
              </Button>
            )}

            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <DialogTrigger asChild>
                <Button
                  onClick={() => setDialogOpen(true)}
                  variant="create"
                  className="cursor-pointer"
                >
                  <Plus className="size-4" /> Create New Invoice
                </Button>
              </DialogTrigger>
              <DialogContent className="h-[80vh]">
                <DialogHeader>
                  <DialogTitle>Create New Invoice</DialogTitle>
                </DialogHeader>
                <InvoiceForm
                  setDialog={setDialogOpen}
                  setSelectedInvoice={setSelectedInvoice}
                />
              </DialogContent>
            </Dialog>
          </div>
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <Button
            onClick={() => setShowCategoryDialog(true)}
            variant="outline"
            className="cursor-pointer"
          >
            Category Names
          </Button>

          <Button
            onClick={() => setShowColumnDialog(true)}
            variant="outline"
            className="cursor-pointer"
          >
            Column Settings
          </Button>

          <Input
            placeholder="Search invoices..."
            className="col-span-2"
            value={search}
            onChange={(e) => handleSearchChange(e.target.value)}
          />
        </div>

        {/* Filters */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {/* Status */}
          <Select
            value={status}
            onValueChange={(value) =>
              handleStatusFilterChange(value as typeof params.status)
            }
          >
            <SelectTrigger className="col-span-1">
              <SelectValue placeholder="Filter by Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All Statuses</SelectItem>
              <SelectItem value="PENDING">Pending</SelectItem>
              <SelectItem value="PAID">Paid</SelectItem>
              <SelectItem value="UNPAID">Unpaid</SelectItem>
              <SelectItem value="OVERDUE">Due</SelectItem>
            </SelectContent>
          </Select>

          {/* Date range */}
          <div className="col-span-1">
            <DatePickerWithRange
              date={
                normalizedStartDate || normalizedEndDate
                  ? {
                      from: normalizedStartDate,
                      to: normalizedEndDate,
                    }
                  : undefined
              }
              setDate={(newDateRange) => {
                handleDateChange(newDateRange?.from, newDateRange?.to);
              }}
            />
          </div>

          {/* price range */}
          <div className="col-span-2 flex items-center space-x-2 md:justify-self-end">
            <span>Price Range:</span>
            <Slider
              min={0}
              max={PRODUCT_INFO.maxPrice}
              step={10}
              value={[minPrice, maxPrice]}
              onValueChange={handlePriceSliderChange}
              className="w-50"
            />
            <span>
              ${minPrice} - ${maxPrice}
            </span>
          </div>

          <div />
        </div>

        <div className="border rounded-lg overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>S/N</TableHead>
                <TableHead
                  className="cursor-pointer hover:bg-muted/50"
                  onClick={() => handleSort("invoiceNumber")}
                >
                  <div className="flex items-center">
                    Invoice Number
                    {sortField === "invoiceNumber" && (
                      <span className="ml-2">
                        {sortDirection === "asc" ? "↑" : "↓"}
                      </span>
                    )}
                  </div>
                </TableHead>
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
                <TableHead
                  className="cursor-pointer hover:bg-muted/50"
                  onClick={() => handleSort("status")}
                >
                  <div className="flex items-center">
                    Status
                    {sortField === "status" && (
                      <span className="ml-2">
                        {sortDirection === "asc" ? "↑" : "↓"}
                      </span>
                    )}
                  </div>
                </TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loadingInvoices ? (
                <TableRow>
                  <TableCell colSpan={7} className="h-24 text-center">
                    <div className="flex justify-center items-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                    </div>
                  </TableCell>
                </TableRow>
              ) : invoices.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="h-24 text-center">
                    <p className="text-lg text-muted-foreground">
                      {search
                        ? "No matching invoices found"
                        : "There are no invoices yet"}
                    </p>
                  </TableCell>
                </TableRow>
              ) : (
                invoices.map((invoice) => (
                  <TableRow key={invoice.id}>
                    <TableCell>{getInvoiceIndex(invoice) + 1}</TableCell>
                    <TableCell>{invoice.invoiceNumber}</TableCell>
                    <TableCell className="truncate overflow-hidden">
                      {invoice.customerName}
                    </TableCell>
                    <TableCell>${invoice.amount.toFixed(2)}</TableCell>
                    <TableCell>{formatDate(invoice.dueDate)}</TableCell>
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
                              invoice.status === "OVERDUE",
                            "bg-[#fe9e1d] border-[#fe9e1d] hover:bg-[#c6893a]":
                              invoice.status === "PENDING",
                          },
                        )}
                      >
                        {invoice.status}
                      </span>
                    </TableCell>
                    <TableCell>
                      <DropdownMenu modal={false}>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="outline"
                            aria-label="Invoice Action"
                            size="icon-sm"
                            className="cursor-pointer"
                          >
                            <MoreVerticalIcon />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent className="w-40" align="end">
                          <DropdownMenuLabel>Invoice Actions</DropdownMenuLabel>
                          <DropdownMenuGroup>
                            <DropdownMenuItem
                              className="cursor-pointer"
                              onSelect={() => handleViewInvoice(invoice)}
                            >
                              <Pencil className="size-4" color="#fe9e1d" />
                              Edit Invoice
                            </DropdownMenuItem>

                            {/* Preview submenu */}
                            <DropdownMenuSub>
                              <DropdownMenuSubTrigger>
                                <Eye className="size-4 text-blue-500" />
                                View Invoice
                              </DropdownMenuSubTrigger>
                              <DropdownMenuPortal>
                                <DropdownMenuSubContent className="w-48">
                                  <DropdownMenuItem
                                    className="cursor-pointer"
                                    onSelect={() =>
                                      handlePreviewInvoice(invoice, "detailed")
                                    }
                                  >
                                    Detailed View
                                  </DropdownMenuItem>
                                  <DropdownMenuItem
                                    className="cursor-pointer"
                                    onSelect={() =>
                                      handlePreviewInvoice(
                                        invoice,
                                        "category-summary",
                                      )
                                    }
                                  >
                                    Category Summary
                                  </DropdownMenuItem>
                                  <DropdownMenuItem
                                    className="cursor-pointer"
                                    onSelect={() =>
                                      handlePreviewInvoice(
                                        invoice,
                                        "category-grouped",
                                      )
                                    }
                                  >
                                    Grouped by Category
                                  </DropdownMenuItem>
                                </DropdownMenuSubContent>
                              </DropdownMenuPortal>
                            </DropdownMenuSub>

                            {/* Download submenu */}
                            <DropdownMenuSub>
                              <DropdownMenuSubTrigger>
                                <Download className="size-4" color="#c7c940" />
                                Download
                              </DropdownMenuSubTrigger>
                              <DropdownMenuPortal>
                                <DropdownMenuSubContent className="w-48">
                                  <DropdownMenuItem
                                    className="cursor-pointer"
                                    onSelect={() =>
                                      handleDownloadInvoice(invoice, "detailed")
                                    }
                                  >
                                    Detailed View
                                  </DropdownMenuItem>
                                  <DropdownMenuItem
                                    className="cursor-pointer"
                                    onSelect={() =>
                                      handleDownloadInvoice(
                                        invoice,
                                        "category-summary",
                                      )
                                    }
                                  >
                                    Category Summary
                                  </DropdownMenuItem>
                                  <DropdownMenuItem
                                    className="cursor-pointer"
                                    onSelect={() =>
                                      handleDownloadInvoice(
                                        invoice,
                                        "category-grouped",
                                      )
                                    }
                                  >
                                    Grouped by Category
                                  </DropdownMenuItem>
                                </DropdownMenuSubContent>
                              </DropdownMenuPortal>
                            </DropdownMenuSub>

                            <DropdownMenuSeparator />

                            <DropdownMenuItem
                              className="cursor-pointer"
                              onSelect={async () => {
                                const result = await confirmUpdateStatus();

                                if (result.action !== "confirm") return;
                                handleUpdateInvoice({
                                  ...invoice,
                                  status:
                                    invoice.status === "PAID"
                                      ? "UNPAID"
                                      : "PAID",
                                  amountPaid:
                                    invoice.status === "PAID"
                                      ? invoice.amount
                                      : invoice.amountPaid,
                                  amountDue:
                                    invoice.status === "PAID"
                                      ? 0
                                      : invoice.amountDue,
                                });
                              }}
                            >
                              {invoice.status === "PAID" ? (
                                <CircleX className="size-4" color="#d57771" />
                              ) : (
                                <CheckCheck
                                  className="size-4"
                                  color="#107a47"
                                />
                              )}
                              {invoice.status === "PAID"
                                ? "Mark as Unpaid"
                                : "Mark as Paid"}
                            </DropdownMenuItem>

                            <DropdownMenuItem
                              className="cursor-pointer text-destructive focus:bg-destructive/20 focus:text-destructive"
                              onSelect={() => handleDeleteInvoice(invoice.id)}
                            >
                              <TrashIcon className="size-4" color="#ff0000" />
                              Delete Invoice
                            </DropdownMenuItem>
                          </DropdownMenuGroup>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>

          {/* Add pagination controls */}
          {!loadingInvoices && (
            <div className="flex flex-col md:flex-row gap-2 items-center justify-between px-4 py-4 border-t">
              <div className="text-sm text-muted-foreground">
                Showing {firstEntry} to {lastEntry} of {totalCount} entries
              </div>
              <div className="flex space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(1)}
                  disabled={page === 1}
                >
                  <ChevronsLeft className="size-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(page - 1)}
                  disabled={!hasPreviousPage}
                >
                  Previous
                </Button>
                <div className="flex items-center space-x-1">
                  <span className="text-sm font-medium">
                    Page {page} of {totalPages}
                  </span>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(page + 1)}
                  disabled={!hasNextPage}
                >
                  Next
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(totalPages)}
                  disabled={page >= totalPages}
                >
                  <ChevronsRight className="size-4" />
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
                  categoryMappings={categoryMappings}
                  columnMappings={columnMappings}
                  onClose={() => setSelectedInvoice(null)}
                />
              </ScrollArea>
            </DialogContent>
          </Dialog>
        )}

        {showCategoryDialog && (
          <CategoryMappingDialog
            open={showCategoryDialog}
            onOpenChange={setShowCategoryDialog}
            categoryMappings={categoryMappings}
            onSave={setCategoryMappings}
          />
        )}

        {showColumnDialog && (
          <ColumnMappingDialog
            open={showColumnDialog}
            onOpenChange={setShowColumnDialog}
            columnMappings={columnMappings}
            onSave={setColumnMappings}
            availableProducts={availableProducts}
          />
        )}

        <Dialog open={pdfPreviewOpen} onOpenChange={setPdfPreviewOpen}>
          <DialogContent className="max-w-5xl w-full h-[90vh] p-0 flex flex-col">
            <DialogHeader className="p-4 border-b">
              <DialogTitle>PDF Preview</DialogTitle>
              <DialogDescription>
                Preview your Invoice before downloading or sending it to
                customer
              </DialogDescription>
            </DialogHeader>

            <div className="flex-1 overflow-hidden">
              {pdfPreviewUrl ? (
                <iframe
                  title="PDF Preview"
                  src={pdfPreviewUrl}
                  className="w-full h-full"
                />
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
    </>
  );
};
