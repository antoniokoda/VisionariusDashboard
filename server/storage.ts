import { clients, type Client, type InsertClient, type UpdateClient, type User, type InsertUser } from "@shared/schema";

export interface IStorage {
  // User methods
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
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
        name: "TechCorp Solutions",
        email: "contact@techcorp.com",
        phone: "+1 (555) 123-4567",
        discovery1Date: "2024-03-05",
        discovery1Duration: 45,
        discovery1Recording: "https://zoom.us/rec/123",
        discovery2Date: "2024-03-12",
        discovery2Duration: 38,
        discovery2Recording: "https://zoom.us/rec/456",
        closing1Date: "2024-03-20",
        closing1Duration: 55,
        closing1Recording: "https://zoom.us/rec/789",
        proposalStatus: "Pitched",
        revenue: "32500",
        isWon: true,
        files: JSON.stringify(["proposal_techcorp.pdf", "contract_signed.pdf"]),
        conversation: JSON.stringify([]),
      },
      {
        name: "Global Industries Inc",
        email: "info@globalindustries.com",
        phone: "+1 (555) 987-6543",
        discovery1Date: "2024-03-08",
        discovery1Duration: 42,
        proposalStatus: "Created",
        revenue: "0",
        files: JSON.stringify([]),
      },
      {
        name: "StartupX Ventures", 
        email: "team@startupx.io",
        phone: "+1 (555) 456-7890",
        discovery1Date: "2024-03-15",
        discovery1Duration: 50,
        discovery2Date: "2024-03-22",
        discovery2Duration: 45,
        discovery3Date: "2024-03-29",
        discovery3Duration: 40,
        closing1Date: "2024-04-05",
        closing1Duration: 60,
        closing2Date: "2024-04-12",
        closing2Duration: 55,
        closing3Date: "2024-04-19",
        closing3Duration: 50,
        proposalStatus: "Pitched",
        revenue: "45000",
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
      email: insertClient.email || null,
      phone: insertClient.phone || null,
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
      isWon: insertClient.isWon || false,
      isLost: insertClient.isLost || false,
      files: insertClient.files || "[]",
      notes: insertClient.notes || null,
      conversation: insertClient.conversation || "[]",
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
