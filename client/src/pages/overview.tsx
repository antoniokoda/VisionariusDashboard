import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { KPICard } from "@/components/kpi-card";
import { ShowUpRatesComponent } from "@/components/show-up-rates";
import { SankeyDiagram } from "@/components/sankey-diagram";
import { DollarSign, Target, ChartGantt, Clock, Phone, TrendingUp } from "lucide-react";
import { type DashboardData } from "@shared/schema";

export default function Overview() {
  const { data: dashboardData, isLoading } = useQuery<DashboardData>({
    queryKey: ["/api/dashboard"],
    refetchInterval: 30000,
  });

  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatDays = (days: number): string => {
    return `${days} día${days !== 1 ? 's' : ''}`;
  };

  const formatMinutes = (minutes: number): string => {
    return `${minutes} min`;
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
        <p className="text-neutral-500">Error al cargar los datos del dashboard</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-neutral-900">Vista General - Todos los Meses</h1>
        <p className="text-neutral-600">Resumen completo del rendimiento de ventas</p>
      </div>

      {/* KPI Cards - Extended */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-6">
        <KPICard
          title="Dinero Recaudado"
          value={formatCurrency(dashboardData.kpis.cashCollected)}
          icon={DollarSign}
          iconColor="bg-green-500"
          valueColor="text-green-600"
          change={{
            value: "+12.5% vs mes anterior",
            type: "increase"
          }}
        />

        <KPICard
          title="Tasa de Cierre"
          value={`${dashboardData.kpis.closingRate}%`}
          icon={Target}
          iconColor="bg-blue-500"
          valueColor="text-blue-600"
          change={{
            value: "+3.2% vs mes anterior",
            type: "increase"
          }}
        />

        <KPICard
          title="Propuestas Presentadas"
          value={dashboardData.kpis.proposalsPitched}
          icon={ChartGantt}
          iconColor="bg-yellow-500"
          valueColor="text-yellow-600"
          change={{
            value: "-5.7% vs mes anterior",
            type: "decrease"
          }}
        />

        <KPICard
          title="Ciclo de Ventas Promedio"
          value={formatDays(dashboardData.kpis.avgSalesCycle)}
          icon={Clock}
          iconColor="bg-gray-500"
          valueColor="text-neutral-700"
          change={{
            value: "Sin cambios",
            type: "neutral"
          }}
        />

        <KPICard
          title="Total de Llamadas"
          value={dashboardData.kpis.totalCalls}
          icon={Phone}
          iconColor="bg-purple-500"
          valueColor="text-purple-600"
          change={{
            value: "+8.1% vs mes anterior",
            type: "increase"
          }}
        />

        <KPICard
          title="Tamaño Promedio de Deal"
          value={formatCurrency(dashboardData.kpis.avgDealSize)}
          icon={TrendingUp}
          iconColor="bg-indigo-500"
          valueColor="text-indigo-600"
          change={{
            value: "+15.3% vs mes anterior",
            type: "increase"
          }}
        />
      </div>

      {/* Show-Up Rates */}
      <ShowUpRatesComponent showUpRates={dashboardData.showUpRates} />

      {/* Sankey Diagram */}
      <Card>
        <CardHeader>
          <CardTitle>Flujo del Embudo de Ventas</CardTitle>
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
            <CardTitle>Métricas de Tiempo</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center py-3 border-b border-gray-100">
                <span className="text-sm text-neutral-600">Promedio de Primer Descubrimiento a Primer Cierre</span>
                <span className="font-semibold text-neutral-900">
                  {formatDays(dashboardData.timeMetrics.discoveryToClosing)}
                </span>
              </div>
              <div className="flex justify-between items-center py-3 border-b border-gray-100">
                <span className="text-sm text-neutral-600">Promedio de Primer Descubrimiento a Cierre Final</span>
                <span className="font-semibold text-neutral-900">
                  {formatDays(dashboardData.timeMetrics.discoveryToFinalClose)}
                </span>
              </div>
              <div className="flex justify-between items-center py-3 border-b border-gray-100">
                <span className="text-sm text-neutral-600">Promedio Entre Llamadas de Descubrimiento</span>
                <span className="font-semibold text-neutral-900">
                  {formatDays(dashboardData.timeMetrics.betweenDiscovery)}
                </span>
              </div>
              <div className="flex justify-between items-center py-3 border-b border-gray-100">
                <span className="text-sm text-neutral-600">Promedio Entre Llamadas de Cierre</span>
                <span className="font-semibold text-neutral-900">
                  {formatDays(dashboardData.timeMetrics.betweenClosing)}
                </span>
              </div>
              <div className="flex justify-between items-center py-3">
                <span className="text-sm text-neutral-600">Duración Promedio del Ciclo de Ventas</span>
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
            <CardTitle>Duración de Llamadas e Ingresos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center py-3 border-b border-gray-100">
                <span className="text-sm text-neutral-600">Duración Promedio de Llamadas de Descubrimiento</span>
                <span className="font-semibold text-neutral-900">
                  {formatMinutes(dashboardData.callMetrics.discoveryDuration)}
                </span>
              </div>
              <div className="flex justify-between items-center py-3 border-b border-gray-100">
                <span className="text-sm text-neutral-600">Duración Promedio de Llamadas de Cierre</span>
                <span className="font-semibold text-neutral-900">
                  {formatMinutes(dashboardData.callMetrics.closingDuration)}
                </span>
              </div>
              <div className="flex justify-between items-center py-3">
                <span className="text-sm text-neutral-600">Ingresos Promedio por Cliente</span>
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