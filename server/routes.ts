import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertClientSchema, updateClientSchema, type DashboardData, type CalendarEvent } from "@shared/schema";
import { calculateKPIs, calculateShowUpRates, calculateFunnelData, calculateTimeMetrics, calculateCallMetrics } from "../client/src/lib/calculations";

export async function registerRoutes(app: Express): Promise<Server> {
  
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
      const { year, month } = req.query;
      let clients;
      
      if (year && month) {
        clients = await storage.getClientsByMonth(parseInt(year as string), parseInt(month as string));
      } else {
        clients = await storage.getAllClients();
      }

      const dashboardData: DashboardData = {
        kpis: calculateKPIs(clients),
        showUpRates: calculateShowUpRates(clients),
        funnelData: calculateFunnelData(clients),
        timeMetrics: calculateTimeMetrics(clients),
        callMetrics: calculateCallMetrics(clients),
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
      };

      res.json(dashboardData);
    } catch (error) {
      res.status(500).json({ error: "Failed to calculate dashboard data for specified month" });
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
            const typeLabel = call.type.includes("discovery") ? "Descubrimiento" : "Cierre";
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
