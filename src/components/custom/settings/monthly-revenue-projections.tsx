import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SettingsProgress } from "./progress";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface MonthlyRevenueProjectionsProps {
  year: number;
  yearlyTarget: number;
  monthlyProjections: MonthlyRevenue[];
  onUpdate: (updatedProjections: MonthlyRevenue[]) => void;
  currentYear: number;
  currentMonth: number;
}

export const MonthlyRevenueProjections: React.FC<
  MonthlyRevenueProjectionsProps
> = ({
  year,
  yearlyTarget,
  monthlyProjections,
  onUpdate,
  currentYear,
  currentMonth,
}) => {
  const [editingMonth, setEditingMonth] = useState<string | null>(null);
  const [editValue, setEditValue] = useState<string>("");
  const [localProjections, setLocalProjections] = useState(monthlyProjections);

  useEffect(() => {
    setLocalProjections(monthlyProjections);
  }, [monthlyProjections]);

  const handleEdit = (month: string, projection: number) => {
    setEditingMonth(month);
    setEditValue(projection.toString());
  };

  const handleSave = () => {
    if (editingMonth) {
      const updatedProjections = localProjections.map((mp) =>
        mp.month === editingMonth
          ? { ...mp, projection: parseFloat(editValue) }
          : mp
      );
      setLocalProjections(updatedProjections);
      onUpdate(updatedProjections);
      setEditingMonth(null);
    }
  };

  const totalActual = localProjections.reduce((sum, mp) => sum + mp.actual, 0);
  const yearProgress = (totalActual / yearlyTarget) * 100;

  const monthOrder = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  const isEditable = (monthIndex: number) => {
    if (year > currentYear) return true;
    if (year === currentYear) return monthIndex >= currentMonth;
    return false;
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label>Yearly Progress</Label>
        <SettingsProgress value={yearProgress} className="w-full" />
        <p className="text-sm text-gray-500">
          {yearProgress.toFixed(2)}% of yearly target ($
          {totalActual.toLocaleString()} / ${yearlyTarget.toLocaleString()})
        </p>
      </div>
      <div className="border rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Month</TableHead>
              <TableHead>Projection</TableHead>
              <TableHead>Actual</TableHead>
              <TableHead>Progress</TableHead>
              <TableHead>Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {localProjections
              .sort(
                (a, b) =>
                  monthOrder.indexOf(a.month) - monthOrder.indexOf(b.month)
              )
              .map(({ month, projection, actual }, index) => (
                <TableRow key={month}>
                  <TableCell>{month}</TableCell>
                  <TableCell>
                    {editingMonth === month ? (
                      <Input
                        value={editValue}
                        onChange={(e) => setEditValue(e.target.value)}
                        type="number"
                        className="w-24"
                      />
                    ) : (
                      `$${projection.toLocaleString()}`
                    )}
                  </TableCell>
                  <TableCell>${actual.toLocaleString()}</TableCell>
                  <TableCell>
                    <SettingsProgress
                      value={(actual / projection) * 100}
                      className="w-full"
                    />
                  </TableCell>
                  <TableCell>
                    {isEditable(index) ? (
                      editingMonth === month ? (
                        <Button
                          onClick={handleSave}
                          className="bg-[#1cd396] hover:bg-[#a3f0d6]"
                        >
                          Save
                        </Button>
                      ) : (
                        <Button
                          onClick={() => handleEdit(month, projection)}
                          className="bg-[#fe9e1d] hover:bg-[#b08c5c]"
                        >
                          Edit
                        </Button>
                      )
                    ) : (
                      <span className="text-gray-400">Locked</span>
                    )}
                  </TableCell>
                </TableRow>
              ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};
