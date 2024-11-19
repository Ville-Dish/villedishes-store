import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";

export const ReportsTable = () => {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Report Type</TableHead>
          <TableHead>Date</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Action</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        <TableRow>
          <TableCell>Monthly Sales Report</TableCell>
          <TableCell>May 2023</TableCell>
          <TableCell>Completed</TableCell>
          <TableCell>
            <Button variant="outline" size="sm">
              View
            </Button>
          </TableCell>
        </TableRow>
        <TableRow>
          <TableCell>Quarterly Financial Statement</TableCell>
          <TableCell>Q2 2023</TableCell>
          <TableCell>In Progress</TableCell>
          <TableCell>
            <Button variant="outline" size="sm" disabled>
              View
            </Button>
          </TableCell>
        </TableRow>
        <TableRow>
          <TableCell>Annual Performance Review</TableCell>
          <TableCell>2022</TableCell>
          <TableCell>Completed</TableCell>
          <TableCell>
            <Button variant="outline" size="sm">
              View
            </Button>
          </TableCell>
        </TableRow>
      </TableBody>
    </Table>
  );
};
