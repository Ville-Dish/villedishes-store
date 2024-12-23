import React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export const SettingsTable: React.FC<SettingsTableProps> = ({
  variant,
  data,
}) => {
  const getHeaders = () => {
    switch (variant) {
      case "Income":
      case "Expense":
        return ["Name", "Category", "Amount", "Date"];
      default:
        return [];
    }
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
            <TableCell>{transaction.date}</TableCell>
          </TableRow>
        );
      default:
        return null;
    }
  };

  return (
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
          {data.map((item, index) => renderRow(item, index))}
        </TableBody>
      </Table>
    </div>
  );
};
