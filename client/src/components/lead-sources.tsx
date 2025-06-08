
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts";
import { type LeadSourceData } from "@shared/schema";

interface LeadSourcesProps {
  data: LeadSourceData[];
  onSourceFilter: (source: string) => void;
  currentFilter?: string;
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

export function LeadSources({ data, onSourceFilter, currentFilter }: LeadSourcesProps) {
  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const totalLeads = data.reduce((sum, item) => sum + item.count, 0);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Pie Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Lead Sources Distribution</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percentage }) => `${name}: ${percentage}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="count"
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(value) => [value, 'Leads']} />
            </PieChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Lead Sources Table */}
      <Card>
        <CardHeader>
          <CardTitle>Lead Source Performance</CardTitle>
          {currentFilter && (
            <div className="flex items-center gap-2">
              <span className="text-sm text-neutral-600">Filtered by:</span>
              <Badge variant="secondary">{currentFilter}</Badge>
              <Button variant="outline" size="sm" onClick={() => onSourceFilter('')}>
                Clear Filter
              </Button>
            </div>
          )}
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {data.map((source, index) => (
              <div key={source.source} className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50 transition-colors">
                <div className="flex items-center gap-3">
                  <div 
                    className="w-4 h-4 rounded"
                    style={{ backgroundColor: COLORS[index % COLORS.length] }}
                  />
                  <div>
                    <p className="font-medium">{source.source}</p>
                    <p className="text-sm text-neutral-600">
                      {source.count} leads ({source.percentage}%)
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-green-600">{formatCurrency(source.revenue)}</p>
                  <p className="text-sm text-neutral-600">{source.conversionRate}% conversion</p>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="mt-1"
                    onClick={() => onSourceFilter(source.source)}
                  >
                    Filter View
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
