import { Card, CardContent } from "@/components/ui/card";
import { LucideIcon } from "lucide-react";

interface KPICardProps {
  title: string;
  value: string | number;
  change?: {
    value: string;
    type: "increase" | "decrease" | "neutral";
  };
  icon: LucideIcon;
  iconColor: string;
  valueColor?: string;
}

export function KPICard({ 
  title, 
  value, 
  change, 
  icon: Icon, 
  iconColor, 
  valueColor = "text-neutral-900" 
}: KPICardProps) {
  const getChangeIcon = () => {
    switch (change?.type) {
      case "increase":
        return "▲";
      case "decrease":
        return "▼";
      case "neutral":
        return "—";
      default:
        return "";
    }
  };

  const getChangeColor = () => {
    switch (change?.type) {
      case "increase":
        return "text-green-600";
      case "decrease":
        return "text-red-500";
      case "neutral":
        return "text-neutral-500";
      default:
        return "text-neutral-500";
    }
  };

  return (
    <Card className="kpi-card hover:shadow-md transition-all duration-200 hover:translate-y-[-2px]">
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-neutral-600">{title}</p>
            <p className={`text-2xl font-bold ${valueColor}`}>{value}</p>
            {change && (
              <div className={`flex items-center mt-2 text-xs font-medium ${getChangeColor()}`}>
                <span className="mr-1">{getChangeIcon()}</span>
                <span>{change.value}</span>
              </div>
            )}
          </div>
          <div className={`p-3 rounded-full ${iconColor}`}>
            <Icon className="h-5 w-5 text-white" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
