"use client";

import { CalendarIcon } from "@radix-ui/react-icons";
import { format } from "date-fns/format";
import * as React from "react";
import { DateRange } from "react-day-picker";

import { Button } from "../ui/button";
import { Calendar } from "../ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";
import { useDashboardParams } from "@/features/admin/dashboard/hooks/use-dashboard-params";
import { thirtyDaysAgo, today } from "@/features/admin/dashboard/params";

export function DatePickerWithRange({
  className,
  date,
  setDate,
}: React.HTMLAttributes<HTMLDivElement> & {
  date: DateRange | undefined;
  setDate: (date: DateRange | undefined) => void;
}) {
  const [open, setOpen] = useState(false);
  const [params, setParams] = useDashboardParams();
  // Internal pending selection — only committed when Done is clicked
  const [pendingDate, setPendingDate] = useState<DateRange | undefined>(date);

  // Keep pending in sync when external date changes (e.g. clearFilters)
  useEffect(() => {
    setPendingDate(date);
  }, [date]);

  const handleDone = () => {
    setDate(pendingDate);
    setOpen(false);
  };

  const handleClear = () => {
    setPendingDate(undefined);
    setDate(undefined);
    setOpen(false);
    setParams({
      ...params,
      startDate: thirtyDaysAgo,
      endDate: today,
    });
  };
  return (
    <div className={cn("grid gap-2", className)}>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            id="date"
            variant={"outline"}
            className={cn(
              "justify-start text-left font-normal",
              !date && "text-muted-foreground",
            )}
          >
            <CalendarIcon className="size-4" />
            {date?.from ? (
              date.to ? (
                <>
                  {format(date.from, "LLL dd, y")} -{" "}
                  {format(date.to, "LLL dd, y")}
                </>
              ) : (
                format(date.from, "LLL dd, y")
              )
            ) : (
              <span>Pick a date</span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            autoFocus
            mode="range"
            defaultMonth={date?.from}
            selected={pendingDate}
            onSelect={setPendingDate}
            numberOfMonths={2}
          />

          {/* Done/ Clear actions */}
          <div className="flex items-center justify-end gap-2 border-t px-3 py-2">
            <Button variant="ghost" size="sm" onClick={handleClear}>
              Clear
            </Button>
            <Button
              size="sm"
              onClick={handleDone}
              disabled={!pendingDate?.from}
            >
              Done
            </Button>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}
