import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { KPICard } from "@/components/kpi-card";
import { ShowUpRatesComponent } from "@/components/show-up-rates";
import { SankeyDiagram } from "@/components/sankey-diagram";
import { TrendChart } from "@/components/trend-chart";
import { LeadSources } from "@/components/lead-sources";
import { SalespersonPerformanceComponent } from "@/components/salesperson-performance";
import { DollarSign, Target, ChartGantt, Clock, Phone, TrendingUp } from "lucide-react";
import { type DashboardData } from "@shared/schema";

export default function Dashboard() {
  const [selectedPeriod, setSelectedPeriod] = useState("all");
  const [leadSourceFilter, setLeadSourceFilter] = useState("");
  const [salespersonFilter, setSalespersonFilter] = useState("");

  const { data: dashboardData, isLoading } = useQuery<DashboardData>({
    queryKey: ["/api/dashboard", selectedPeriod, leadSourceFilter, salespersonFilter],
    queryFn: async () => {
      let url = "/api/dashboard";
      
      if (leadSourceFilter) {
        url = `/api/dashboard/source/${encodeURIComponent(leadSourceFilter)}`;
      } else if (salespersonFilter) {
        url = `/api/dashboard/salesperson/${encodeURIComponent(salespersonFilter)}`;
      }
      
      const params = new URLSearchParams();
      if (selectedPeriod !== "all") {
        params.append("period", selectedPeriod);
      }
      
      const response = await fetch(`${url}${params.toString() ? `?${params.toString()}` : ""}`);
      if (!response.ok) {
        throw new Error('Failed to fetch dashboard data');
      }
      return response.json();
    },
  });

  const { data: availableMonths = [] } = useQuery<string[]>({
    queryKey: ["/api/available-months"],
  });

  const periodOptions = [
    { value: "all", label: "All Months" },
    ...availableMonths.map(month => {
      const [year, monthNum] = month.split('-');
      const monthNames = [
        "January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"
      ];
      const monthName = monthNames[parseInt(monthNum) - 1];
      return {
        value: month,
        label: `${monthName} ${year}`
      };
    })
  ];

  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatDays = (days: number): string => {
    return `${days} day${days !== 1 ? 's' : ''}`;
  };

  const formatMinutes = (minutes: number): string => {
    return `${minutes} min`;
  };

  const formatPercentageChange = (change?: number): { value: string; type: "increase" | "decrease" | "neutral" } | undefined => {
    if (change === undefined || change === 0) return undefined;
    
    const absChange = Math.abs(change);
    const formattedChange = absChange < 0.1 ? "< 0.1" : absChange.toFixed(1);
    
    return {
      value: `${change > 0 ? '+' : '-'}${formattedChange}% vs last month`,
      type: change > 0 ? "increase" : change < 0 ? "decrease" : "neutral"
    };
  };

  const handleLeadSourceFilter = (source: string) => {
    setLeadSourceFilter(source);
    setSalespersonFilter(""); // Clear other filter
  };

  const handleSalespersonFilter = (name: string) => {
    setSalespersonFilter(name);
    setLeadSourceFilter(""); // Clear other filter
  };

  if (isLoading) {
    return (
      <div className="space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
        <Skeleton className="h-64" />
        <Skeleton className="h-96" />
      </div>
    );
  }

  if (!dashboardData) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-neutral-500">Failed to load dashboard data</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header with Filter */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900">Mission Control Dashboard</h1>
          <p className="text-neutral-600">Sales performance overview</p>
        </div>
        <div className="flex items-center space-x-3">
          <label className="text-sm font-medium text-neutral-600">Filter Period:</label>
          <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
            <SelectTrigger className="w-48">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {periodOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Top-Level KPI Cards - Row 1: Revenue Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <KPICard
          title="Total Revenue"
          value={formatCurrency(dashboardData.kpis.totalRevenue)}
          icon={TrendingUp}
          iconColor="bg-emerald-500"
          valueColor="text-emerald-600"
          change={formatPercentageChange(dashboardData.kpis.totalRevenueChange)}
        />

        <KPICard
          title="Cash Collected"
          value={formatCurrency(dashboardData.kpis.cashCollected)}
          icon={DollarSign}
          iconColor="bg-green-500"
          valueColor="text-green-600"
          change={formatPercentageChange(dashboardData.kpis.cashCollectedChange)}
        />

        <KPICard
          title="Closing Rate"
          value={`${dashboardData.kpis.closingRate}%`}
          icon={Target}
          iconColor="bg-blue-500"
          valueColor="text-blue-600"
          change={formatPercentageChange(dashboardData.kpis.closingRateChange)}
        />
      </div>

      {/* KPI Cards - Row 2: Performance Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <KPICard
          title="Proposals Pitched"
          value={dashboardData.kpis.proposalsPitched}
          icon={ChartGantt}
          iconColor="bg-yellow-500"
          valueColor="text-yellow-600"
          change={formatPercentageChange(dashboardData.kpis.proposalsPitchedChange)}
        />

        <KPICard
          title="Avg Sales Cycle"
          value={formatDays(dashboardData.kpis.avgSalesCycle)}
          icon={Clock}
          iconColor="bg-gray-500"
          valueColor="text-neutral-700"
          change={formatPercentageChange(dashboardData.kpis.avgSalesCycleChange)}
        />

        <KPICard
          title="Total Calls"
          value={dashboardData.kpis.totalCalls}
          icon={Phone}
          iconColor="bg-purple-500"
          valueColor="text-purple-600"
          change={formatPercentageChange(dashboardData.kpis.totalCallsChange)}
        />

        <KPICard
          title="Average Deal Size"
          value={formatCurrency(dashboardData.kpis.avgDealSize)}
          icon={TrendingUp}
          iconColor="bg-indigo-500"
          valueColor="text-indigo-600"
          change={formatPercentageChange(dashboardData.kpis.avgDealSizeChange)}
        />
      </div>

      {/* Show-Up Rates */}
      <ShowUpRatesComponent showUpRates={dashboardData.showUpRates} />

      {/* Lead Sources Analytics */}
      <LeadSources 
        data={dashboardData.leadSources} 
        onSourceFilter={handleLeadSourceFilter}
        currentFilter={leadSourceFilter}
      />

      {/* Salesperson Performance */}
      <SalespersonPerformanceComponent 
        data={dashboardData.salespeople} 
        onSalespersonFilter={handleSalespersonFilter}
        currentFilter={salespersonFilter}
      />

      {/* Trend Analysis */}
      <TrendChart 
        data={dashboardData.trendData} 
        title="Monthly Performance Trends" 
      />

      {/* Sankey Diagram */}
      <Card>
        <CardHeader>
          <CardTitle>Sales Funnel Flow</CardTitle>
        </CardHeader>
        <CardContent>
          <SankeyDiagram data={dashboardData.funnelData} />
        </CardContent>
      </Card>

      {/* Time & Averages Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Time-Based Metrics */}
        <Card>
          <CardHeader>
            <CardTitle>Time Metrics</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center py-3 border-b border-gray-100">
                <span className="text-sm text-neutral-600">Avg First Discovery to First Closing</span>
                <span className="font-semibold text-neutral-900">
                  {formatDays(dashboardData.timeMetrics.discoveryToClosing)}
                </span>
              </div>
              <div className="flex justify-between items-center py-3 border-b border-gray-100">
                <span className="text-sm text-neutral-600">Avg First Discovery to Final Close</span>
                <span className="font-semibold text-neutral-900">
                  {formatDays(dashboardData.timeMetrics.discoveryToFinalClose)}
                </span>
              </div>
              <div className="flex justify-between items-center py-3 border-b border-gray-100">
                <span className="text-sm text-neutral-600">Avg Between Discovery Calls</span>
                <span className="font-semibold text-neutral-900">
                  {formatDays(dashboardData.timeMetrics.betweenDiscovery)}
                </span>
              </div>
              <div className="flex justify-between items-center py-3 border-b border-gray-100">
                <span className="text-sm text-neutral-600">Avg Between Closing Calls</span>
                <span className="font-semibold text-neutral-900">
                  {formatDays(dashboardData.timeMetrics.betweenClosing)}
                </span>
              </div>
              <div className="flex justify-between items-center py-3">
                <span className="text-sm text-neutral-600">Avg Sales Cycle Duration</span>
                <span className="font-semibold text-neutral-900">
                  {formatDays(dashboardData.timeMetrics.salesCycle)}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Call Duration & Revenue Averages */}
        <Card>
          <CardHeader>
            <CardTitle>Call Duration & Revenue</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center py-3 border-b border-gray-100">
                <span className="text-sm text-neutral-600">Avg Discovery Call Duration</span>
                <span className="font-semibold text-neutral-900">
                  {formatMinutes(dashboardData.callMetrics.discoveryDuration)}
                </span>
              </div>
              <div className="flex justify-between items-center py-3 border-b border-gray-100">
                <span className="text-sm text-neutral-600">Avg Closing Call Duration</span>
                <span className="font-semibold text-neutral-900">
                  {formatMinutes(dashboardData.callMetrics.closingDuration)}
                </span>
              </div>
              <div className="flex justify-between items-center py-3">
                <span className="text-sm text-neutral-600">Avg Revenue per Client</span>
                <span className="font-semibold text-green-600 text-lg">
                  {formatCurrency(dashboardData.callMetrics.avgRevenue)}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
