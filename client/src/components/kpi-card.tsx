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
  valueColor = "text-foreground" 
}: KPICardProps) {
  const getChangeIcon = () => {
    switch (change?.type) {
      case "increase":
        return "↗";
      case "decrease":
        return "↘";
      case "neutral":
        return "→";
      default:
        return "";
    }
  };

  const getChangeColor = () => {
    switch (change?.type) {
      case "increase":
        return "text-green-600 dark:text-green-400";
      case "decrease":
        return "text-red-600 dark:text-red-400";
      case "neutral":
        return "text-muted-foreground";
      default:
        return "text-muted-foreground";
    }
  };

  return (
    <Card className="kpi-card apple-card border-border/50 bg-card/80 backdrop-blur-sm hover:bg-card/90 transition-all duration-300 hover:shadow-apple-lg">
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div className="flex-1 space-y-3">
            <p className="text-caption font-medium text-muted-foreground tracking-wide uppercase">{title}</p>
            <p className={`text-title-large font-semibold ${valueColor} tracking-tight leading-none`}>{value}</p>
            {change && (
              <div className={`flex items-center space-x-1.5 text-caption font-medium ${getChangeColor()}`}>
                <span className="text-sm">{getChangeIcon()}</span>
                <span>{change.value}</span>
              </div>
            )}
          </div>
          <div className={`w-12 h-12 rounded-2xl ${iconColor} flex items-center justify-center flex-shrink-0 shadow-apple`}>
            <Icon className="w-6 h-6 text-white" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
