
import type React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface StatCardProps {
  title: string;
  value: string;
  icon: React.ElementType;
  iconColor?: string;
  helpText?: string;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, icon: IconComponent, iconColor = "text-foreground", helpText }) => {
  return (
    <Card className="shadow-lg">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
        <IconComponent className={cn("h-5 w-5", iconColor)} />
      </CardHeader>
      <CardContent>
        <div className={`text-2xl font-bold ${iconColor}`}>{value}</div>
        {helpText && <p className="text-xs text-muted-foreground mt-1">{helpText}</p>}
      </CardContent>
    </Card>
  );
};

export default StatCard;
