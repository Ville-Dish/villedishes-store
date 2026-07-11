// src/features/admin/components/settings/settings-filter-dialog.tsx
"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Filter } from "lucide-react";
import { TransactionFilters } from "@/lib/types";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { emptyFilters } from "../../lib/utils";
import { DatePicker } from "@/components/custom/date-picker";
import { subDays } from "date-fns/subDays";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";

const ALL_CATEGORIES = "ALL";

interface SettingsFilterDialogProps {
  variant: "Income" | "Expense";
  categories: string[];
  filters: TransactionFilters;
  onApply: (filters: TransactionFilters) => void;
  activeCount: number;
}

export const SettingsFilterDrawer: React.FC<SettingsFilterDialogProps> = ({
  variant,
  categories,
  filters,
  onApply,
  activeCount,
}) => {
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState<TransactionFilters>(filters);

  const handleOpenChange = (next: boolean) => {
    if (next) setDraft(filters); // reset draft to current applied filters each time it opens
    setOpen(next);
  };

  const handleApply = () => {
    onApply(draft);
    setOpen(false);
  };

  const handleClear = () => {
    setDraft(emptyFilters);
    onApply(emptyFilters);
    setOpen(false);
  };
  return (
    <Drawer open={open} onOpenChange={handleOpenChange}>
      <DrawerTrigger asChild>
        <Button variant="outline" onClick={() => handleOpenChange(true)}>
          <Filter className="h-4 w-4 mr-2" />
          Filter{activeCount > 0 ? ` (${activeCount})` : ""}
        </Button>
      </DrawerTrigger>
      <DrawerContent className="inset-x-auto left-1/2 -translate-x-1/2 w-[90vw] max-w-3/4 rounded-xl">
        <DrawerHeader>
          <DrawerTitle>Filter {variant}</DrawerTitle>
          <DrawerDescription>
            Use the items to filter the {variant} table
          </DrawerDescription>
        </DrawerHeader>
        <div className="flex-1 p-4">
          <div className="rounded-2xl bg-muted group-data-[swipe-axis=x]/drawer-popup:size-full group-data-[swipe-axis=y]/drawer-popup:h-80 group-data-[swipe-axis=y]/drawer-popup:w-full" />
          <div className="flex flex-col">
            <div className="w-full">
              <Label>Category</Label>
              <Select
                value={draft.category || ALL_CATEGORIES}
                defaultValue="ALL CATEGORIES"
                onValueChange={(value) =>
                  setDraft((d) => ({
                    ...d,
                    category: value === ALL_CATEGORIES ? "" : value,
                  }))
                }
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select Category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectLabel>All Categories</SelectLabel>
                    <SelectItem value={ALL_CATEGORIES}>
                      Select Category
                    </SelectItem>
                    {categories.map((category) => (
                      <SelectItem key={category} value={category}>
                        {category}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Start Date</Label>
                <DatePicker
                  date={draft.startDate || undefined}
                  onSelect={(date) =>
                    setDraft((d) => ({ ...d, startDate: date ?? null }))
                  }
                  disabled={(date) =>
                    draft.endDate ? date > draft.endDate : false
                  }
                />
              </div>
              <div>
                <Label>End Date</Label>
                <DatePicker
                  date={draft.endDate || undefined}
                  onSelect={(date) =>
                    setDraft((d) => ({ ...d, endDate: date ?? null }))
                  }
                  disabled={(date) =>
                    draft.startDate ? date < draft.startDate : false
                  }
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Min Amount</Label>
                <Input
                  type="number"
                  placeholder="Min"
                  value={draft.minAmount || "Min"}
                  onChange={(e) =>
                    setDraft((d) => ({
                      ...d,
                      minAmount: Number(e.target.value),
                    }))
                  }
                />
              </div>
              <div>
                <Label>Max Amount</Label>
                <Input
                  type="number"
                  placeholder="Max"
                  value={draft.maxAmount || "Max"}
                  onChange={(e) =>
                    setDraft((d) => ({
                      ...d,
                      maxAmount: Number(e.target.value),
                    }))
                  }
                />
              </div>
            </div>
          </div>
        </div>
        <DrawerFooter>
          <DrawerClose>
            <div className="flex gap-2">
              <Button
                variant="outline"
                className="flex-1 cursor-pointer"
                onClick={handleClear}
              >
                Clear Filters
              </Button>

              <Button
                variant="submit"
                className="flex-1 cursor-pointer"
                onClick={handleApply}
              >
                Apply Filters
              </Button>
            </div>
          </DrawerClose>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
};
