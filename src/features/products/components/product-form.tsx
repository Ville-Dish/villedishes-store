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
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Textarea } from "@/components/ui/textarea";
import {
  CreateProductInput,
  createProductSchema,
  ProductFormValues,
  UpdateProductInput,
  updateProductSchema,
} from "@/lib/schemas/productSchema";
import { MenuItem } from "@/lib/types";
import { cn } from "@/lib/utils";
import { useTRPC } from "@/trpc/client";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { CheckIcon, ChevronsUpDownIcon, PlusCircleIcon } from "lucide-react";
import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import z from "zod";

interface ProductFormProps {
  initialData?: MenuItem | null;
  categories: string[];
  onCancel: (newAssetId?: string, oldAssetId?: string) => void;
  isLoading?: boolean;
  isCopy?: boolean;
}

export const ProductForm: React.FC<ProductFormProps> = ({
  initialData,
  categories,
  onCancel,
  isLoading = false,
  isCopy = false,
}) => {
  const trpc = useTRPC();
  const queryClient = useQueryClient();

  const [searchTerm, setSearchTerm] = React.useState("");
  const [isOpen, setIsOpen] = React.useState(false);

  const isEditMode = !!initialData?.id && !isCopy;

  const form = useForm<UpdateProductInput>({
    resolver: zodResolver(updateProductSchema),
    defaultValues: {
      name: initialData?.name ?? "",
      description: initialData?.description ?? "",
      price: initialData?.price ?? 0,
      image: initialData?.image ?? "",
      category: initialData?.category ?? "",
      assetId: initialData?.assetId ?? "",
      rating: initialData?.rating ?? 0,
      id: initialData?.id,
    },
  });

  const watchedAssetId = form.watch("assetId");
  const watchedCategory = form.watch("category");

  const handleImageChange = (url: string, assetId: string) => {
    form.setValue("image", url);
    form.setValue("assetId", assetId);
  };

  // trpc mutation
  const createMutation = useMutation(
    trpc.products.createProduct.mutationOptions({
      onSuccess: async (data) => {
        form.reset();
        toast.success(`Product ${data.name} has been created successfully`);
        queryClient.invalidateQueries(
          trpc.products.getPaginatedProducts.queryOptions({}),
        );
      },
      onError: (error) => {
        toast.error(error.message || `Failed to create product`);
      },
    }),
  );

  const updateMutation = useMutation(
    trpc.products.updateProduct.mutationOptions({
      onSuccess: async (data) => {
        toast.success(`Product ${data.name} has been updated successfully`);
        queryClient.invalidateQueries(
          trpc.products.getPaginatedProducts.queryOptions({}),
        );
      },
      onError: (error) => {
        toast.error(error.message || `Failed to update product`);
      },
    }),
  );

  const isMutating =
    createMutation.isPending || updateMutation.isPending || isLoading;

  const isFormChanged = Object.keys(form.formState.dirtyFields).length > 0;

  const handleCreate = async (values: CreateProductInput) => {
    // Remove id when copying to ensure a new product is created
    const submitData = isCopy ? { ...values, id: undefined } : values;
    const validatedFields =
      await createProductSchema.safeParseAsync(submitData);

    if (!validatedFields.success) {
      toast.error(
        validatedFields.error.message || "Please fill in all required fields",
      );
      return;
    }
    createMutation.mutate(validatedFields.data);
  };

  const handleUpdate = async (values: UpdateProductInput) => {
    if (!initialData?.id) return;

    updateMutation.mutate({ ...values, id: initialData?.id });
  };

  const onSubmit = async (values: CreateProductInput | UpdateProductInput) => {
    if (isEditMode && initialData?.id) {
      // Update existing product
      handleUpdate(values as UpdateProductInput);
      return;
    }

    handleCreate(values as CreateProductInput);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Name, Description and Price */}
          <div className="space-y-4">
            {/* name */}
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      id="name"
                      name="name"
                      placeholder="Product Name"
                      required
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* description */}
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Textarea
                      {...field}
                      id="description"
                      name="description"
                      placeholder="Product Description"
                      required
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* price */}
            <FormField
              control={form.control}
              name="price"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Price</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      id="price"
                      name="price"
                      type="number"
                      step="0.01"
                      value={field.value ?? ""}
                      onChange={(e) => field.onChange(e.target.valueAsNumber)}
                      required
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {/* Category, Rating */}
          <div className="space-y-4">
            {/* Category — uses react-hook-form setValue instead of local formData state */}
            <FormField
              control={form.control}
              name="category"
              render={() => (
                <FormItem>
                  <Label htmlFor="category">Category</Label>
                  <Popover open={isOpen} onOpenChange={setIsOpen}>
                    <PopoverTrigger asChild>
                      <Button
                        type="button"
                        variant="outline"
                        role="combobox"
                        aria-expanded={isOpen}
                        className="w-full justify-between"
                      >
                        {watchedCategory || "Select a category"}
                        <ChevronsUpDownIcon className="opacity-30" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-full p-0">
                      <Command>
                        <CommandInput
                          placeholder="Search or add new category"
                          value={searchTerm}
                          onValueChange={setSearchTerm}
                        />
                        <CommandList>
                          <CommandEmpty>No category found.</CommandEmpty>
                          <CommandGroup>
                            {categories
                              .filter((cat) =>
                                cat
                                  .toLowerCase()
                                  .includes(searchTerm.toLowerCase()),
                              )
                              .map((category) => (
                                <CommandItem
                                  key={category}
                                  value={category}
                                  className="cursor-pointer justify-between"
                                  onSelect={(currentValue) => {
                                    form.setValue("category", currentValue, {
                                      shouldDirty: true,
                                      shouldValidate: true,
                                    });
                                    setSearchTerm("");
                                    setIsOpen(false);
                                  }}
                                >
                                  {category}
                                  <CheckIcon
                                    className={cn(
                                      "size-4",
                                      watchedCategory === category
                                        ? "opacity-100"
                                        : "opacity-0",
                                    )}
                                  />
                                </CommandItem>
                              ))}

                            {/* Add new category inline */}
                            {searchTerm &&
                              !categories.some(
                                (cat) =>
                                  cat.toLowerCase() ===
                                  searchTerm.toLowerCase(),
                              ) && (
                                <CommandItem
                                  key="add-new"
                                  value={searchTerm}
                                  className="cursor-pointer text-primary"
                                  onSelect={(currentValue) => {
                                    form.setValue("category", currentValue, {
                                      shouldDirty: true,
                                      shouldValidate: true,
                                    });
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
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* rating */}
            <FormField
              control={form.control}
              name="rating"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Rating</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      id="rating"
                      name="rating"
                      type="number"
                      step="0.1"
                      min="0"
                      max="5"
                      value={field.value ?? ""}
                      onChange={(e) => field.onChange(e.target.valueAsNumber)}
                      required
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* image */}
            <FormField
              control={form.control}
              name="image"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Image</FormLabel>
                  <FormControl>
                    <ImageUpload
                      value={initialData?.image ?? ""}
                      onChange={handleImageChange}
                      onRemove={() => {
                        form.setValue("image", "");
                        form.setValue("assetId", "");
                      }}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>
        <div className="flex justify-end space-x-4">
          <Button
            type="button"
            variant="cancel"
            onClick={() => {
              if (initialData?.id && !isCopy && initialData?.assetId) {
                onCancel(watchedAssetId, initialData?.assetId);
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
            variant={initialData?.id && !isCopy ? "submit" : "create"}
          >
            {isLoading
              ? "Saving..."
              : isCopy
                ? "Create Copy"
                : initialData?.id
                  ? "Update Product"
                  : "Create Product"}
          </Button>
        </div>
      </form>
    </Form>
  );
};
