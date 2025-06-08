import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertClientSchema, updateClientSchema, type DashboardData, type CalendarEvent, type Client } from "@shared/schema";
import { calculateKPIs, calculateShowUpRates, calculateFunnelData, calculateTimeMetrics, calculateCallMetrics, calculateTrendData, calculateLeadSources, calculateSalespersonPerformance } from "../client/src/lib/calculations";

export async function registerRoutes(app: Express): Promise<Server> {
  
  // Authentication routes
  app.get('/api/auth/user', async (req, res) => {
    // For now, return a mock user - in production this would check session/JWT
    const user = {
      id: 1,
      username: 'admin',
      email: 'admin@visionarius.com',
      firstName: 'Admin',
      lastName: 'User'
    };
    res.json(user);
  });

  // Get available months with data
  app.get("/api/available-months", async (req, res) => {
    try {
      const clients = await storage.getAllClients();
      const monthsSet = new Set<string>();
      
      clients.forEach(client => {
        if (client.createdAt) {
          const date = new Date(client.createdAt);
          const year = date.getFullYear();
          const month = String(date.getMonth() + 1).padStart(2, '0');
          monthsSet.add(`${year}-${month}`);
        }
      });
      
      const months = Array.from(monthsSet).sort();
      res.json(months);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch available months" });
    }
  });

  // Get all clients
  app.get("/api/clients", async (req, res) => {
    try {
      const clients = await storage.getAllClients();
      res.json(clients);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch clients" });
    }
  });

  // Get clients by month
  app.get("/api/clients/month/:year/:month", async (req, res) => {
    try {
      const year = parseInt(req.params.year);
      const month = parseInt(req.params.month);
      const clients = await storage.getClientsByMonth(year, month);
      res.json(clients);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch clients for specified month" });
    }
  });

  // Create new client
  app.post("/api/clients", async (req, res) => {
    try {
      const validatedData = insertClientSchema.parse(req.body);
      const client = await storage.createClient(validatedData);
      res.status(201).json(client);
    } catch (error) {
      res.status(400).json({ error: "Invalid client data" });
    }
  });

  // Update client
  app.patch("/api/clients/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const validatedData = updateClientSchema.parse(req.body);
      const client = await storage.updateClient(id, validatedData);
      
      if (!client) {
        return res.status(404).json({ error: "Client not found" });
      }
      
      res.json(client);
    } catch (error) {
      res.status(400).json({ error: "Invalid client data" });
    }
  });

  // Delete client
  app.delete("/api/clients/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const deleted = await storage.deleteClient(id);
      
      if (!deleted) {
        return res.status(404).json({ error: "Client not found" });
      }
      
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: "Failed to delete client" });
    }
  });

  // Get dashboard data
  app.get("/api/dashboard", async (req, res) => {
    try {
      const period = req.query.period as string;
      let clients: Client[];
      let previousMonthClients: Client[] | undefined;

      if (period && period !== "all") {
        // Parse period (e.g., "2024-03" -> year: 2024, month: 3)
        const [yearStr, monthStr] = period.split("-");
        const year = parseInt(yearStr);
        const month = parseInt(monthStr);
        
        if (!isNaN(year) && !isNaN(month)) {
          clients = await storage.getClientsByMonth(year, month);
          
          // Get previous month data for comparison
          const prevMonth = month === 1 ? 12 : month - 1;
          const prevYear = month === 1 ? year - 1 : year;
          previousMonthClients = await storage.getClientsByMonth(prevYear, prevMonth);
        } else {
          clients = await storage.getAllClients();
        }
      } else {
        // "all" or no period specified - get all clients
        clients = await storage.getAllClients();
        
        // For "all" period, get previous month data for comparison
        const now = new Date();
        const currentMonth = now.getMonth() + 1;
        const currentYear = now.getFullYear();
        const prevMonth = currentMonth === 1 ? 12 : currentMonth - 1;
        const prevYear = currentMonth === 1 ? currentYear - 1 : currentYear;
        
        const currentMonthClients = await storage.getClientsByMonth(currentYear, currentMonth);
        previousMonthClients = await storage.getClientsByMonth(prevYear, prevMonth);
        
        // Use current month clients for main calculation when showing "all"
        if (currentMonthClients.length > 0) {
          clients = currentMonthClients;
        }
      }

      const dashboardData: DashboardData = {
        kpis: calculateKPIs(clients, previousMonthClients),
        showUpRates: calculateShowUpRates(clients),
        funnelData: calculateFunnelData(clients),
        timeMetrics: calculateTimeMetrics(clients),
        callMetrics: calculateCallMetrics(clients),
        trendData: calculateTrendData(clients),
        leadSources: calculateLeadSources(clients),
        salespeople: calculateSalespersonPerformance(clients),
      };

      res.json(dashboardData);
    } catch (error) {
      res.status(500).json({ error: "Failed to calculate dashboard data" });
    }
  });

  // Get dashboard data for specific month
  app.get("/api/dashboard/:year/:month", async (req, res) => {
    try {
      const year = parseInt(req.params.year);
      const month = parseInt(req.params.month);
      const clients = await storage.getClientsByMonth(year, month);

      const dashboardData: DashboardData = {
        kpis: calculateKPIs(clients),
        showUpRates: calculateShowUpRates(clients),
        funnelData: calculateFunnelData(clients),
        timeMetrics: calculateTimeMetrics(clients),
        callMetrics: calculateCallMetrics(clients),
        trendData: calculateTrendData(clients),
        leadSources: calculateLeadSources(clients),
        salespeople: calculateSalespersonPerformance(clients),
      };

      res.json(dashboardData);
    } catch (error) {
      res.status(500).json({ error: "Failed to calculate dashboard data for specified month" });
    }
  });

  // Get dashboard data filtered by lead source
  app.get("/api/dashboard/source/:source", async (req, res) => {
    try {
      const leadSource = decodeURIComponent(req.params.source);
      const period = req.query.period as string;
      
      let clients: Client[];
      if (period && period !== "all") {
        const [yearStr, monthStr] = period.split("-");
        const year = parseInt(yearStr);
        const month = parseInt(monthStr);
        clients = await storage.getClientsByMonth(year, month);
      } else {
        clients = await storage.getAllClients();
      }
      
      // Filter by lead source
      const filteredClients = clients.filter(client => client.leadSource === leadSource);

      const dashboardData: DashboardData = {
        kpis: calculateKPIs(filteredClients),
        showUpRates: calculateShowUpRates(filteredClients),
        funnelData: calculateFunnelData(filteredClients),
        timeMetrics: calculateTimeMetrics(filteredClients),
        callMetrics: calculateCallMetrics(filteredClients),
        trendData: calculateTrendData(filteredClients),
        leadSources: calculateLeadSources(filteredClients),
        salespeople: calculateSalespersonPerformance(filteredClients),
      };

      res.json(dashboardData);
    } catch (error) {
      res.status(500).json({ error: "Failed to calculate dashboard data for lead source" });
    }
  });

  // Get dashboard data filtered by salesperson
  app.get("/api/dashboard/salesperson/:name", async (req, res) => {
    try {
      const salesperson = decodeURIComponent(req.params.name);
      const period = req.query.period as string;
      
      let clients: Client[];
      if (period && period !== "all") {
        const [yearStr, monthStr] = period.split("-");
        const year = parseInt(yearStr);
        const month = parseInt(monthStr);
        clients = await storage.getClientsByMonth(year, month);
      } else {
        clients = await storage.getAllClients();
      }
      
      // Filter by salesperson
      const filteredClients = clients.filter(client => client.salesperson === salesperson);

      const dashboardData: DashboardData = {
        kpis: calculateKPIs(filteredClients),
        showUpRates: calculateShowUpRates(filteredClients),
        funnelData: calculateFunnelData(filteredClients),
        timeMetrics: calculateTimeMetrics(filteredClients),
        callMetrics: calculateCallMetrics(filteredClients),
        trendData: calculateTrendData(filteredClients),
        leadSources: calculateLeadSources(filteredClients),
        salespeople: calculateSalespersonPerformance(filteredClients),
      };

      res.json(dashboardData);
    } catch (error) {
      res.status(500).json({ error: "Failed to calculate dashboard data for salesperson" });
    }
  });

  // Get calendar events
  app.get("/api/calendar", async (req, res) => {
    try {
      const clients = await storage.getAllClients();
      const events: CalendarEvent[] = [];

      clients.forEach(client => {
        const callTypes = [
          { date: client.discovery1Date, type: "discovery1", duration: client.discovery1Duration, recording: client.discovery1Recording },
          { date: client.discovery2Date, type: "discovery2", duration: client.discovery2Duration, recording: client.discovery2Recording },
          { date: client.discovery3Date, type: "discovery3", duration: client.discovery3Duration, recording: client.discovery3Recording },
          { date: client.closing1Date, type: "closing1", duration: client.closing1Duration, recording: client.closing1Recording },
          { date: client.closing2Date, type: "closing2", duration: client.closing2Duration, recording: client.closing2Recording },
          { date: client.closing3Date, type: "closing3", duration: client.closing3Duration, recording: client.closing3Recording },
        ];

        callTypes.forEach(call => {
          if (call.date) {
            const typeLabel = call.type.includes("discovery") ? "Discovery" : "Closing";
            const callNumber = call.type.slice(-1);
            events.push({
              id: `${client.id}-${call.type}`,
              title: `${client.name} - ${typeLabel} ${callNumber}`,
              clientId: client.id,
              clientName: client.name,
              date: call.date,
              type: call.type as "discovery1" | "discovery2" | "discovery3" | "closing1" | "closing2" | "closing3",
              duration: call.duration || undefined,
              recording: call.recording || undefined,
            });
          }
        });
      });

      res.json(events);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch calendar events" });
    }
  });

  // Get client conversation
  app.get("/api/clients/:id/conversation", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const client = await storage.getClient(id);
      
      if (!client) {
        return res.status(404).json({ error: "Client not found" });
      }

      const conversation = JSON.parse(client.conversation || "[]");
      res.json(conversation);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch conversation" });
    }
  });

  // Add message to client conversation
  app.post("/api/clients/:id/conversation", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const { message, userId, userName, type = "text", fileUrl } = req.body;
      
      const client = await storage.getClient(id);
      if (!client) {
        return res.status(404).json({ error: "Client not found" });
      }

      const conversation = JSON.parse(client.conversation || "[]");
      const newMessage = {
        id: Date.now().toString(),
        userId,
        userName,
        message,
        type,
        timestamp: new Date().toISOString(),
        fileUrl,
      };

      conversation.push(newMessage);
      
      await storage.updateClient(id, { conversation: JSON.stringify(conversation) });
      res.json(newMessage);
    } catch (error) {
      res.status(500).json({ error: "Failed to add message" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
