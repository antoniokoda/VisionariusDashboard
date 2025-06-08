
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Line, LineChart, ResponsiveContainer, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from "recharts";
import { type TrendData } from "@shared/schema";

interface TrendChartProps {
  data: TrendData[];
  title: string;
}

export function TrendChart({ data, title }: TrendChartProps) {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const formatPeriod = (period: string) => {
    const [year, month] = period.split('-');
    const monthNames = [
      "Jan", "Feb", "Mar", "Apr", "May", "Jun",
      "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
    ];
    return `${monthNames[parseInt(month) - 1]} ${year}`;
  };

  const chartData = data.map(item => ({
    ...item,
    formattedPeriod: formatPeriod(item.period)
  }));

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis 
              dataKey="formattedPeriod" 
              fontSize={12}
              tickLine={false}
              axisLine={false}
            />
            <YAxis 
              fontSize={12}
              tickLine={false}
              axisLine={false}
              tickFormatter={(value) => formatCurrency(value)}
            />
            <Tooltip 
              formatter={(value, name) => [
                name === 'revenue' || name === 'cashCollected' ? formatCurrency(Number(value)) : value,
                name === 'revenue' ? 'Revenue' : 
                name === 'cashCollected' ? 'Cash Collected' :
                name === 'deals' ? 'Total Deals' :
                name === 'closingRate' ? 'Closing Rate (%)' : name
              ]}
              labelFormatter={(label) => `Period: ${label}`}
            />
            <Legend />
            <Line 
              type="monotone" 
              dataKey="revenue" 
              stroke="#10b981" 
              strokeWidth={2}
              name="Revenue"
            />
            <Line 
              type="monotone" 
              dataKey="cashCollected" 
              stroke="#3b82f6" 
              strokeWidth={2}
              name="Cash Collected"
            />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
