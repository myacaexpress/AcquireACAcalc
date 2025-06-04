
"use client";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { formatCurrency } from "@/lib/utils";
import type { ProjectionMonthData } from '@/app/page'; // Assuming type definition in page.tsx or a types file

interface ProjectionChartProps {
  data: ProjectionMonthData[];
}

const ProjectionChart: React.FC<ProjectionChartProps> = ({ data }) => {
  return (
    <ResponsiveContainer width="100%" height={400}>
      <LineChart data={data} margin={{ top: 5, right: 20, left: 30, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))"/>
        <XAxis dataKey="month" tick={{fontSize: 12, fill: 'hsl(var(--muted-foreground))'}} />
        <YAxis 
          tickFormatter={(value) => formatCurrency(value)} 
          tick={{fontSize: 12, fill: 'hsl(var(--muted-foreground))'}} 
          label={{ 
            value: 'Profit (USD)', 
            angle: -90, 
            position: 'insideLeft', 
            offset:-20, 
            style: {textAnchor: 'middle', fontSize: '14px', fill: 'hsl(var(--muted-foreground))'} 
          }}
        />
        <Tooltip 
          formatter={(value: number) => formatCurrency(value)} 
          labelStyle={{ fontWeight: 'bold', color: 'hsl(var(--foreground))' }}
          contentStyle={{ backgroundColor: 'hsl(var(--background))', border: '1px solid hsl(var(--border))', borderRadius: 'var(--radius)'}}
          cursor={{ stroke: 'hsl(var(--accent))', strokeWidth: 1 }}
        />
        <Legend wrapperStyle={{paddingTop: '20px', color: 'hsl(var(--muted-foreground))'}}/>
        <Line 
          type="monotone" 
          dataKey="cumulativeProfit" 
          stroke="hsl(var(--chart-1))" 
          strokeWidth={3} 
          activeDot={{ r: 8, fill: 'hsl(var(--chart-1))' }} 
          name="Cumulative Profit" 
          dot={{ fill: 'hsl(var(--chart-1))', r:3 }}
        />
        <Line 
          type="monotone" 
          dataKey="monthlyProfit" 
          stroke="hsl(var(--chart-2))" 
          strokeWidth={2} 
          name="Monthly Net Profit" 
          dot={{ fill: 'hsl(var(--chart-2))', r:2 }}
          activeDot={{ fill: 'hsl(var(--chart-2))' }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
};

export default ProjectionChart;
