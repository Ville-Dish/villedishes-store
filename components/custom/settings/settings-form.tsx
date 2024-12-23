import React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { X } from "lucide-react";

interface SettingsFormProps {
  variant: "Revenue" | "Income" | "Expense";
  onSubmit: (event: React.FormEvent<HTMLFormElement>) => void;
  onClose: () => void;
}

export const SettingsForm: React.FC<SettingsFormProps> = ({
  variant,
  onSubmit,
  onClose,
}) => {
  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    onSubmit(event);
    onClose();
  };

  return (
    <section className="border rounded-md border-[#fff1e2]">
      <form onSubmit={handleSubmit} className="space-y-4 mx-6 my-2">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">Add {variant}</h3>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-4 w-4 text-[#da281c]" />
            <span className="sr-only">Close</span>
          </Button>
        </div>

        {variant === "Revenue" && (
          <>
            <div className="space-y-2">
              <Label htmlFor="year">Year</Label>
              <Input id="year" name="year" type="number" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="yearlyTarget">Yearly Target</Label>
              <Input
                id="yearlyTarget"
                name="yearlyTarget"
                type="number"
                required
              />
            </div>
          </>
        )}

        {(variant === "Income" || variant === "Expense") && (
          <>
            <div className="space-y-2">
              <Label htmlFor={`${variant.toLowerCase()}-name`}>
                {variant} Name
              </Label>
              <Input
                id={`${variant.toLowerCase()}-name`}
                name="name"
                placeholder={`Enter ${variant.toLowerCase()} name`}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor={`${variant.toLowerCase()}-category`}>
                {variant} Category
              </Label>
              <Input
                id={`${variant.toLowerCase()}-category`}
                name="category"
                placeholder={`Enter ${variant.toLowerCase()} category`}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor={`${variant.toLowerCase()}-amount`}>Amount</Label>
              <Input
                id={`${variant.toLowerCase()}-amount`}
                name="amount"
                type="number"
                placeholder="Enter amount"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor={`${variant.toLowerCase()}-date`}>Date</Label>
              <Input
                id={`${variant.toLowerCase()}-date`}
                name="date"
                type="date"
                required
              />
            </div>
          </>
        )}

        <div className="flex justify-end mt-4">
          <Button type="submit" className="bg-[#1cd396]">
            Add {variant}
          </Button>
        </div>
      </form>
    </section>
  );
};
