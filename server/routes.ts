import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertClientSchema, updateClientSchema, type DashboardData } from "@shared/schema";
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

  const httpServer = createServer(app);
  return httpServer;
}
