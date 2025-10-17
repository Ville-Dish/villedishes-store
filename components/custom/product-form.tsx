"use client";

import ImageUpload from "@/components/custom/imageUpload/ImageUpload";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import React, { useEffect } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";

interface ProductFormProps {
  product: Omit<MenuItem, "id"> & { id?: string };
  categories: string[];
  onSubmit: (product: Omit<MenuItem, "id">) => void;
  onCancel: (newAssetId?: string, oldAssetId?: string) => void;
  isLoading: boolean;
  isCopy?: boolean;
}

export const ProductForm: React.FC<ProductFormProps> = ({
  product,
  categories,
  onSubmit,
  onCancel,
  isLoading,
  isCopy = false,
}) => {
  const [formData, setFormData] = React.useState<
    Omit<MenuItem, "id"> & { id?: string }
  >(product);
  const [searchTerm, setSearchTerm] = React.useState("");
  const [isFormChanged, setIsFormChanged] = React.useState(false);
  const [initialData, setInitialData] = React.useState(JSON.stringify(product));

  // Check if form data has changed from initial state
  useEffect(() => {
    const currentData = JSON.stringify(formData);
    setIsFormChanged(currentData !== initialData);
  }, [formData, initialData]);

  useEffect(() => {
    setInitialData(JSON.stringify(product));
    setFormData(product);
  }, [product]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === "price" || name === "rating" ? parseFloat(value) : value,
    }));
  };

  const handleImageChange = (url: string, assetId: string) => {
    setFormData((prev) => ({ ...prev, image: url, assetId }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Remove id when copying to ensure a new product is created
    const submitData = isCopy ? { ...formData, id: undefined } : formData;
    onSubmit(submitData);
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
              onValueChange={(value) =>
                handleChange({
                  target: { name: "category", value },
                } as React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>)
              }
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
                            name: "category",
                            value: value,
                          },
                        } as React.ChangeEvent<
                          HTMLInputElement | HTMLTextAreaElement
                        >);
                      }
                    }}
                  />
                </div>
                {categories
                  .filter((cat) =>
                    cat.toLowerCase().includes(searchTerm.toLowerCase())
                  )
                  .map((category) => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                {searchTerm && !categories.includes(searchTerm) && (
                  <SelectItem value={searchTerm}>Add {searchTerm}</SelectItem>
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
        <Button
          type="button"
          variant="cancel"
          onClick={() => {
            if (product.id && !isCopy) {
              onCancel(formData.assetId, product.assetId);
            } else {
              onCancel();
            }
          }}
        >
          Cancel
        </Button>
        <Button
          type="submit"
          disabled={isLoading || (!isCopy && !isFormChanged)}
          variant={product.id && !isCopy ? "submit" : "create"}
        >
          {isLoading
            ? "Saving..."
            : isCopy
              ? "Create Copy"
              : product.id
                ? "Update Product"
                : "Create Product"}
        </Button>
      </div>
    </form>
  );
};
