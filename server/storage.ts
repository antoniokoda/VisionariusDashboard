import { clients, users, type Client, type InsertClient, type UpdateClient, type User, type UpsertUser } from "@shared/schema";
import { db } from "./db";
import { eq } from "drizzle-orm";

export interface IStorage {
  // User methods (Replit Auth)
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  
  // Client methods
  getAllClients(): Promise<Client[]>;
  getClient(id: number): Promise<Client | undefined>;
  getClientsByMonth(year: number, month: number): Promise<Client[]>;
  createClient(client: InsertClient): Promise<Client>;
  updateClient(id: number, client: UpdateClient): Promise<Client | undefined>;
  deleteClient(id: number): Promise<boolean>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private clients: Map<number, Client>;
  private currentUserId: number;
  private currentClientId: number;

  constructor() {
    this.users = new Map();
    this.clients = new Map();
    this.currentUserId = 1;
    this.currentClientId = 1;
    
    // Initialize with some sample data for development
    this.initializeSampleData();
  }

  private initializeSampleData() {
    // Add a few sample clients to demonstrate the system
    const sampleClients: InsertClient[] = [
      {
        name: "TechCorp Enterprise Solution",
        contacts: JSON.stringify([
          { id: "1", name: "John Smith", email: "john.smith@techcorp.com", phone: "+1 (555) 123-4567", role: "CTO" },
          { id: "2", name: "Sarah Johnson", email: "sarah.johnson@techcorp.com", phone: "+1 (555) 123-4568", role: "VP Engineering" }
        ]),
        discovery1Date: "2025-06-05",
        discovery1Duration: 45,
        discovery1Recording: "https://zoom.us/rec/123",
        discovery2Date: "2025-06-12",
        discovery2Duration: 38,
        discovery2Recording: "https://zoom.us/rec/456",
        closing1Date: "2025-06-20",
        closing1Duration: 55,
        closing1Recording: "https://zoom.us/rec/789",
        proposalStatus: "Pitched",
        revenue: "32500",
        cashCollected: "25000",
        dealStatus: "Won",
        isWon: true,
        files: JSON.stringify(["proposal_techcorp.pdf", "contract_signed.pdf"]),
        conversation: JSON.stringify([]),
      },
      {
        name: "Global Industries Digital Transformation",
        contacts: JSON.stringify([
          { id: "3", name: "Michael Chen", email: "m.chen@globalindustries.com", phone: "+1 (555) 987-6543", role: "CEO" }
        ]),
        discovery1Date: "2025-06-08",
        discovery1Duration: 42,
        proposalStatus: "Created",
        revenue: "45000",
        cashCollected: "0",
        dealStatus: "Open",
        files: JSON.stringify([]),
      },
      {
        name: "StartupX Growth Initiative", 
        contacts: JSON.stringify([
          { id: "4", name: "Emily Rodriguez", email: "emily@startupx.io", phone: "+1 (555) 456-7890", role: "Founder" },
          { id: "5", name: "David Kim", email: "david@startupx.io", phone: "+1 (555) 456-7891", role: "CTO" }
        ]),
        discovery1Date: "2025-06-15",
        discovery1Duration: 50,
        discovery2Date: "2025-06-22",
        discovery2Duration: 45,
        discovery3Date: "2025-06-29",
        discovery3Duration: 40,
        closing1Date: "2025-07-05",
        closing1Duration: 60,
        closing2Date: "2025-07-12",
        closing2Duration: 55,
        closing3Date: "2025-07-19",
        closing3Duration: 50,
        proposalStatus: "Pitched",
        revenue: "45000",
        cashCollected: "45000",
        dealStatus: "Won",
        isWon: true,
        files: JSON.stringify(["proposal_startupx.pdf"]),
      },
    ];

    sampleClients.forEach(client => {
      this.createClient(client);
    });
  }

  // User methods
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentUserId++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  // Client methods
  async getAllClients(): Promise<Client[]> {
    return Array.from(this.clients.values());
  }

  async getClient(id: number): Promise<Client | undefined> {
    return this.clients.get(id);
  }

  async getClientsByMonth(year: number, month: number): Promise<Client[]> {
    const allClients = Array.from(this.clients.values());
    return allClients.filter(client => {
      if (!client.createdAt) return false;
      const clientDate = new Date(client.createdAt);
      return clientDate.getFullYear() === year && clientDate.getMonth() + 1 === month;
    });
  }

  async createClient(insertClient: InsertClient): Promise<Client> {
    const id = this.currentClientId++;
    const client: Client = {
      id,
      name: insertClient.name || "",
      contacts: insertClient.contacts || null,
      discovery1Date: insertClient.discovery1Date || null,
      discovery1Duration: insertClient.discovery1Duration || null,
      discovery1Recording: insertClient.discovery1Recording || null,
      discovery2Date: insertClient.discovery2Date || null,
      discovery2Duration: insertClient.discovery2Duration || null,
      discovery2Recording: insertClient.discovery2Recording || null,
      discovery3Date: insertClient.discovery3Date || null,
      discovery3Duration: insertClient.discovery3Duration || null,
      discovery3Recording: insertClient.discovery3Recording || null,
      closing1Date: insertClient.closing1Date || null,
      closing1Duration: insertClient.closing1Duration || null,
      closing1Recording: insertClient.closing1Recording || null,
      closing2Date: insertClient.closing2Date || null,
      closing2Duration: insertClient.closing2Duration || null,
      closing2Recording: insertClient.closing2Recording || null,
      closing3Date: insertClient.closing3Date || null,
      closing3Duration: insertClient.closing3Duration || null,
      closing3Recording: insertClient.closing3Recording || null,
      proposalStatus: insertClient.proposalStatus || "N/A",
      revenue: insertClient.revenue || "0",
      cashCollected: insertClient.cashCollected || "0",
      dealStatus: insertClient.dealStatus || "Open",
      isWon: insertClient.isWon || false,
      isLost: insertClient.isLost || false,
      files: insertClient.files || "[]",
      notes: insertClient.notes || null,
      conversation: insertClient.conversation || "[]",
      leadSource: insertClient.leadSource || "Referrals",
      salesperson: insertClient.salesperson || "Unknown",
      createdAt: new Date().toISOString().split('T')[0],
    };
    this.clients.set(id, client);
    return client;
  }

  async updateClient(id: number, updateClient: UpdateClient): Promise<Client | undefined> {
    const existingClient = this.clients.get(id);
    if (!existingClient) return undefined;

    const updatedClient: Client = {
      ...existingClient,
      ...updateClient,
    };
    
    this.clients.set(id, updatedClient);
    return updatedClient;
  }

  async deleteClient(id: number): Promise<boolean> {
    return this.clients.delete(id);
  }
}

export const storage = new MemStorage();
