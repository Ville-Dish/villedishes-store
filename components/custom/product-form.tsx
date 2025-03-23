"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import ImageUpload from "@/components/custom/imageUpload/ImageUpload";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";

interface ProductFormProps {
  product: Omit<MenuItem, "id"> & { id?: string };
  categories: string[];
  onSubmit: (product: Omit<MenuItem, "id">) => void;
  onCancel: () => void;
  isLoading: boolean;
}

export const ProductForm: React.FC<ProductFormProps> = ({
  product,
  categories,
  onSubmit,
  onCancel,
  isLoading,
}) => {
  const [formData, setFormData] = React.useState<
    Omit<MenuItem, "id"> & { id?: string }
  >(product);
  const [searchTerm, setSearchTerm] = React.useState("");

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === "price" || name === "rating" ? parseFloat(value) : value,
    }));
  };

  const handleImageChange = (url: string) => {
    setFormData((prev) => ({ ...prev, image: url }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div>
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
            />
          </div>
          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              required
            />
          </div>
          <div>
            <Label htmlFor="price">Price</Label>
            <Input
              id="price"
              name="price"
              type="number"
              step="0.01"
              value={formData.price}
              onChange={handleChange}
              required
            />
          </div>
        </div>
        <div className="space-y-4">
          <div>
            <Label htmlFor="category">Category</Label>
            <Select
              value={formData.category}
              onValueChange={(value) => handleChange({ target: { name: 'category', value } } as any)}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select a category" />
              </SelectTrigger>
              <SelectContent>
                <div className="flex items-center px-3 pb-2">
                  <Input
                    placeholder="Search or add new category..."
                    className="h-8"
                    value={searchTerm}
                    onChange={(e) => {
                      const value = e.target.value;
                      setSearchTerm(value);
                      if (!categories.includes(value) && value) {
                        handleChange({
                          target: {
                            name: 'category',
                            value: value
                          }
                        } as any);
                      }
                    }}
                  />
                </div>
                {categories
                  .filter(cat => cat.toLowerCase().includes(searchTerm.toLowerCase()))
                  .map((category) => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                {searchTerm && !categories.includes(searchTerm) && (
                  <SelectItem value={searchTerm}>
                    Add "{searchTerm}"
                  </SelectItem>
                )}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="rating">Rating</Label>
            <Input
              id="rating"
              name="rating"
              type="number"
              step="0.1"
              min="0"
              max="5"
              value={formData.rating}
              onChange={handleChange}
              required
            />
          </div>
          <div>
            <Label>Image</Label>
            <ImageUpload
              value={formData.image}
              onChange={handleImageChange}
              onRemove={() => setFormData((prev) => ({ ...prev, image: "" }))}
            />
          </div>
        </div>
      </div>
      <div className="flex justify-end space-x-4">
        <Button type="button" variant="cancel" onClick={onCancel}>
          Cancel
        </Button>
        <Button
          type="submit"
          disabled={isLoading}
          variant={product.id ? "submit" : "create"}
        >
          {isLoading
            ? "Saving..."
            : product.id
              ? "Update Product"
              : "Create Product"}
        </Button>
      </div>
    </form>
  );
};
