"use client";

import { SearchIcon, Trash2, XIcon } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  ColumnMappings,
  DEFAULT_COLUMN_MAPPINGS,
} from "@/lib/invoicePdfGenerate";
import { useDebounce } from "@/hooks/use-debounce";

interface ColumnMappingDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  columnMappings: ColumnMappings;
  onSave: (mappings: ColumnMappings) => void;
  availableProducts: Array<{ id: string; name: string; basePrice: number }>;
}

export const ColumnMappingDialog = ({
  open,
  onOpenChange,
  columnMappings,
  onSave,
  availableProducts,
}: ColumnMappingDialogProps) => {
  const [mappings, setMappings] = useState<ColumnMappings>(columnMappings);
  const [productSearchTerm, setProductSearchTerm] = useState("");

  const debouncedSearchTerm = useDebounce(productSearchTerm, 300);

  useEffect(() => {
    setMappings(columnMappings);
  }, [columnMappings]);

  useEffect(() => {
    if (!open) {
      setProductSearchTerm("");
    }
  }, [open]);

  const handleHeaderChange = (
    key: keyof ColumnMappings["headers"],
    value: string,
  ) => {
    setMappings({
      ...mappings,
      headers: { ...mappings.headers, [key]: value },
    });
  };

  const handleVisibilityChange = (
    key: keyof ColumnMappings["visibility"],
    checked: boolean,
  ) => {
    setMappings({
      ...mappings,
      visibility: { ...mappings.visibility, [key]: checked },
    });
  };

  const handleProductNameChange = (
    productId: string,
    originalName: string,
    newName: string,
  ) => {
    setMappings({
      ...mappings,
      values: {
        ...mappings.values,
        products: {
          ...mappings.values.products,
          [productId]: {
            ...mappings.values.products[productId],
            [originalName]: newName,
          },
        },
      },
    });
  };

  const handlePriceChange = (productId: string, newPrice: string) => {
    setMappings({
      ...mappings,
      values: {
        ...mappings.values,
        prices: { ...mappings.values.prices, [productId]: newPrice },
      },
    });
  };

  const handleQuantityChange = (productId: string, newQuantity: string) => {
    setMappings({
      ...mappings,
      values: {
        ...mappings.values,
        quantities: { ...mappings.values.quantities, [productId]: newQuantity },
      },
    });
  };

  const handleRemoveProductMapping = (productId: string) => {
    const newProducts = { ...mappings.values.products };
    const newPrices = { ...mappings.values.prices };
    const newQuantities = { ...mappings.values.quantities };
    delete newProducts[productId];
    delete newPrices[productId];
    delete newQuantities[productId];
    setMappings({
      ...mappings,
      values: {
        products: newProducts,
        prices: newPrices,
        quantities: newQuantities,
      },
    });
  };

  const handleResetHeaders = () => {
    setMappings({
      ...mappings,
      headers: { ...DEFAULT_COLUMN_MAPPINGS.headers },
    });
  };

  const handleResetVisibility = () => {
    setMappings({
      ...mappings,
      visibility: { ...DEFAULT_COLUMN_MAPPINGS.visibility },
    });
  };

  const handleSave = () => {
    onSave(mappings);
    onOpenChange(false);
  };

  // Filter products based on search term
  const filteredProducts = useMemo(() => {
    if (!debouncedSearchTerm.trim()) {
      return availableProducts;
    }

    const searchLower = debouncedSearchTerm.toLowerCase();
    return availableProducts.filter((product) =>
      product.name.toLowerCase().includes(searchLower),
    );
  }, [availableProducts, debouncedSearchTerm]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[85vh]">
        <DialogHeader>
          <DialogTitle>Column Display Settings</DialogTitle>
          <DialogDescription>
            Customize column headers, visibility, and value display
          </DialogDescription>
        </DialogHeader>
        <Tabs defaultValue="headers" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="headers">Column Headers</TabsTrigger>
            <TabsTrigger value="visibility">Column Visibility</TabsTrigger>
            <TabsTrigger value="values">Product Values</TabsTrigger>
          </TabsList>
          <TabsContent value="headers" className="space-y-4">
            <div className="flex justify-between items-center">
              <p className="text-sm text-muted-foreground">
                Customize column header names
              </p>
              <Button variant="outline" size="sm" onClick={handleResetHeaders}>
                Reset to Default
              </Button>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="serialNumber">Serial Number</Label>
                <Input
                  id="serialNumber"
                  value={mappings.headers.serialNumber || ""}
                  onChange={(e) =>
                    handleHeaderChange("serialNumber", e.target.value)
                  }
                  placeholder="S/N"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="product">Product</Label>
                <Input
                  id="product"
                  value={mappings.headers.product || ""}
                  onChange={(e) =>
                    handleHeaderChange("product", e.target.value)
                  }
                  placeholder="Product"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="price">Price</Label>
                <Input
                  id="price"
                  value={mappings.headers.price || ""}
                  onChange={(e) => handleHeaderChange("price", e.target.value)}
                  placeholder="Price ($)"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="quantity">Quantity</Label>
                <Input
                  id="quantity"
                  value={mappings.headers.quantity || ""}
                  onChange={(e) =>
                    handleHeaderChange("quantity", e.target.value)
                  }
                  placeholder="Qty"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="discount">Discount</Label>
                <Input
                  id="discount"
                  value={mappings.headers.discount || ""}
                  onChange={(e) =>
                    handleHeaderChange("discount", e.target.value)
                  }
                  placeholder="Discount (%)"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="total">Total</Label>
                <Input
                  id="total"
                  value={mappings.headers.total || ""}
                  onChange={(e) => handleHeaderChange("total", e.target.value)}
                  placeholder="Total ($)"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="category">Category</Label>
                <Input
                  id="category"
                  value={mappings.headers.category || ""}
                  onChange={(e) =>
                    handleHeaderChange("category", e.target.value)
                  }
                  placeholder="Category"
                />
              </div>
            </div>
          </TabsContent>
          <TabsContent value="visibility" className="space-y-4">
            <div className="flex justify-between items-center">
              <p className="text-sm text-muted-foreground">
                Show or hide columns on invoices
              </p>
              <Button
                variant="outline"
                size="sm"
                onClick={handleResetVisibility}
              >
                Reset to Default
              </Button>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {Object.entries(mappings.visibility).map(([key, value]) => (
                <div key={key} className="flex items-center space-x-2">
                  <Checkbox
                    id={`vis-${key}`}
                    checked={value}
                    onCheckedChange={(checked) =>
                      handleVisibilityChange(
                        key as keyof ColumnMappings["visibility"],
                        checked as boolean,
                      )
                    }
                  />
                  <Label
                    htmlFor={`vis-${key}`}
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                  >
                    {mappings.headers[key as keyof ColumnMappings["headers"]] ||
                      key}
                  </Label>
                </div>
              ))}
            </div>
          </TabsContent>
          <TabsContent value="values" className="space-y-4">
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">
                Customize how product names, prices, and quantities appear on
                invoices
              </p>
              <div className="text-sm text-muted-foreground">
                {filteredProducts.length} of {availableProducts.length} products
              </div>
            </div>

            {/* Search Input */}
            <div className="relative">
              <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
              <Input
                placeholder="Search products by name..."
                value={productSearchTerm}
                onChange={(e) => setProductSearchTerm(e.target.value)}
                className="px-9"
              />
              {productSearchTerm && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute right-1 top-1/2 -translate-y-1/2 size-7 cursor-pointer"
                  onClick={() => setProductSearchTerm("")}
                >
                  <XIcon className="size-4" />
                </Button>
              )}
            </div>

            <ScrollArea className="h-62.5 border rounded-lg p-4">
              {availableProducts.length === 0 ? (
                <div className="flex items-center justify-center h-full text-muted-foreground">
                  No products available
                </div>
              ) : filteredProducts.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-muted-foreground space-y-2">
                  <SearchIcon className="size-8 opacity-50" />
                  <p>No products found matching "{productSearchTerm}"</p>
                  <Button
                    variant="link"
                    size="sm"
                    onClick={() => setProductSearchTerm("")}
                    className="text-primary"
                  >
                    Clear search
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredProducts.map((product) => {
                    const productNameMapping =
                      mappings.values.products[product.id]?.[product.name] ||
                      "";
                    const priceMapping =
                      mappings.values.prices[product.id] || "";
                    const quantityMapping =
                      mappings.values.quantities[product.id] || "";
                    const hasMapping = !!(
                      productNameMapping ||
                      priceMapping ||
                      quantityMapping
                    );
                    return (
                      <div
                        key={product.id}
                        className="p-4 border rounded-lg hover:bg-muted/50 transition-colors space-y-3"
                      >
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="font-medium">{product.name}</p>
                            <p className="text-sm text-muted-foreground">
                              ${product.basePrice.toFixed(2)}
                            </p>
                          </div>
                          {hasMapping && (
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() =>
                                handleRemoveProductMapping(product.id)
                              }
                              className="text-destructive hover:text-destructive hover:bg-destructive/10"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                        <div className="grid grid-cols-3 gap-3">
                          <div className="space-y-1">
                            <Label className="text-xs text-muted-foreground">
                              Display Name
                            </Label>
                            <Input
                              value={productNameMapping}
                              onChange={(e) =>
                                handleProductNameChange(
                                  product.id,
                                  product.name,
                                  e.target.value,
                                )
                              }
                              placeholder={product.name}
                              className="h-8 text-sm"
                            />
                          </div>
                          <div className="space-y-1">
                            <Label className="text-xs text-muted-foreground">
                              Display Price
                            </Label>
                            <Input
                              value={priceMapping}
                              onChange={(e) =>
                                handlePriceChange(product.id, e.target.value)
                              }
                              placeholder={product.basePrice.toFixed(2)}
                              className="h-8 text-sm"
                            />
                          </div>
                          <div className="space-y-1">
                            <Label className="text-xs text-muted-foreground">
                              Quantity Unit
                            </Label>
                            <Input
                              value={quantityMapping}
                              onChange={(e) =>
                                handleQuantityChange(product.id, e.target.value)
                              }
                              placeholder="e.g., box, dozen"
                              className="h-8 text-sm"
                            />
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </ScrollArea>
          </TabsContent>
        </Tabs>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave}>Save Changes</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
