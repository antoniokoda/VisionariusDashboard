
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { type SalespersonPerformance } from "@shared/schema";
import { Trophy, TrendingUp, Phone, Target } from "lucide-react";

interface SalespersonPerformanceProps {
  data: SalespersonPerformance[];
  onSalespersonFilter: (name: string) => void;
  currentFilter?: string;
}

export function SalespersonPerformanceComponent({ data, onSalespersonFilter, currentFilter }: SalespersonPerformanceProps) {
  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const sortedData = [...data].sort((a, b) => b.totalRevenue - a.totalRevenue);
  const topPerformer = sortedData[0];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Trophy className="h-5 w-5 text-yellow-500" />
          Salesperson Performance
        </CardTitle>
        {currentFilter && (
          <div className="flex items-center gap-2">
            <span className="text-sm text-neutral-600">Filtered by:</span>
            <Badge variant="secondary">{currentFilter}</Badge>
            <Button variant="outline" size="sm" onClick={() => onSalespersonFilter('')}>
              Clear Filter
            </Button>
          </div>
        )}
      </CardHeader>
      <CardContent>
        <div className="mb-4">
          <Select value={currentFilter || "all"} onValueChange={(value) => onSalespersonFilter(value === "all" ? "" : value)}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Filter by salesperson" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Salespeople</SelectItem>
              {data.map((person) => (
                <SelectItem key={person.name} value={person.name}>
                  {person.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {sortedData.map((person, index) => (
            <div 
              key={person.name} 
              className={`p-4 border rounded-lg ${
                person.name === topPerformer?.name ? 'border-yellow-300 bg-yellow-50' : 'border-gray-200'
              }`}
            >
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold text-lg">{person.name}</h3>
                {person.name === topPerformer?.name && (
                  <Trophy className="h-5 w-5 text-yellow-500" />
                )}
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-green-500" />
                  <span className="text-sm text-neutral-600">Revenue:</span>
                  <span className="font-semibold text-green-600">
                    {formatCurrency(person.totalRevenue)}
                  </span>
                </div>
                
                <div className="flex items-center gap-2">
                  <Target className="h-4 w-4 text-blue-500" />
                  <span className="text-sm text-neutral-600">Deals Won:</span>
                  <span className="font-semibold">{person.dealsWon}</span>
                </div>
                
                <div className="flex items-center gap-2">
                  <Target className="h-4 w-4 text-purple-500" />
                  <span className="text-sm text-neutral-600">Closing Rate:</span>
                  <span className="font-semibold">{person.closingRate}%</span>
                </div>
                
                <div className="flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-indigo-500" />
                  <span className="text-sm text-neutral-600">Avg Deal Size:</span>
                  <span className="font-semibold">{formatCurrency(person.avgDealSize)}</span>
                </div>
                
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-gray-500" />
                  <span className="text-sm text-neutral-600">Total Calls:</span>
                  <span className="font-semibold">{person.totalCalls}</span>
                </div>
              </div>
              
              <Button 
                variant="outline" 
                size="sm" 
                className="w-full mt-3"
                onClick={() => onSalespersonFilter(person.name)}
              >
                View Details
              </Button>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
