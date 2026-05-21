"use client";

import { cn } from "@/lib/utils";
import { Check, ChevronsUpDown, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";

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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useSuspenseQuery } from "@tanstack/react-query";
import { useTRPC } from "@/trpc/client";

interface CategoryMappingDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  categoryMappings: Record<string, string>;
  onSave: (mappings: Record<string, string>) => void;
}
export const CategoryMappingDialog = ({
  open,
  onOpenChange,
  categoryMappings,
  onSave,
}: CategoryMappingDialogProps) => {
  const trpc = useTRPC();

  const [mappings, setMappings] =
    useState<Record<string, string>>(categoryMappings);
  const [availableCategories, setAvailableCategories] = useState<string[]>([]);
  const [newCategory, setNewCategory] = useState("");
  const [newDisplayName, setNewDisplayName] = useState("");
  const [categoryOpen, setCategoryOpen] = useState(false);
  const [searchValue, setSearchValue] = useState("");

  // Fetch Categories
  const { data: categories, isLoading } = useSuspenseQuery(
    trpc.products.getCategories.queryOptions(),
  );

  useEffect(() => {
    setMappings(categoryMappings);
  }, [categoryMappings]);

  useEffect(() => {
    setAvailableCategories(categories);
  }, []);

  const handleAddMapping = () => {
    const trimmedCategory = newCategory.trim();
    const trimmedDisplay = newDisplayName.trim();
    if (!trimmedCategory || !trimmedDisplay) return;
    if (!availableCategories.includes(trimmedCategory)) {
      setAvailableCategories((prev) => [...prev, trimmedCategory]);
    }
    setMappings({ ...mappings, [trimmedCategory]: trimmedDisplay });
    setNewCategory("");
    setNewDisplayName("");
  };

  const handleRemoveMapping = (category: string) => {
    const newMappings = { ...mappings };
    delete newMappings[category];
    setMappings(newMappings);
  };

  const handleUpdateMapping = (category: string, newDisplayName: string) => {
    setMappings({ ...mappings, [category]: newDisplayName });
  };

  const handleSave = () => {
    onSave(mappings);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Category Display Names</DialogTitle>
          <DialogDescription>
            Configure how category names appear on invoices. Map original
            category names to custom display names.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          {/* Add new mapping */}
          <div className="grid grid-cols-2 gap-4 p-4 border rounded-lg bg-muted/50">
            <div className="space-y-2">
              <Label htmlFor="newCategory">Original Category</Label>
              <Popover open={categoryOpen} onOpenChange={setCategoryOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={categoryOpen}
                    className="w-full justify-between"
                  >
                    {newCategory || "Select or create category"}
                    <ChevronsUpDown className="ml-2 size-4 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-full p-0">
                  <Command shouldFilter={false}>
                    <CommandInput
                      placeholder="Search or create category..."
                      value={searchValue}
                      onValueChange={setSearchValue}
                    />
                    <CommandList>
                      <CommandEmpty>
                        <button
                          type="button"
                          className="relative flex w-full select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none hover:bg-accent hover:text-accent-foreground cursor-pointer"
                          onClick={() => {
                            const input = searchValue.trim();
                            if (!input) return;
                            if (!availableCategories.includes(input)) {
                              setAvailableCategories((prev) => [
                                ...prev,
                                input,
                              ]);
                            }
                            setNewCategory(input);
                            setSearchValue("");
                            setCategoryOpen(false);
                          }}
                        >
                          Create "{searchValue}"
                        </button>
                      </CommandEmpty>
                      <CommandGroup>
                        {availableCategories
                          .filter((cat) =>
                            cat
                              .toLowerCase()
                              .includes(searchValue.toLowerCase()),
                          )
                          .map((category) => (
                            <CommandItem
                              key={category}
                              value={category}
                              onSelect={(value) => {
                                setNewCategory(value);
                                setSearchValue("");
                                setCategoryOpen(false);
                              }}
                            >
                              <Check
                                className={cn(
                                  "mr-2 h-4 w-4",
                                  newCategory === category
                                    ? "opacity-100"
                                    : "opacity-0",
                                )}
                              />
                              {category}
                            </CommandItem>
                          ))}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
            </div>
            <div className="space-y-2">
              <Label htmlFor="newDisplayName">Display Name</Label>
              <div className="flex gap-2">
                <Input
                  id="newDisplayName"
                  placeholder="e.g., Starters"
                  value={newDisplayName}
                  onChange={(e) => setNewDisplayName(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      handleAddMapping();
                    }
                  }}
                />
                <Button
                  onClick={handleAddMapping}
                  disabled={!newCategory.trim() || !newDisplayName.trim()}
                >
                  Add
                </Button>
              </div>
            </div>
          </div>
          {/* Existing mappings */}
          <ScrollArea className="h-75 border rounded-lg p-4">
            {Object.keys(mappings).length === 0 ? (
              <div className="flex items-center justify-center h-full text-muted-foreground">
                No category mappings yet. Add one above to get started.
              </div>
            ) : (
              <div className="space-y-3">
                {Object.entries(mappings).map(([category, displayName]) => (
                  <div
                    key={category}
                    className="grid grid-cols-2 gap-4 items-center p-3 border rounded-lg hover:bg-muted/50 transition-colors"
                  >
                    <div>
                      <Label className="text-xs text-muted-foreground">
                        Original
                      </Label>
                      <p className="font-medium">{category}</p>
                    </div>
                    <div className="flex gap-2 items-end">
                      <div className="flex-1">
                        <Label className="text-xs text-muted-foreground">
                          Display As
                        </Label>
                        <Input
                          value={displayName}
                          onChange={(e) =>
                            handleUpdateMapping(category, e.target.value)
                          }
                          className="mt-1"
                        />
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleRemoveMapping(category)}
                        className="text-destructive hover:text-destructive hover:bg-destructive/10"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </ScrollArea>
        </div>
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
