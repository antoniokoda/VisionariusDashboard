import { type Client, type KPIData, type ShowUpRates, type FunnelData, type TimeMetrics, type CallMetrics } from "@shared/schema";

export function calculateKPIs(clients: Client[], previousMonthClients?: Client[]): KPIData {
  const totalRevenue = clients.reduce((sum, client) => {
    return sum + (client.dealStatus === "Won" ? parseFloat(client.revenue || "0") : 0);
  }, 0);

  const cashCollected = clients.reduce((sum, client) => {
    return sum + parseFloat(client.cashCollected || "0");
  }, 0);

  const totalProposalsPitched = clients.filter(client => client.proposalStatus === "Pitched").length;
  const totalOpportunities = clients.length;
  const wonClients = clients.filter(client => client.dealStatus === "Won").length;
  const closingRate = totalOpportunities > 0 ? (wonClients / totalOpportunities) * 100 : 0;

  const totalCalls = clients.reduce((sum, client) => {
    let callCount = 0;
    if (client.discovery1Date) callCount++;
    if (client.discovery2Date) callCount++;
    if (client.discovery3Date) callCount++;
    if (client.closing1Date) callCount++;
    if (client.closing2Date) callCount++;
    if (client.closing3Date) callCount++;
    return sum + callCount;
  }, 0);

  const avgSalesCycle = calculateAverageSalesCycle(clients);

  const wonClientsWithRevenue = clients.filter(client => client.dealStatus === "Won" && parseFloat(client.revenue || "0") > 0);
  const avgDealSize = wonClientsWithRevenue.length > 0 
    ? wonClientsWithRevenue.reduce((sum, client) => sum + parseFloat(client.revenue || "0"), 0) / wonClientsWithRevenue.length
    : 0;

  // Calculate month-over-month changes if previous month data is provided
  let totalRevenueChange, cashCollectedChange, closingRateChange, proposalsPitchedChange, avgSalesCycleChange, totalCallsChange, avgDealSizeChange;
  
  if (previousMonthClients) {
    const prevKPIs = calculateKPIsForPeriod(previousMonthClients);
    
    totalRevenueChange = prevKPIs.totalRevenue > 0 
      ? ((totalRevenue - prevKPIs.totalRevenue) / prevKPIs.totalRevenue) * 100 
      : 0;
    
    cashCollectedChange = prevKPIs.cashCollected > 0 
      ? ((cashCollected - prevKPIs.cashCollected) / prevKPIs.cashCollected) * 100 
      : 0;
    
    closingRateChange = prevKPIs.closingRate > 0 
      ? ((closingRate - prevKPIs.closingRate) / prevKPIs.closingRate) * 100 
      : 0;
    
    proposalsPitchedChange = prevKPIs.proposalsPitched > 0 
      ? ((totalProposalsPitched - prevKPIs.proposalsPitched) / prevKPIs.proposalsPitched) * 100 
      : 0;
    
    avgSalesCycleChange = prevKPIs.avgSalesCycle > 0 
      ? ((avgSalesCycle - prevKPIs.avgSalesCycle) / prevKPIs.avgSalesCycle) * 100 
      : 0;
    
    totalCallsChange = prevKPIs.totalCalls > 0 
      ? ((totalCalls - prevKPIs.totalCalls) / prevKPIs.totalCalls) * 100 
      : 0;
    
    avgDealSizeChange = prevKPIs.avgDealSize > 0 
      ? ((avgDealSize - prevKPIs.avgDealSize) / prevKPIs.avgDealSize) * 100 
      : 0;
  }

  return {
    totalRevenue,
    totalRevenueChange,
    cashCollected,
    cashCollectedChange,
    closingRate: Math.round(closingRate * 10) / 10,
    closingRateChange,
    proposalsPitched: totalProposalsPitched,
    proposalsPitchedChange,
    avgSalesCycle,
    avgSalesCycleChange,
    totalCalls,
    totalCallsChange,
    avgDealSize: Math.round(avgDealSize),
    avgDealSizeChange,
  };
}

function calculateKPIsForPeriod(clients: Client[]): KPIData {
  const totalRevenue = clients.reduce((sum, client) => {
    return sum + (client.dealStatus === "Won" ? parseFloat(client.revenue || "0") : 0);
  }, 0);

  const cashCollected = clients.reduce((sum, client) => {
    return sum + parseFloat(client.cashCollected || "0");
  }, 0);

  const totalProposalsPitched = clients.filter(client => client.proposalStatus === "Pitched").length;
  const totalOpportunities = clients.length;
  const wonClients = clients.filter(client => client.dealStatus === "Won").length;
  const closingRate = totalOpportunities > 0 ? (wonClients / totalOpportunities) * 100 : 0;

  const totalCalls = clients.reduce((sum, client) => {
    let callCount = 0;
    if (client.discovery1Date) callCount++;
    if (client.discovery2Date) callCount++;
    if (client.discovery3Date) callCount++;
    if (client.closing1Date) callCount++;
    if (client.closing2Date) callCount++;
    if (client.closing3Date) callCount++;
    return sum + callCount;
  }, 0);

  const avgSalesCycle = calculateAverageSalesCycle(clients);

  const wonClientsWithRevenue = clients.filter(client => client.dealStatus === "Won" && parseFloat(client.revenue || "0") > 0);
  const avgDealSize = wonClientsWithRevenue.length > 0 
    ? wonClientsWithRevenue.reduce((sum, client) => sum + parseFloat(client.revenue || "0"), 0) / wonClientsWithRevenue.length
    : 0;

  return {
    totalRevenue,
    cashCollected,
    closingRate: Math.round(closingRate * 10) / 10,
    proposalsPitched: totalProposalsPitched,
    avgSalesCycle,
    totalCalls,
    avgDealSize: Math.round(avgDealSize),
  };
}

export function calculateShowUpRates(clients: Client[]): ShowUpRates {
  const calculateRate = (scheduled: number, completed: number): number => {
    return scheduled > 0 ? Math.round((completed / scheduled) * 100) : 0;
  };

  const firstDiscoveryScheduled = clients.filter(c => c.discovery1Date).length;
  const firstDiscoveryCompleted = clients.filter(c => c.discovery1Date && c.discovery1Duration).length;

  const secondDiscoveryScheduled = clients.filter(c => c.discovery2Date).length;
  const secondDiscoveryCompleted = clients.filter(c => c.discovery2Date && c.discovery2Duration).length;

  const thirdDiscoveryScheduled = clients.filter(c => c.discovery3Date).length;
  const thirdDiscoveryCompleted = clients.filter(c => c.discovery3Date && c.discovery3Duration).length;

  const firstClosingScheduled = clients.filter(c => c.closing1Date).length;
  const firstClosingCompleted = clients.filter(c => c.closing1Date && c.closing1Duration).length;

  const secondClosingScheduled = clients.filter(c => c.closing2Date).length;
  const secondClosingCompleted = clients.filter(c => c.closing2Date && c.closing2Duration).length;

  const thirdClosingScheduled = clients.filter(c => c.closing3Date).length;
  const thirdClosingCompleted = clients.filter(c => c.closing3Date && c.closing3Duration).length;

  const totalScheduled = firstDiscoveryScheduled + secondDiscoveryScheduled + thirdDiscoveryScheduled + 
                        firstClosingScheduled + secondClosingScheduled + thirdClosingScheduled;
  const totalCompleted = firstDiscoveryCompleted + secondDiscoveryCompleted + thirdDiscoveryCompleted +
                        firstClosingCompleted + secondClosingCompleted + thirdClosingCompleted;

  return {
    firstDiscovery: calculateRate(firstDiscoveryScheduled, firstDiscoveryCompleted),
    secondDiscovery: calculateRate(secondDiscoveryScheduled, secondDiscoveryCompleted),
    thirdDiscovery: calculateRate(thirdDiscoveryScheduled, thirdDiscoveryCompleted),
    firstClosing: calculateRate(firstClosingScheduled, firstClosingCompleted),
    secondClosing: calculateRate(secondClosingScheduled, secondClosingCompleted),
    thirdClosing: calculateRate(thirdClosingScheduled, thirdClosingCompleted),
    overall: calculateRate(totalScheduled, totalCompleted),
  };
}

export function calculateFunnelData(clients: Client[]): FunnelData {
  const nodes = [
    { id: "first_discovery", name: "First Discovery", value: 0 },
    { id: "second_discovery", name: "Second Discovery", value: 0 },
    { id: "third_discovery", name: "Third Discovery", value: 0 },
    { id: "first_closing", name: "First Closing", value: 0 },
    { id: "second_closing", name: "Second Closing", value: 0 },
    { id: "third_closing", name: "Third Closing", value: 0 },
    { id: "won", name: "Won", value: 0 },
    { id: "lost", name: "Lost", value: 0 },
  ];

  const links = [];

  // Count nodes
  clients.forEach(client => {
    if (client.discovery1Date) nodes[0].value++;
    if (client.discovery2Date) nodes[1].value++;
    if (client.discovery3Date) nodes[2].value++;
    if (client.closing1Date) nodes[3].value++;
    if (client.closing2Date) nodes[4].value++;
    if (client.closing3Date) nodes[5].value++;
    if (client.isWon) nodes[6].value++;
    if (client.isLost) nodes[7].value++;
  });

  // Calculate flows
  const firstToSecondDiscovery = clients.filter(c => c.discovery1Date && c.discovery2Date).length;
  const firstDiscoveryToFirstClosing = clients.filter(c => c.discovery1Date && !c.discovery2Date && c.closing1Date).length;
  const firstDiscoveryToLost = clients.filter(c => c.discovery1Date && !c.discovery2Date && !c.closing1Date && c.isLost).length;

  const secondToThirdDiscovery = clients.filter(c => c.discovery2Date && c.discovery3Date).length;
  const secondDiscoveryToFirstClosing = clients.filter(c => c.discovery2Date && !c.discovery3Date && c.closing1Date).length;
  const secondDiscoveryToLost = clients.filter(c => c.discovery2Date && !c.discovery3Date && !c.closing1Date && c.isLost).length;

  const thirdDiscoveryToFirstClosing = clients.filter(c => c.discovery3Date && c.closing1Date).length;
  const firstToSecondClosing = clients.filter(c => c.closing1Date && c.closing2Date).length;
  const secondToThirdClosing = clients.filter(c => c.closing2Date && c.closing3Date).length;

  const closingToWon = clients.filter(c => (c.closing1Date || c.closing2Date || c.closing3Date) && c.isWon).length;
  const closingToLost = clients.filter(c => (c.closing1Date || c.closing2Date || c.closing3Date) && c.isLost).length;

  if (firstToSecondDiscovery > 0) links.push({ source: "first_discovery", target: "second_discovery", value: firstToSecondDiscovery });
  if (firstDiscoveryToFirstClosing > 0) links.push({ source: "first_discovery", target: "first_closing", value: firstDiscoveryToFirstClosing });
  if (firstDiscoveryToLost > 0) links.push({ source: "first_discovery", target: "lost", value: firstDiscoveryToLost });

  if (secondToThirdDiscovery > 0) links.push({ source: "second_discovery", target: "third_discovery", value: secondToThirdDiscovery });
  if (secondDiscoveryToFirstClosing > 0) links.push({ source: "second_discovery", target: "first_closing", value: secondDiscoveryToFirstClosing });
  if (secondDiscoveryToLost > 0) links.push({ source: "second_discovery", target: "lost", value: secondDiscoveryToLost });

  if (thirdDiscoveryToFirstClosing > 0) links.push({ source: "third_discovery", target: "first_closing", value: thirdDiscoveryToFirstClosing });
  if (firstToSecondClosing > 0) links.push({ source: "first_closing", target: "second_closing", value: firstToSecondClosing });
  if (secondToThirdClosing > 0) links.push({ source: "second_closing", target: "third_closing", value: secondToThirdClosing });

  if (closingToWon > 0) links.push({ source: "third_closing", target: "won", value: closingToWon });
  if (closingToLost > 0) links.push({ source: "first_closing", target: "lost", value: closingToLost });

  return { nodes, links };
}

export function calculateTimeMetrics(clients: Client[]): TimeMetrics {
  const calculateDaysBetween = (date1: string | null, date2: string | null): number | null => {
    if (!date1 || !date2) return null;
    const d1 = new Date(date1);
    const d2 = new Date(date2);
    return Math.abs((d2.getTime() - d1.getTime()) / (1000 * 60 * 60 * 24));
  };

  const discoveryToClosingTimes = clients
    .map(c => calculateDaysBetween(c.discovery1Date, c.closing1Date))
    .filter((time): time is number => time !== null);

  const discoveryToFinalCloseTimes = clients
    .map(c => {
      const finalDate = c.closing3Date || c.closing2Date || c.closing1Date;
      return calculateDaysBetween(c.discovery1Date, finalDate);
    })
    .filter((time): time is number => time !== null);

  const betweenDiscoveryTimes = clients
    .map(c => calculateDaysBetween(c.discovery1Date, c.discovery2Date))
    .filter((time): time is number => time !== null);

  const betweenClosingTimes = clients
    .map(c => calculateDaysBetween(c.closing1Date, c.closing2Date))
    .filter((time): time is number => time !== null);

  const average = (times: number[]): number => {
    return times.length > 0 ? Math.round((times.reduce((sum, time) => sum + time, 0) / times.length) * 10) / 10 : 0;
  };

  return {
    discoveryToClosing: average(discoveryToClosingTimes),
    discoveryToFinalClose: average(discoveryToFinalCloseTimes),
    betweenDiscovery: average(betweenDiscoveryTimes),
    betweenClosing: average(betweenClosingTimes),
    salesCycle: average(discoveryToFinalCloseTimes),
  };
}

export function calculateCallMetrics(clients: Client[]): CallMetrics {
  const discoveryDurations = clients
    .flatMap(c => [c.discovery1Duration, c.discovery2Duration, c.discovery3Duration])
    .filter((duration): duration is number => duration !== null);

  const closingDurations = clients
    .flatMap(c => [c.closing1Duration, c.closing2Duration, c.closing3Duration])
    .filter((duration): duration is number => duration !== null);

  const revenues = clients
    .filter(c => c.isWon)
    .map(c => parseFloat(c.revenue || "0"));

  const average = (values: number[]): number => {
    return values.length > 0 ? Math.round((values.reduce((sum, val) => sum + val, 0) / values.length) * 10) / 10 : 0;
  };

  return {
    discoveryDuration: average(discoveryDurations),
    closingDuration: average(closingDurations),
    avgRevenue: average(revenues),
  };
}

function calculateAverageSalesCycle(clients: Client[]): number {
  const completedCycles = clients
    .filter(c => c.discovery1Date && (c.isWon || c.isLost))
    .map(c => {
      const startDate = new Date(c.discovery1Date!);
      const endDate = c.closing3Date ? new Date(c.closing3Date) :
                    c.closing2Date ? new Date(c.closing2Date) :
                    c.closing1Date ? new Date(c.closing1Date) :
                    new Date(c.discovery3Date || c.discovery2Date || c.discovery1Date!);
      
      return Math.abs((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
    });

  return completedCycles.length > 0 
    ? Math.round((completedCycles.reduce((sum, cycle) => sum + cycle, 0) / completedCycles.length) * 10) / 10
    : 0;
}
