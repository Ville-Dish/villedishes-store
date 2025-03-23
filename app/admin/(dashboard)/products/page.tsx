/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import React, { useCallback, useEffect, useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ChevronsLeft, ChevronsRight, Eye, Plus, Trash } from "lucide-react";
import { toast } from "sonner";
import { ProductForm } from "@/components/custom/product-form";
import { Slider } from "@/components/ui/slider";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useLoading } from "@/context/LoadingContext";

type SortField = 'name' | 'price' | 'category' | null;
type SortDirection = 'asc' | 'desc' | null;


export default function AdminProductsPage() {
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<MenuItem[]>([]);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);
  const [newItem, setNewItem] = useState<Omit<MenuItem, "id">>({
    name: "",
    description: "",
    price: 0,
    category: "",
    image: "",
    rating: 0,
  });

  const [loading, setLoading] = useState<boolean>(true);
  const { setIsLoading } = useLoading();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [isProdLoading, setIsProdLoading] = useState(false);

  //Filter state
  const [categoryFilter, setCategoryFilter] = useState<string>("");
  const [ratingFilter, setRatingFilter] = useState<number>(0);
  const [priceFilter, setPriceFilter] = useState<[number, number]>([0, 1000]);
  const [categories, setCategories] = useState<string[]>([]);

  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10); // Changed to 10 items per page
  const [totalPages, setTotalPages] = useState(1);

  const [sortField, setSortField] = useState<SortField>(null);
  const [sortDirection, setSortDirection] = useState<SortDirection>(null);

  // Add this sorting handler
  const handleSort = (field: SortField) => {
    if (sortField === field) {
      // Cycle through: asc -> desc -> null
      if (sortDirection === 'asc') {
        setSortDirection('desc');
      } else if (sortDirection === 'desc') {
        setSortDirection(null);
        setSortField(null);
      }
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  // Add this after the existing useEffect hooks
  useEffect(() => {
    // Update URL when page changes (only for pages > 1)
    if (currentPage > 1) {
      window.history.pushState({}, '', `?page=${currentPage}`);
    } else {
      window.history.pushState({}, '', window.location.pathname);
    }
  }, [currentPage]);

  // Add this effect to handle initial page from URL
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const page = parseInt(params.get('page') || '1');
    setCurrentPage(page);
  }, []);

  // Add this pagination handler
  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
    window.scrollTo(0, 0);
  };


  // Fetch products from the API
  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        const response = await fetch("/api/products", { method: "GET" });
        const data = await response.json();

        if (response.ok) {
          setMenuItems(data.data || []);
          setFilteredProducts(data.data || []);
          setTotalPages(Math.ceil((data.data || []).length / itemsPerPage));
        } else {
          console.error("Error fetching products:", data.message);
        }
      } catch (error) {
        console.error("Error fetching products:", error);
      } finally {
        setLoading(false);
        setIsLoading(false);
      }
    };

    fetchProducts();
  }, [itemsPerPage]);

  useEffect(() => {
    const uniqueCategories = Array.from(
      new Set(menuItems.map((item) => item.category))
    );
    setCategories(uniqueCategories);
  }, [menuItems]);

  const handleEditItem = (item: MenuItem) => {
    setEditingItem(item);
  };

  const handleUpdateItem = async (updatedItem: Omit<MenuItem, "id">) => {
    setIsProdLoading(true);
    try {
      if (!editingItem) {
        throw new Error("No item selected for editing");
      }
      const itemToUpdate = { ...updatedItem, id: editingItem.id };
      const response = await fetch(`/api/products`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(itemToUpdate),
      });

      const data = await response.json();
      if (response.ok) {
        setMenuItems((items) =>
          items.map((item) => (item.id === editingItem.id ? editingItem : item))
        );
        applyFiltersAndSearch();
        toast.success(`Product updated successfully`);
        setEditingItem(null);
        setDialogOpen(false);
      } else {
        console.log(`Error updating product: ${data.message}`);
        toast.error("Failed to update the product. Please try again.");
      }
    } catch (error) {
      console.error("Error updating product:", error);
      toast.error("An error occurred while updating the product.");
    } finally {
      setIsProdLoading(false);
    }
  };

  const handleDeleteItem = async (itemId: string) => {
    try {
      const response = await fetch("/api/products", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: itemId }),
      });

      if (response.ok) {
        setMenuItems((items) => items.filter((item) => item.id !== itemId));
        applyFiltersAndSearch();
        toast.success(`Product deleted successfully`);
      } else {
        const data = await response.json();
        console.error("Error deleting product:", data.message);
        toast.error("Error deleting product", {
          description: "Failed to delete the product. Please try again later.",
        });
      }
    } catch (error) {
      console.error("Error deleting product:", error);
    }
  };

  const handleAddItem = async (newItemData: Omit<MenuItem, "id">) => {
    setIsProdLoading(true);
    try {
      const response = await fetch("/api/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newItemData),
      });

      const data = await response.json();

      if (response.ok) {
        setMenuItems((items) => [...items, data.data]);
        // setFilteredProducts((items) => [...items, data.data]);
        applyFiltersAndSearch();
        setNewItem({
          name: "",
          description: "",
          price: 0,
          category: "",
          image: "",
          rating: 0,
        });
        // Close the dialog
        setDialogOpen(false);

        // Show a success message
        toast.success("Product added successfully!");
      } else {
        console.error("Error adding product:", data.message);
        toast.error("Error adding product. Please try again.");
      }
    } catch (error) {
      console.error("Error adding product:", error);
      toast.error("An error occurred. Please try again.");
    } finally {
      setIsProdLoading(false);
    }
  };

  // filter and search function
  const applyFiltersAndSearch = useCallback(() => {
    let filtered = menuItems;

    // Apply search
    if (searchTerm.trim() !== "") {
      filtered = filtered.filter((item) =>
        Object.values(item).some((value) =>
          String(value).toLowerCase().includes(searchTerm.toLowerCase())
        )
      );
    }

    // Apply category filter
    if (categoryFilter && categoryFilter !== "all") {
      filtered = filtered.filter((item) => item.category === categoryFilter);
    }

    // Apply rating filter
    if (ratingFilter > 0) {
      filtered = filtered.filter((item) => (item.rating || 0) >= ratingFilter);
    }

    // Apply price filter
    filtered = filtered.filter(
      (item) => item.price >= priceFilter[0] && item.price <= priceFilter[1]
    );

    // Apply sorting if active
    if (sortField && sortDirection) {
      filtered.sort((a, b) => {
        const aValue = a[sortField];
        const bValue = b[sortField];
        if (sortDirection === 'asc') {
          return aValue > bValue ? 1 : -1;
        } else {
          return aValue < bValue ? 1 : -1;
        }
      });
    }

    setFilteredProducts(filtered);
    setTotalPages(Math.ceil(filtered.length / itemsPerPage));

    setCurrentPage(1);
  }, [searchTerm, categoryFilter, ratingFilter, priceFilter, menuItems, sortField, sortDirection, itemsPerPage]);

  useEffect(() => {
    applyFiltersAndSearch();
  }, [
    searchTerm,
    categoryFilter,
    ratingFilter,
    priceFilter,
    menuItems,
    applyFiltersAndSearch,
  ]);


  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Products</h2>
        <div className="flex items-center space-x-2">
          <Input
            placeholder="Search products..."
            className="max-w-sm"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen} modal={false}>
            <DialogTrigger asChild>
              <Button onClick={() => setDialogOpen(true)} variant="create">
                <Plus className="h-4 w-4" /> Add Product
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
              <ProductForm
                product={newItem}
                categories={categories}
                onSubmit={handleAddItem}
                onCancel={() => setDialogOpen(false)}
                isLoading={isProdLoading}
              />
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="flex space-x-4 mb-4">
        <Select onValueChange={(value) => setCategoryFilter(value)}>
          <SelectTrigger className="w-[180px]">
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
        <Select onValueChange={(value) => setRatingFilter(Number(value))}>
          <SelectTrigger className="w-[180px]">
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
        <div className="flex items-center space-x-2">
          <span>Price Range:</span>
          <Slider
            min={0}
            max={1000}
            step={10}
            value={priceFilter}
            onValueChange={(value: number[]) =>
              setPriceFilter(value as [number, number])
            }
            className="w-[200px]"
          />
          <span>
            ${priceFilter[0]} - ${priceFilter[1]}
          </span>
        </div>
      </div>

      <div className="border rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>S/N</TableHead>
              <TableHead onClick={() => handleSort('name')} className="cursor-pointer">
                Name {sortField === 'name' && (sortDirection === 'asc' ? '↑' : '↓')}
              </TableHead>
              <TableHead onClick={() => handleSort('price')} className="cursor-pointer">
                Price {sortField === 'price' && (sortDirection === 'asc' ? '↑' : '↓')}
              </TableHead>
              <TableHead onClick={() => handleSort('category')} className="cursor-pointer">
                Category {sortField === 'category' && (sortDirection === 'asc' ? '↑' : '↓')}
              </TableHead>
              <TableHead>Rating</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {
              loading ? (
                <TableRow>
                  <TableCell colSpan={8} className="h-24 text-center">
                    <div className="flex justify-center items-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                    </div>
                  </TableCell>
                </TableRow>
              ) :
                filteredProducts.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="h-24 text-center">
                      <p className="text-lg text-muted-foreground">
                        {searchTerm
                          ? "No matching products found"
                          : "There are no products yet"}
                      </p>
                    </TableCell>
                  </TableRow>
                ) :

                  filteredProducts
                    .slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)
                    .map((item, index) => (
                      <TableRow key={item.id}>
                        <TableCell>{((currentPage - 1) * itemsPerPage) + index + 1}</TableCell>
                        <TableCell>{item.name}</TableCell>
                        <TableCell>${item.price.toFixed(2)}</TableCell>
                        <TableCell>{item.category}</TableCell>
                        <TableCell>
                          {item.rating ? `${item.rating.toFixed(1)} / 5` : "0.0/5"}
                        </TableCell>
                        <TableCell>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEditItem(item)}
                          >
                            <Eye className="h-4 w-4" color="#fe9e1d" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteItem(item.id)}
                          >
                            <Trash className="h-4 w-4" color="#da281c" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    )
                    )}
          </TableBody>
        </Table>

        {/* Add pagination controls */}
        {
          !loading &&
          <div className="flex items-center justify-between px-4 py-4 border-t">
            <div className="text-sm text-muted-foreground">
              Showing {((currentPage - 1) * itemsPerPage) + 1} to{" "}
              {Math.min(currentPage * itemsPerPage, filteredProducts.length)} of{" "}
              {filteredProducts.length} entries
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
                <span className="text-sm font-medium">Page {currentPage} of {totalPages}</span>
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
        }
      </div>

      {editingItem && (
        <Dialog
          open={!!editingItem}
          onOpenChange={(open) => !open && setEditingItem(null)}
          modal={false}
        >
          <DialogContent onInteractOutside={(event) => event.preventDefault()}>
            <DialogHeader>
              <DialogTitle>Edit Menu Item</DialogTitle>
              <DialogDescription className="sr-only">
                Edit menu item {editingItem.name}
              </DialogDescription>
            </DialogHeader>
            <ProductForm
              product={editingItem}
              categories={categories}
              onSubmit={handleUpdateItem}
              onCancel={() => setEditingItem(null)}
              isLoading={isProdLoading}
            />
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
