"use client";

import ImageUpload from "@/components/custom/imageUpload/ImageUpload";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { CheckIcon, ChevronsUpDownIcon, PlusCircleIcon } from "lucide-react";
import React, { useEffect } from "react";

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
  const [isOpen, setIsOpen] = React.useState(false);
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

            <Popover open={isOpen} onOpenChange={setIsOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  role="combobox"
                  aria-expanded={isOpen}
                  className="w-full justify-between"
                >
                  {formData.category || "Select a category"}
                  <ChevronsUpDownIcon className="opacity-30" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-full p-0">
                <Command>
                  <CommandInput
                    placeholder="Search or add new category"
                    value={searchTerm}
                    onValueChange={(search) => {
                      setSearchTerm(search);
                    }}
                  />

                  <CommandList>
                    <CommandEmpty>No category found.</CommandEmpty>
                    <CommandGroup>
                      {categories
                        .filter((cat) =>
                          cat.toLowerCase().includes(searchTerm.toLowerCase())
                        )
                        .map((category) => (
                          <CommandItem
                            key={category}
                            value={category}
                            className="cursor-pointer justify-between"
                            onSelect={(currentValue) => {
                              setFormData((prev) => ({
                                ...prev,
                                category: currentValue,
                              }));
                              setSearchTerm("");
                              setIsOpen(false);
                            }}
                          >
                            {category}
                            <CheckIcon
                              className={cn(
                                "size-4",
                                formData.category === category
                                  ? "opacity-100"
                                  : "opacity-0"
                              )}
                            />
                          </CommandItem>
                        ))}

                      {/* Add new item */}
                      {searchTerm &&
                        !categories.some(
                          (cat) =>
                            cat.toLowerCase() === searchTerm.toLowerCase()
                        ) && (
                          <CommandItem
                            key="add-new"
                            value={searchTerm}
                            className="cursor-pointer text-primary"
                            onSelect={(currentValue) => {
                              setFormData((prev) => ({
                                ...prev,
                                category: currentValue,
                              }));
                              setIsOpen(false);
                              setSearchTerm("");
                            }}
                          >
                            <span className="font-medium">
                              Add "{searchTerm}"
                            </span>
                            <PlusCircleIcon className="ml-auto size-4" />
                          </CommandItem>
                        )}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
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
