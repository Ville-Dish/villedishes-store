"use client";

import { ErrorBoundary } from "@/components/ErrorBoundary";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
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
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { PRODUCT_INFO } from "@/config/constants";
import { useProductsParams } from "@/features/products/hooks/use-products-params";
import { useDebounce } from "@/hooks/use-debounce";
import { MenuItem } from "@/lib/types";
import { useTRPC } from "@/trpc/client";
import {
  useMutation,
  useQueryClient,
  useSuspenseQuery,
} from "@tanstack/react-query";
import {
  ChevronsLeft,
  ChevronsRight,
  Copy,
  MoreVerticalIcon,
  Pencil,
  Plus,
  Trash,
} from "lucide-react";
import { lazy, Suspense, useState } from "react";
import { toast } from "sonner";
import { ProductListSkeleton } from "./product-list-skeleton";

const ProductForm = lazy(() =>
  import("@/features/products/components/product-form").then((module) => ({
    default: module.ProductForm,
  })),
);

type SortField = "name" | "price" | "category" | null;
type SortDirection = "asc" | "desc" | null;

export const ProductList = () => {
  const trpc = useTRPC();
  const queryClient = useQueryClient();

  const [params, setParams] = useProductsParams();
  const { page, pageSize, category, search, rating, minPrice, maxPrice } =
    params;

  const [isCopyMode, setIsCopyMode] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);

  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);

  // Add debounced search
  const debouncedSearch = useDebounce(params.search, 500);

  const { data: productsData, isLoading: loadingProducts } = useSuspenseQuery(
    trpc.products.getPaginatedProducts.queryOptions({
      page,
      category,
      pageSize,
      search: debouncedSearch,
      rating,
      minPrice,
      maxPrice,
    }),
  );

  const products = productsData?.products;
  const categories = productsData?.categories;
  const totalCount = productsData?.totalCount || 0;
  const totalPages = productsData?.totalPages || 1;
  const hasNextPage = productsData?.hasNextPage || false;
  const hasPreviousPage = productsData?.hasPreviousPage || false;

  const [sortField, setSortField] = useState<SortField>(null);
  const [sortDirection, setSortDirection] = useState<SortDirection>(null);

  // trpc
  const deleteMutation = useMutation(
    trpc.products.deleteProduct.mutationOptions({
      onSuccess: async () => {
        toast.success("Product deleted successfully");
        queryClient.invalidateQueries(
          trpc.products.getPaginatedProducts.queryOptions({}),
        );
      },
      onError: (error) => {
        toast.error(error.message ?? "Failed to delete product.");
      },
    }),
  );

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

  const handleEditItem = (item: MenuItem) => {
    setIsCopyMode(false);
    setEditingItem(item);
  };

  const handleCopyItem = (item: MenuItem) => {
    const modifiedItem = { ...item, name: `${item.name} - copy` };
    setEditingItem(modifiedItem);
    setIsCopyMode(true);
  };

  const handleSearchChange = (value: string) => {
    setParams({
      ...params,
      search: value,
      page: 1,
    });
  };

  const handleRatingChange = (value: string) => {
    setParams({
      ...params,
      rating: value,
      page: 1,
    });
  };

  const handleCategoryChange = (category: string) => {
    setParams({
      ...params,
      category,
      page: 1, // Reset to page 1 on category change
    });
  };

  const handlePageChange = (page: number) => {
    setParams({
      ...params,
      page,
    });
  };

  const handlePriceSliderChange = (value: number[]) => {
    setParams({ ...params, minPrice: value[0], maxPrice: value[1], page: 1 });
  };

  const clearFilters = () => {
    setParams({
      page: 1,
      pageSize: params.pageSize,
      search: "",
      category: "ALL",
      rating: "ALL",
      minPrice: 0,
      maxPrice: PRODUCT_INFO.maxPrice,
    });
  };

  const handleCloudinaryAssetDelete = async (assetId: string) => {
    try {
      const response = await fetch("/api/cloudinary/delete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ assetId }),
      });

      if (!response.ok) {
        const errorData = await response
          .json()
          .catch(() => ({ message: "Unknown error" }));
        console.error("Error deleting Cloudinary resource:", errorData);
      } else {
        const data = await response
          .json()
          .catch(() => ({ message: "Success" }));
        console.log("Deleted old asset:", data);
      }
    } catch (error) {
      console.error("Error calling delete API:", error);
    }
  };

  const handleUpdateCancel = async (
    newAssetId?: string,
    oldAssetId?: string,
  ) => {
    if (newAssetId && oldAssetId && newAssetId !== oldAssetId) {
      await handleCloudinaryAssetDelete(newAssetId);
    }
    setEditingItem(null);
    setIsCopyMode(false);
  };

  const handleDeleteItem = async (itemId: string) => {
    deleteMutation.mutate({ id: itemId });
  };

  // ─── Pagination display helpers ───────────────────────────────────────────────
  // "Showing X to Y of Z entries"
  const firstEntry = totalCount === 0 ? 0 : (page - 1) * pageSize + 1;
  const lastEntry = Math.min(page * pageSize, totalCount);

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Products</h2>
        <div className="flex items-center space-x-2">
          <Input
            placeholder="Search products..."
            className="max-w-sm"
            value={search}
            onChange={(e) => handleSearchChange(e.target.value)}
          />

          {/* Add Product Dialog */}
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen} modal={false}>
            <DialogTrigger asChild>
              <Button onClick={() => setDialogOpen(true)} variant="create">
                <Plus className="size-4" /> Add Product
              </Button>
            </DialogTrigger>
            <DialogContent
              onInteractOutside={(event) => event.preventDefault()}
            >
              <DialogHeader>
                <DialogTitle>Add Product</DialogTitle>
                <DialogDescription className="sr-only">
                  Add New Product
                </DialogDescription>
              </DialogHeader>
              <ErrorBoundary>
                <Suspense
                  fallback={
                    <div className="fixed inset-0 bg-black/50 flex items-center justify-center">
                      <div className="bg-white p-6 rounded-lg">Loading...</div>
                    </div>
                  }
                >
                  <ProductForm
                    categories={categories}
                    onCancel={() => setDialogOpen(false)}
                    isLoading={loadingProducts}
                  />
                </Suspense>
              </ErrorBoundary>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Filters */}
      <div className="grid grid-cols-2 md:grid-cols-4 mb-4 gap-4">
        {/* Category */}
        <Select onValueChange={(value) => handleCategoryChange(value)}>
          <SelectTrigger className="w-45">
            <SelectValue placeholder="Filter by Category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {categories.map((category) => (
              <SelectItem key={category} value={category}>
                {category}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Rating */}
        <Select onValueChange={(value) => handleRatingChange(value)}>
          <SelectTrigger className="w-45">
            <SelectValue placeholder="Filter by Rating" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="0">All Ratings</SelectItem>
            <SelectItem value="1">1+ Star</SelectItem>
            <SelectItem value="2">2+ Stars</SelectItem>
            <SelectItem value="3">3+ Stars</SelectItem>
            <SelectItem value="4">4+ Stars</SelectItem>
            <SelectItem value="5">5 Stars</SelectItem>
          </SelectContent>
        </Select>

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
      </div>

      <Suspense fallback={<ProductListSkeleton />}>
        <div className="border rounded-lg overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>S/N</TableHead>
                <TableHead
                  onClick={() => handleSort("name")}
                  className="cursor-pointer"
                >
                  Name{" "}
                  {sortField === "name" &&
                    (sortDirection === "asc" ? "↑" : "↓")}
                </TableHead>
                <TableHead
                  onClick={() => handleSort("price")}
                  className="cursor-pointer"
                >
                  Price{" "}
                  {sortField === "price" &&
                    (sortDirection === "asc" ? "↑" : "↓")}
                </TableHead>
                <TableHead
                  onClick={() => handleSort("category")}
                  className="cursor-pointer"
                >
                  Category{" "}
                  {sortField === "category" &&
                    (sortDirection === "asc" ? "↑" : "↓")}
                </TableHead>
                <TableHead>Rating</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loadingProducts ? (
                <TableRow>
                  <TableCell colSpan={8} className="h-24 text-center">
                    <div className="flex justify-center items-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                    </div>
                  </TableCell>
                </TableRow>
              ) : products.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="h-24 text-center">
                    <p className="text-lg text-muted-foreground">
                      {search
                        ? "No matching products found"
                        : "There are no products yet"}
                    </p>
                  </TableCell>
                </TableRow>
              ) : (
                products.map((item, index) => (
                  <TableRow key={item.id}>
                    <TableCell>{(page - 1) * pageSize + index + 1}</TableCell>
                    <TableCell>{item.name}</TableCell>
                    <TableCell>${item.price.toFixed(2)}</TableCell>
                    <TableCell>{item.category}</TableCell>
                    <TableCell>
                      {item.rating ? `${item.rating.toFixed(1)} / 5` : "0.0/5"}
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
                        <DropdownMenuContent className="w-64" align="end">
                          <DropdownMenuLabel>Product Actions</DropdownMenuLabel>
                          <DropdownMenuGroup>
                            <DropdownMenuItem
                              className="cursor-pointer text-sm"
                              onSelect={() => handleEditItem(item)}
                            >
                              <Pencil className="size-4" color="#fe9e1d" />
                              Edit Product - {item.name}
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              className="cursor-pointer text-sm"
                              onSelect={() => handleCopyItem(item)}
                            >
                              <Copy className="size-4" color="#6FD68B" />
                              Make a copy
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              className="cursor-pointer text-sm focus:text-red-800 focus:bg-red-50"
                              onSelect={() => handleDeleteItem(item.id)}
                            >
                              <Trash className="size-4" color="#da281c" />
                              Delete - {item.name}
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
          {!loadingProducts && (
            <div className="flex items-center justify-between px-4 py-4 border-t">
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
      </Suspense>

      {editingItem && (
        <Dialog
          open={!!editingItem}
          onOpenChange={(open) => {
            if (!open) {
              setEditingItem(null);
              setIsCopyMode(false); // Reset copy mode when dialog closes
            }
          }}
          modal={false}
        >
          <DialogContent onInteractOutside={(event) => event.preventDefault()}>
            <DialogHeader>
              <DialogTitle>
                {isCopyMode ? "Copy Product" : "Edit Menu Item"}
              </DialogTitle>
              <DialogDescription className="sr-only">
                {isCopyMode ? "Copy product" : "Edit menu item"}{" "}
                {editingItem.name}
              </DialogDescription>
            </DialogHeader>
            <ErrorBoundary>
              <Suspense
                fallback={
                  <div className="fixed inset-0 bg-black/50 flex items-center justify-center">
                    <div className="bg-white p-6 rounded-lg">Loading...</div>
                  </div>
                }
              >
                <ProductForm
                  initialData={editingItem}
                  categories={categories}
                  onCancel={handleUpdateCancel}
                  isLoading={loadingProducts}
                  isCopy={isCopyMode}
                />
              </Suspense>
            </ErrorBoundary>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};
