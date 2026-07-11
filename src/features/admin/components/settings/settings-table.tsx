// src/features/admin/components/settings/settings-table.tsx

import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useConfirm } from "@/hooks/use-confirm";
import { Expense, Income } from "@/lib/types";
import { Eye, Trash } from "lucide-react";
import React from "react";

interface SettingsTableProps {
  variant: "Income" | "Expense";
  data: Income[] | Expense[];
  onEdit: (item: Income | Expense) => void;
  onDelete: (id: string) => void;
}

export const SettingsTable: React.FC<SettingsTableProps> = ({
  variant,
  data,
  onEdit,
  onDelete,
}) => {
  const getHeaders = () => {
    switch (variant) {
      case "Income":
      case "Expense":
        return ["Name", "Category", "Amount", "Date", "Actions"];
      default:
        return [];
    }
  };

  const [DeleteDialog, confirmDelete] = useConfirm({
    title: "Delete Item",
    message: "Are you sure you want to delete this item?",
    update: false,
  });

  const handleDelete = async (id: string) => {
    const result = await confirmDelete();

    if (result.action !== "confirm") return;

    onDelete(id);
  };

  const renderRow = (item: Income | Expense, index: number) => {
    switch (variant) {
      case "Income":
      case "Expense":
        const transaction = item as Income | Expense;
        return (
          <TableRow key={index}>
            <TableCell>{transaction.name}</TableCell>
            <TableCell>{transaction.category}</TableCell>
            <TableCell>${transaction.amount.toLocaleString()}</TableCell>
            <TableCell>
              {new Date(transaction.date).toISOString().split("T")[0]}
            </TableCell>
            <TableCell className="flex mx-auto">
              <Button variant="ghost" onClick={() => onEdit(item)}>
                <Eye className="h-4 w-4 text-[#fe9e1d]" />
              </Button>
              <Button
                variant="ghost"
                onClick={() => handleDelete(item.id || "")}
              >
                <Trash className="h-4 w-4 text-[#da281c]" />
              </Button>
            </TableCell>
          </TableRow>
        );
      default:
        return null;
    }
  };

  return (
    <>
      <DeleteDialog />
      <div className="border rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              {getHeaders().map((header, index) => (
                <TableHead key={index}>{header}</TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.length > 0 ? (
              data.map((item, index) => renderRow(item, index))
            ) : (
              <TableRow>
                <TableCell colSpan={5} className="text-center">
                  No {variant} data found!
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </>
  );
};
