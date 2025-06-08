import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { KPICard } from "@/components/kpi-card";
import { ShowUpRatesComponent } from "@/components/show-up-rates";
import { SankeyDiagram } from "@/components/sankey-diagram";
import { DollarSign, Target, ChartGantt, Clock, Phone, TrendingUp, BarChart3 } from "lucide-react";
import { type DashboardData } from "@shared/schema";

export default function Dashboard() {
  const [selectedPeriod, setSelectedPeriod] = useState("all");

  const { data: dashboardData, isLoading } = useQuery<DashboardData>({
    queryKey: ["/api/dashboard", selectedPeriod],
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  const periodOptions = [
    { value: "all", label: "All Months" },
    { value: "2024-01", label: "January 2024" },
    { value: "2024-02", label: "February 2024" },
    { value: "2024-03", label: "March 2024" },
    { value: "2024-04", label: "April 2024" },
    { value: "2024-05", label: "May 2024" },
    { value: "2024-06", label: "June 2024" },
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
    <div className="min-h-screen bg-background">
      {/* Apple-style sticky header with glass morphism */}
      <div className="sticky top-0 z-50 glass border-b border-border/30 px-6 py-5">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-headline font-semibold text-foreground tracking-tight">Mission Control</h1>
            <p className="text-body text-muted-foreground mt-1">Sales Performance Analytics</p>
          </div>
          
          <div className="flex items-center gap-3">
            <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
              <SelectTrigger className="w-52 h-11 rounded-xl border-border/50 bg-card/50 backdrop-blur-sm apple-button text-body font-medium">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="rounded-2xl border-border/50 bg-card/95 backdrop-blur-xl shadow-apple-lg">
                {periodOptions.map((option) => (
                  <SelectItem 
                    key={option.value} 
                    value={option.value}
                    className="rounded-xl focus:bg-primary/8 text-body"
                  >
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Main content with proper spacing */}
      <div className="max-w-7xl mx-auto px-6 py-8 space-y-8">

        {/* Apple-style KPI Cards with refined design */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-7 gap-4">
          <KPICard
            title="Total Revenue"
            value={formatCurrency(dashboardData.kpis.totalRevenue)}
            icon={TrendingUp}
            iconColor="bg-gradient-to-br from-green-400 to-green-600"
            valueColor="text-green-600 dark:text-green-400"
            change={formatPercentageChange(dashboardData.kpis.totalRevenueChange)}
          />

          <KPICard
            title="Cash Collected"
            value={formatCurrency(dashboardData.kpis.cashCollected)}
            icon={DollarSign}
            iconColor="bg-gradient-to-br from-emerald-400 to-emerald-600"
            valueColor="text-emerald-600 dark:text-emerald-400"
            change={formatPercentageChange(dashboardData.kpis.cashCollectedChange)}
          />

          <KPICard
            title="Closing Rate"
            value={`${dashboardData.kpis.closingRate}%`}
            icon={Target}
            iconColor="bg-gradient-to-br from-blue-400 to-blue-600"
            valueColor="text-blue-600 dark:text-blue-400"
            change={formatPercentageChange(dashboardData.kpis.closingRateChange)}
          />

          <KPICard
            title="Proposals Pitched"
            value={dashboardData.kpis.proposalsPitched}
            icon={ChartGantt}
            iconColor="bg-gradient-to-br from-orange-400 to-orange-600"
            valueColor="text-orange-600 dark:text-orange-400"
            change={formatPercentageChange(dashboardData.kpis.proposalsPitchedChange)}
          />

          <KPICard
            title="Avg Sales Cycle"
            value={formatDays(dashboardData.kpis.avgSalesCycle)}
            icon={Clock}
            iconColor="bg-gradient-to-br from-gray-400 to-gray-600"
            valueColor="text-gray-600 dark:text-gray-400"
            change={formatPercentageChange(dashboardData.kpis.avgSalesCycleChange)}
          />

          <KPICard
            title="Total Calls"
            value={dashboardData.kpis.totalCalls}
            icon={Phone}
            iconColor="bg-gradient-to-br from-purple-400 to-purple-600"
            valueColor="text-purple-600 dark:text-purple-400"
            change={formatPercentageChange(dashboardData.kpis.totalCallsChange)}
          />

          <KPICard
            title="Average Deal Size"
            value={formatCurrency(dashboardData.kpis.avgDealSize)}
            icon={BarChart3}
            iconColor="bg-gradient-to-br from-indigo-400 to-indigo-600"
            valueColor="text-indigo-600 dark:text-indigo-400"
            change={formatPercentageChange(dashboardData.kpis.avgDealSizeChange)}
          />
        </div>

      {/* Show-Up Rates */}
      <ShowUpRatesComponent showUpRates={dashboardData.showUpRates} />

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
    </div>
  );
}
