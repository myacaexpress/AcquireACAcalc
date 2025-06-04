
"use client";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatCurrency } from "@/lib/utils";
import type { ProjectionMonthData } from '@/app/page'; // Assuming type definition

interface MonthlyBreakdownTableProps {
  data: ProjectionMonthData[];
}

const tableHeaders = ['Month', 'Leads Purch.', 'New Sales', 'Active Subs', 'Revenue', 'Lead Costs', 'Enroll. Costs', 'Total Expenses', 'Monthly Profit', 'Cumulative Profit'];

const MonthlyBreakdownTable: React.FC<MonthlyBreakdownTableProps> = ({ data }) => {
  return (
    <div className="overflow-x-auto">
      <Table className="min-w-full">
        <TableHeader>
          <TableRow>
            {tableHeaders.map(header => (
              <TableHead key={header} className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider whitespace-nowrap">
                {header}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((row, index) => (
            <TableRow key={index} className={index % 2 === 0 ? 'bg-card' : 'bg-muted/50 hover:bg-muted'}>
              <TableCell className="px-4 py-3 whitespace-nowrap text-sm font-medium text-foreground">{row.month}</TableCell>
              <TableCell className="px-4 py-3 whitespace-nowrap text-sm text-muted-foreground">{row.leadsPurchased}</TableCell>
              <TableCell className="px-4 py-3 whitespace-nowrap text-sm text-muted-foreground">{row.newSales}</TableCell>
              <TableCell className="px-4 py-3 whitespace-nowrap text-sm text-muted-foreground">{row.totalActiveSubscriptions}</TableCell>
              <TableCell className="px-4 py-3 whitespace-nowrap text-sm text-green-600">{formatCurrency(row.revenue)}</TableCell>
              <TableCell className="px-4 py-3 whitespace-nowrap text-sm text-red-600">{formatCurrency(row.leadCosts)}</TableCell>
              <TableCell className="px-4 py-3 whitespace-nowrap text-sm text-red-600">{formatCurrency(row.enrollmentCosts)}</TableCell>
              <TableCell className="px-4 py-3 whitespace-nowrap text-sm text-red-600 font-semibold">{formatCurrency(row.totalExpenses)}</TableCell>
              <TableCell className={`px-4 py-3 whitespace-nowrap text-sm font-semibold ${row.monthlyProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {formatCurrency(row.monthlyProfit)}
              </TableCell>
              <TableCell className={`px-4 py-3 whitespace-nowrap text-sm font-bold ${row.cumulativeProfit >= 0 ? 'text-green-700' : 'text-red-700'}`}>
                {formatCurrency(row.cumulativeProfit)}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default MonthlyBreakdownTable;
