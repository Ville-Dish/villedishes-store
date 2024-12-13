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
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Edit, Plus, Search, Trash } from "lucide-react";
import { toast } from "sonner";
import { ProductForm } from "@/components/custom/product-form";

export default function AdminProductsPage() {
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
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
  const [dialogOpen, setDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Fetch products from the API
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await fetch("/api/products", { method: "GET" });
        const data = await response.json();

        if (response.ok) {
          setMenuItems(data.data);
        } else {
          console.error("Error fetching products:", data.message);
        }
      } catch (error) {
        console.error("Error fetching products:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  const handleEditItem = (item: MenuItem) => {
    setEditingItem(item);
  };

  const handleUpdateItem = async (updatedItem: Omit<MenuItem, "id">) => {
    setIsLoading(true);
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
      setIsLoading(false);
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
    setIsLoading(true);
    try {
      const response = await fetch("/api/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newItemData),
      });

      const data = await response.json();

      if (response.ok) {
        setMenuItems((items) => [...items, data.data]);
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
      setIsLoading(false);
    }
  };

  if (loading) {
    return <div>Loading products...</div>;
  }

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Products</h2>
        <div className="flex items-center space-x-2">
          <Input placeholder="Search products..." className="max-w-sm" />
          <Button>
            <Search className="mr-2 h-4 w-4" /> Search
          </Button>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen} modal={false}>
            <DialogTrigger asChild>
              <Button onClick={() => setDialogOpen(true)}>
                <Plus className="mr-2 h-4 w-4" /> Add Product
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
                onSubmit={handleAddItem}
                onCancel={() => setDialogOpen(false)}
                isLoading={isLoading}
              />
            </DialogContent>
          </Dialog>
        </div>
      </div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>S/N</TableHead>
            <TableHead>Name</TableHead>
            <TableHead>Price</TableHead>
            <TableHead>Category</TableHead>
            <TableHead>Rating</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {menuItems.map((item, index) => (
            <React.Fragment key={item.id}>
              <TableRow>
                <TableCell>{index + 1}</TableCell>
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
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDeleteItem(item.id)}
                  >
                    <Trash className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            </React.Fragment>
          ))}
        </TableBody>
      </Table>
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
              onSubmit={handleUpdateItem}
              onCancel={() => setEditingItem(null)}
              isLoading={isLoading}
            />
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
