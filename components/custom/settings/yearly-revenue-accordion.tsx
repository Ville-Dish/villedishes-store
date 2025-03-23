import React from "react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { MonthlyRevenueProjections } from "./monthly-revenue-projections";

export const YearlyRevenueAccordion: React.FC<YearlyRevenueAccordionProps> = ({
  revenueProjections,
  onUpdate,
}) => {
  const currentYear = new Date().getFullYear();
  const currentMonth = new Date().getMonth();

  // Sort projections to ensure current year is first
  const sortedProjections = [...revenueProjections].sort((a, b) => {
    if (a.year === currentYear) return -1;
    if (b.year === currentYear) return 1;
    return b.year - a.year;
  });

  return (
    <div className="border rounded-lg overflow-hidden">
      <Accordion type="single" collapsible className="w-full">
        {sortedProjections.map((yearlyRevenue) => (
          <AccordionItem
            key={yearlyRevenue.year}
            value={yearlyRevenue.year.toString()}
          >
            <AccordionTrigger className="ml-4 mr-2">
              Year {yearlyRevenue.year} - Target: $
              {yearlyRevenue.yearlyTarget.toLocaleString()}
            </AccordionTrigger>
            <AccordionContent className="ml-2 mr-2">
              <MonthlyRevenueProjections
                year={yearlyRevenue.year}
                yearlyTarget={yearlyRevenue.yearlyTarget}
                monthlyProjections={yearlyRevenue.monthlyProjections}
                onUpdate={(updatedProjections) =>
                  onUpdate(yearlyRevenue.year, updatedProjections)
                }
                currentYear={currentYear}
                currentMonth={currentMonth}
              />
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </div>
  );
};
