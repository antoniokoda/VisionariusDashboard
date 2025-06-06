import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { KPICard } from "@/components/kpi-card";
import { ShowUpRatesComponent } from "@/components/show-up-rates";
import { SankeyDiagram } from "@/components/sankey-diagram";
import { DollarSign, Target, ChartGantt, Clock, Phone } from "lucide-react";
import { type DashboardData } from "@shared/schema";

export default function Dashboard() {
  const [selectedPeriod, setSelectedPeriod] = useState("2024-03");

  const { data: dashboardData, isLoading } = useQuery<DashboardData>({
    queryKey: ["/api/dashboard"],
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  const periodOptions = [
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

  if (isLoading) {
    return (
      <div className="space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
          {Array.from({ length: 5 }).map((_, i) => (
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

      {/* Top-Level KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
        <KPICard
          title="Cash Collected"
          value={formatCurrency(dashboardData.kpis.cashCollected)}
          icon={DollarSign}
          iconColor="bg-green-500"
          valueColor="text-green-600"
          change={{
            value: "+12.5% vs last month",
            type: "increase"
          }}
        />

        <KPICard
          title="Closing Rate"
          value={`${dashboardData.kpis.closingRate}%`}
          icon={Target}
          iconColor="bg-blue-500"
          valueColor="text-blue-600"
          change={{
            value: "+3.2% vs last month",
            type: "increase"
          }}
        />

        <KPICard
          title="Proposals Pitched"
          value={dashboardData.kpis.proposalsPitched}
          icon={ChartGantt}
          iconColor="bg-yellow-500"
          valueColor="text-yellow-600"
          change={{
            value: "-5.7% vs last month",
            type: "decrease"
          }}
        />

        <KPICard
          title="Avg. Sales Cycle"
          value={formatDays(dashboardData.kpis.avgSalesCycle)}
          icon={Clock}
          iconColor="bg-gray-500"
          valueColor="text-neutral-700"
          change={{
            value: "No change",
            type: "neutral"
          }}
        />

        <KPICard
          title="Total Calls"
          value={dashboardData.kpis.totalCalls}
          icon={Phone}
          iconColor="bg-purple-500"
          valueColor="text-purple-600"
          change={{
            value: "+8.1% vs last month",
            type: "increase"
          }}
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
            <CardTitle>Time-Based Metrics</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center py-3 border-b border-gray-100">
                <span className="text-sm text-neutral-600">Avg. First Discovery to First Closing</span>
                <span className="font-semibold text-neutral-900">
                  {formatDays(dashboardData.timeMetrics.discoveryToClosing)}
                </span>
              </div>
              <div className="flex justify-between items-center py-3 border-b border-gray-100">
                <span className="text-sm text-neutral-600">Avg. First Discovery to Close</span>
                <span className="font-semibold text-neutral-900">
                  {formatDays(dashboardData.timeMetrics.discoveryToFinalClose)}
                </span>
              </div>
              <div className="flex justify-between items-center py-3 border-b border-gray-100">
                <span className="text-sm text-neutral-600">Avg. Between Discovery Calls</span>
                <span className="font-semibold text-neutral-900">
                  {formatDays(dashboardData.timeMetrics.betweenDiscovery)}
                </span>
              </div>
              <div className="flex justify-between items-center py-3 border-b border-gray-100">
                <span className="text-sm text-neutral-600">Avg. Between Closing Calls</span>
                <span className="font-semibold text-neutral-900">
                  {formatDays(dashboardData.timeMetrics.betweenClosing)}
                </span>
              </div>
              <div className="flex justify-between items-center py-3">
                <span className="text-sm text-neutral-600">Avg. Sales Cycle Duration</span>
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
                <span className="text-sm text-neutral-600">Avg. Discovery Call Duration</span>
                <span className="font-semibold text-neutral-900">
                  {formatMinutes(dashboardData.callMetrics.discoveryDuration)}
                </span>
              </div>
              <div className="flex justify-between items-center py-3 border-b border-gray-100">
                <span className="text-sm text-neutral-600">Avg. Closing Call Duration</span>
                <span className="font-semibold text-neutral-900">
                  {formatMinutes(dashboardData.callMetrics.closingDuration)}
                </span>
              </div>
              <div className="flex justify-between items-center py-3">
                <span className="text-sm text-neutral-600">Average Revenue per Client</span>
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
