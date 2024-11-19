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
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  ChevronDown,
  ChevronUp,
  Edit,
  Plus,
  Search,
  Star,
  Trash,
} from "lucide-react";
import Image from "next/image";
import { toast } from "sonner";
// import { allProduct } from "@/lib/constantData";

// const initialMenuItems: MenuItem[] = allProduct;

export default function AdminProductsPage() {
  //   const [menuItems, setMenuItems] = useState<MenuItem[]>(initialMenuItems);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [expandedItemId, setExpandedItemId] = useState<string | null>(null);
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);
  const [newItem, setNewItem] = useState<Omit<MenuItem, "id">>({
    name: "",
    description: "",
    price: 0,
    category: "",
    image: "",
    stock: 0,
    rating: 0,
  });

  const [loading, setLoading] = useState<boolean>(true);
  const [dialogOpen, setDialogOpen] = useState(false);

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

  const toggleItemDetails = (itemId: string) => {
    setExpandedItemId(expandedItemId === itemId ? null : itemId);
  };

  const handleEditItem = (item: MenuItem) => {
    setEditingItem(item);
  };

  const handleUpdateItem = async () => {
    if (!editingItem) return;
    try {
      const response = await fetch(`/api/products`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...editingItem }),
      });

      console.log("Response status:", response.status);
      console.log("Response text:", await response.text());

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to update product.");
      }

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
    }
    if (editingItem) {
      setEditingItem(null);
      // Close the dialog
      setDialogOpen(false);
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

  //   const handleAddItem = () => {
  //     const id = Math.max(...menuItems.map((item) => parseInt(item.id)), 0) + 1;
  //     setMenuItems([...menuItems, { ...newItem, id: id.toString() }]);
  //     setNewItem({
  //       name: "",
  //       description: "",
  //       price: 0,
  //       category: "",
  //       image: "",
  //       stock: 0,
  //       rating: 0,
  //     });
  //   };

  const handleAddItem = async () => {
    try {
      const response = await fetch("/api/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newItem),
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
          stock: 0,
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
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => setDialogOpen(true)}>
                <Plus className="mr-2 h-4 w-4" /> Add Product
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add Product</DialogTitle>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="name" className="text-right">
                    Name
                  </Label>
                  <Input
                    id="name"
                    value={newItem.name}
                    onChange={(e) =>
                      setNewItem({ ...newItem, name: e.target.value })
                    }
                    className="col-span-3"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="description" className="text-right">
                    Description
                  </Label>
                  <Textarea
                    id="description"
                    value={newItem.description}
                    onChange={(e) =>
                      setNewItem({ ...newItem, description: e.target.value })
                    }
                    className="col-span-3"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="price" className="text-right">
                    Price
                  </Label>
                  <Input
                    id="price"
                    type="number"
                    value={newItem.price}
                    onChange={(e) =>
                      setNewItem({
                        ...newItem,
                        price: parseFloat(e.target.value),
                      })
                    }
                    className="col-span-3"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="category" className="text-right">
                    Category
                  </Label>
                  <Input
                    id="category"
                    value={newItem.category}
                    onChange={(e) =>
                      setNewItem({ ...newItem, category: e.target.value })
                    }
                    className="col-span-3"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="image" className="text-right">
                    Image URL
                  </Label>
                  <Input
                    id="image"
                    value={newItem.image}
                    onChange={(e) =>
                      setNewItem({ ...newItem, image: e.target.value })
                    }
                    className="col-span-3"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="rating" className="text-right">
                    Rating
                  </Label>
                  <Input
                    id="rating"
                    type="number"
                    step="0.1"
                    min="0"
                    max="5"
                    value={newItem.rating}
                    onChange={(e) =>
                      setNewItem({
                        ...newItem,
                        rating: parseFloat(e.target.value),
                      })
                    }
                    className="col-span-3"
                  />
                </div>
              </div>
              <Button onClick={handleAddItem}>Add Menu Item</Button>
            </DialogContent>
          </Dialog>
        </div>
      </div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Price</TableHead>
            <TableHead>Category</TableHead>
            <TableHead>Rating</TableHead>
            <TableHead>Actions</TableHead>
            <TableHead>Details</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {menuItems.map((item) => (
            <React.Fragment key={item.id}>
              <TableRow>
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
                <TableCell>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => toggleItemDetails(item.id)}
                  >
                    {expandedItemId === item.id ? (
                      <ChevronUp />
                    ) : (
                      <ChevronDown />
                    )}
                  </Button>
                </TableCell>
              </TableRow>
              {expandedItemId === item.id && (
                <TableRow>
                  <TableCell colSpan={7}>
                    <div className="bg-gray-50 p-4 rounded-md">
                      <h3 className="font-semibold mb-2">Products Details</h3>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Image
                            src={item.image}
                            alt={item.name}
                            className="w-full h-auto rounded-md"
                            width={100}
                            height={100}
                          />
                        </div>
                        <div>
                          <p>
                            <strong>Description:</strong> {item.description}
                          </p>
                          <p>
                            <strong>Category:</strong> {item.category}
                          </p>
                          <p>
                            <strong>Price:</strong> ${item.price.toFixed(2)}
                          </p>
                          {/* <p>
                            <strong>Stock:</strong> {item.stock ?? "N/A"}
                          </p> */}
                          <p>
                            <strong>Rating:</strong>{" "}
                            {item.rating
                              ? `${item.rating.toFixed(1)} / 5`
                              : 0.0}
                          </p>
                        </div>
                      </div>
                      {item.reviews && item.reviews.length > 0 && (
                        <div className="mt-4">
                          <h4 className="font-semibold mb-2">Reviews</h4>
                          {item.reviews.map((review) => (
                            <div
                              key={review.id}
                              className="mb-2 p-2 bg-white rounded-md"
                            >
                              <div className="flex items-center">
                                <Star className="h-4 w-4 text-yellow-400 mr-1" />
                                <span>{review.rating} / 5</span>
                              </div>
                              <p className="text-sm">{review.comment}</p>
                              <p className="text-xs text-gray-500">
                                - {review.author}
                              </p>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </React.Fragment>
          ))}
        </TableBody>
      </Table>
      {editingItem && (
        <Dialog open={!!editingItem} onOpenChange={() => setEditingItem(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit Menu Item</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-name" className="text-right">
                  Name
                </Label>
                <Input
                  id="edit-name"
                  value={editingItem.name}
                  onChange={(e) =>
                    setEditingItem({ ...editingItem, name: e.target.value })
                  }
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-description" className="text-right">
                  Description
                </Label>
                <Textarea
                  id="edit-description"
                  value={editingItem.description}
                  onChange={(e) =>
                    setEditingItem({
                      ...editingItem,
                      description: e.target.value,
                    })
                  }
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-price" className="text-right">
                  Price
                </Label>
                <Input
                  id="edit-price"
                  type="number"
                  value={editingItem.price}
                  onChange={(e) =>
                    setEditingItem({
                      ...editingItem,
                      price: parseFloat(e.target.value),
                    })
                  }
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-category" className="text-right">
                  Category
                </Label>
                <Input
                  id="edit-category"
                  value={editingItem.category}
                  onChange={(e) =>
                    setEditingItem({ ...editingItem, category: e.target.value })
                  }
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-image" className="text-right">
                  Image URL
                </Label>
                <Input
                  id="edit-image"
                  value={editingItem.image}
                  onChange={(e) =>
                    setEditingItem({ ...editingItem, image: e.target.value })
                  }
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-rating" className="text-right">
                  Rating
                </Label>
                <Input
                  id="edit-rating"
                  type="number"
                  step="0.1"
                  min="0"
                  max="5"
                  value={editingItem.rating}
                  onChange={(e) =>
                    setEditingItem({
                      ...editingItem,
                      rating: parseFloat(e.target.value),
                    })
                  }
                  className="col-span-3"
                />
              </div>
            </div>
            <Button onClick={handleUpdateItem}>Update Menu Item</Button>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
