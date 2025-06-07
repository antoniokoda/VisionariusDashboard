import { useState, useEffect, useRef } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { FileUploadModal } from "./file-upload-modal";
import { ClientConversation } from "./client-conversation";
import { DatePicker } from "./ui/date-picker";
import { Plus, Trash2, ExternalLink, Folder, Check, MessageCircle } from "lucide-react";
import { type Client, type InsertClient, type UpdateClient } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";

interface ClientTableProps {
  clients: Client[];
}

export function ClientTable({ clients }: ClientTableProps) {
  const [localClients, setLocalClients] = useState<Client[]>(clients);
  const [fileModalOpen, setFileModalOpen] = useState(false);
  const [conversationOpen, setConversationOpen] = useState(false);
  const [selectedClientId, setSelectedClientId] = useState<number | null>(null);
  const [saveFeedback, setSaveFeedback] = useState<{ [key: number]: boolean }>({});
  const [highlightedClientId, setHighlightedClientId] = useState<number | null>(null);
  const tableRef = useRef<HTMLTableElement>(null);
  const queryClient = useQueryClient();

  useEffect(() => {
    setLocalClients(clients);
  }, [clients]);

  // Check for highlighted client from calendar navigation
  useEffect(() => {
    const highlightId = sessionStorage.getItem('highlightClientId');
    if (highlightId && clients.length > 0) {
      const clientId = parseInt(highlightId);
      setHighlightedClientId(clientId);
      
      // Scroll to the highlighted client row after a short delay
      setTimeout(() => {
        const row = document.querySelector(`[data-client-id="${clientId}"]`);
        if (row) {
          row.scrollIntoView({ behavior: 'smooth', block: 'center' });
          // Remove highlight after 3 seconds
          setTimeout(() => {
            setHighlightedClientId(null);
            sessionStorage.removeItem('highlightClientId');
          }, 3000);
        }
      }, 100);
    }
  }, [clients]);

  const createClientMutation = useMutation({
    mutationFn: async (client: InsertClient) => {
      const response = await apiRequest("POST", "/api/clients", client);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/clients"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard"] });
      queryClient.invalidateQueries({ queryKey: ["/api/calendar"] });
    },
  });

  const updateClientMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: UpdateClient }) => {
      const response = await apiRequest("PATCH", `/api/clients/${id}`, data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/clients"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard"] });
      queryClient.invalidateQueries({ queryKey: ["/api/calendar"] });
    },
  });

  const deleteClientMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/clients/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/clients"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard"] });
      queryClient.invalidateQueries({ queryKey: ["/api/calendar"] });
    },
  });

  const handleAddClient = () => {
    const newClient: InsertClient = {
      name: "",
      proposalStatus: "N/A",
      revenue: "0",
      files: "[]",
    };

    createClientMutation.mutate(newClient);
  };

  const handleUpdateClient = (id: number, field: keyof UpdateClient, value: any) => {
    // Update local state immediately for responsive UI
    setLocalClients(prev => 
      prev.map(client => 
        client.id === id ? { ...client, [field]: value } : client
      )
    );

    // Debounced update to server
    setTimeout(() => {
      updateClientMutation.mutate({ id, data: { [field]: value } });
      showSaveFeedback(id);
    }, 500);
  };

  const showSaveFeedback = (clientId: number) => {
    setSaveFeedback(prev => ({ ...prev, [clientId]: true }));
    setTimeout(() => {
      setSaveFeedback(prev => ({ ...prev, [clientId]: false }));
    }, 2000);
  };

  const handleDeleteClient = (id: number) => {
    if (confirm("Are you sure you want to delete this client?")) {
      deleteClientMutation.mutate(id);
    }
  };

  const handleFilesUpdate = (clientId: number, files: string[]) => {
    handleUpdateClient(clientId, "files", JSON.stringify(files));
  };

  const openFileModal = (clientId: number) => {
    setSelectedClientId(clientId);
    setFileModalOpen(true);
  };

  const openConversation = (clientId: number) => {
    setSelectedClientId(clientId);
    setConversationOpen(true);
  };

  const formatDate = (dateString: string | null): Date | undefined => {
    if (!dateString) return undefined;
    // Parse the date string and create a date in local timezone to avoid off-by-one errors
    const [year, month, day] = dateString.split('-').map(Number);
    return new Date(year, month - 1, day);
  };

  const formatDateString = (date: Date | undefined): string | null => {
    if (!date) return null;
    // Format date ensuring we use local timezone values
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const getFileCount = (filesJson: string | null): number => {
    try {
      const files = JSON.parse(filesJson || "[]");
      return Array.isArray(files) ? files.length : 0;
    } catch {
      return 0;
    }
  };

  const getFiles = (filesJson: string | null): string[] => {
    try {
      const files = JSON.parse(filesJson || "[]");
      return Array.isArray(files) ? files : [];
    } catch {
      return [];
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-neutral-900">Client Data Entry</h2>
        <Button onClick={handleAddClient} className="flex items-center space-x-2">
          <Plus className="h-4 w-4" />
          <span>Add New Client</span>
        </Button>
      </div>

      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="text-left py-4 px-4 font-medium text-neutral-700 text-sm w-40">Client Name</th>
                  <th className="text-left py-4 px-4 font-medium text-neutral-700 text-sm w-36">Email</th>
                  <th className="text-left py-4 px-4 font-medium text-neutral-700 text-sm w-32">Phone</th>
                  <th className="text-left py-4 px-4 font-medium text-neutral-700 text-sm w-32">Discovery 1</th>
                  <th className="text-left py-4 px-4 font-medium text-neutral-700 text-sm w-32">Discovery 2</th>
                  <th className="text-left py-4 px-4 font-medium text-neutral-700 text-sm w-32">Discovery 3</th>
                  <th className="text-left py-4 px-4 font-medium text-neutral-700 text-sm w-32">Closing 1</th>
                  <th className="text-left py-4 px-4 font-medium text-neutral-700 text-sm w-32">Closing 2</th>
                  <th className="text-left py-4 px-4 font-medium text-neutral-700 text-sm w-32">Closing 3</th>
                  <th className="text-left py-4 px-4 font-medium text-neutral-700 text-sm w-24">Proposal</th>
                  <th className="text-left py-4 px-4 font-medium text-neutral-700 text-sm w-32">Revenue</th>
                  <th className="text-left py-4 px-4 font-medium text-neutral-700 text-sm w-20">Files</th>
                  <th className="text-left py-4 px-4 font-medium text-neutral-700 text-sm w-32">Actions</th>
                </tr>
              </thead>
              <tbody>
                {localClients.map((client) => (
                  <tr 
                    key={client.id} 
                    data-client-id={client.id}
                    className={`
                      border-b transition-all duration-500
                      ${highlightedClientId === client.id 
                        ? 'bg-blue-100 border-blue-300 shadow-md' 
                        : 'hover:bg-gray-50'
                      }
                    `}
                  >
                    <td className="py-3 px-4 w-40">
                      <div className="w-full">
                        <textarea
                          value={client.name}
                          onChange={(e) => handleUpdateClient(client.id, "name", e.target.value)}
                          placeholder="Enter client name..."
                          className="w-full min-h-[40px] max-h-[80px] border-none bg-transparent focus:outline-none focus:ring-2 focus:ring-primary/20 resize-none overflow-hidden text-sm"
                          style={{ 
                            height: 'auto',
                            minHeight: '40px'
                          }}
                          onInput={(e) => {
                            const target = e.target as HTMLTextAreaElement;
                            target.style.height = 'auto';
                            target.style.height = Math.min(target.scrollHeight, 80) + 'px';
                          }}
                        />
                        {saveFeedback[client.id] && (
                          <div className="text-xs text-green-600 mt-1 flex items-center">
                            <Check className="h-3 w-3 mr-1" />
                            Saved
                          </div>
                        )}
                      </div>
                    </td>

                    {/* Email */}
                    <td className="py-3 px-4 w-36">
                      <div className="w-full">
                        <Input
                          type="email"
                          value={client.email || ""}
                          onChange={(e) => handleUpdateClient(client.id, "email", e.target.value)}
                          placeholder="client@company.com"
                          className="w-full text-sm h-10 border-none bg-transparent focus:outline-none focus:ring-2 focus:ring-primary/20"
                        />
                      </div>
                    </td>

                    {/* Phone */}
                    <td className="py-3 px-4 w-32">
                      <div className="w-full">
                        <Input
                          type="tel"
                          value={client.phone || ""}
                          onChange={(e) => handleUpdateClient(client.id, "phone", e.target.value)}
                          placeholder="+1 (555) 123-4567"
                          className="w-full text-sm h-10 border-none bg-transparent focus:outline-none focus:ring-2 focus:ring-primary/20"
                        />
                      </div>
                    </td>

                    {/* Discovery 1 */}
                    <td className="py-3 px-4">
                      <div className="space-y-1">
                        <DatePicker
                          date={formatDate(client.discovery1Date)}
                          onDateChange={(date) => handleUpdateClient(client.id, "discovery1Date", formatDateString(date))}
                          placeholder="Select date"
                          className="text-sm h-8"
                        />
                        <Input
                          type="number"
                          value={client.discovery1Duration || ""}
                          onChange={(e) => handleUpdateClient(client.id, "discovery1Duration", parseInt(e.target.value) || null)}
                          placeholder="Duration (min)"
                          className="text-xs h-8"
                        />
                        <div className="flex items-center space-x-1">
                          <Input
                            type="url"
                            value={client.discovery1Recording || ""}
                            onChange={(e) => handleUpdateClient(client.id, "discovery1Recording", e.target.value)}
                            placeholder="Recording URL"
                            className="text-xs h-8"
                          />
                          {client.discovery1Recording && (
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8"
                              onClick={() => window.open(client.discovery1Recording!, "_blank")}
                            >
                              <ExternalLink className="h-3 w-3" />
                            </Button>
                          )}
                        </div>
                      </div>
                    </td>

                    {/* Discovery 2 */}
                    <td className="py-3 px-4">
                      <div className="space-y-1">
                        <DatePicker
                          date={formatDate(client.discovery2Date)}
                          onDateChange={(date) => handleUpdateClient(client.id, "discovery2Date", formatDateString(date))}
                          placeholder="Select date"
                          className="text-sm h-8"
                        />
                        <Input
                          type="number"
                          value={client.discovery2Duration || ""}
                          onChange={(e) => handleUpdateClient(client.id, "discovery2Duration", parseInt(e.target.value) || null)}
                          placeholder="Duration (min)"
                          className="text-xs h-8"
                        />
                        <div className="flex items-center space-x-1">
                          <Input
                            type="url"
                            value={client.discovery2Recording || ""}
                            onChange={(e) => handleUpdateClient(client.id, "discovery2Recording", e.target.value)}
                            placeholder="Recording URL"
                            className="text-xs h-8"
                          />
                          {client.discovery2Recording && (
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8"
                              onClick={() => window.open(client.discovery2Recording!, "_blank")}
                            >
                              <ExternalLink className="h-3 w-3" />
                            </Button>
                          )}
                        </div>
                      </div>
                    </td>

                    {/* Discovery 3 */}
                    <td className="py-3 px-4">
                      <div className="space-y-1">
                        <DatePicker
                          date={formatDate(client.discovery3Date)}
                          onDateChange={(date) => handleUpdateClient(client.id, "discovery3Date", formatDateString(date))}
                          placeholder="Select date"
                          className="text-sm h-8"
                        />
                        <Input
                          type="number"
                          value={client.discovery3Duration || ""}
                          onChange={(e) => handleUpdateClient(client.id, "discovery3Duration", parseInt(e.target.value) || null)}
                          placeholder="Duration (min)"
                          className="text-xs h-8"
                        />
                        <div className="flex items-center space-x-1">
                          <Input
                            type="url"
                            value={client.discovery3Recording || ""}
                            onChange={(e) => handleUpdateClient(client.id, "discovery3Recording", e.target.value)}
                            placeholder="Recording URL"
                            className="text-xs h-8"
                          />
                          {client.discovery3Recording && (
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8"
                              onClick={() => window.open(client.discovery3Recording!, "_blank")}
                            >
                              <ExternalLink className="h-3 w-3" />
                            </Button>
                          )}
                        </div>
                      </div>
                    </td>

                    {/* Closing 1 */}
                    <td className="py-3 px-4">
                      <div className="space-y-1">
                        <DatePicker
                          date={formatDate(client.closing1Date)}
                          onDateChange={(date) => handleUpdateClient(client.id, "closing1Date", formatDateString(date))}
                          placeholder="Select date"
                          className="text-sm h-8"
                        />
                        <Input
                          type="number"
                          value={client.closing1Duration || ""}
                          onChange={(e) => handleUpdateClient(client.id, "closing1Duration", parseInt(e.target.value) || null)}
                          placeholder="Duration (min)"
                          className="text-xs h-8"
                        />
                        <div className="flex items-center space-x-1">
                          <Input
                            type="url"
                            value={client.closing1Recording || ""}
                            onChange={(e) => handleUpdateClient(client.id, "closing1Recording", e.target.value)}
                            placeholder="Recording URL"
                            className="text-xs h-8"
                          />
                          {client.closing1Recording && (
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8"
                              onClick={() => window.open(client.closing1Recording!, "_blank")}
                            >
                              <ExternalLink className="h-3 w-3" />
                            </Button>
                          )}
                        </div>
                      </div>
                    </td>

                    {/* Closing 2 */}
                    <td className="py-3 px-4">
                      <div className="space-y-1">
                        <DatePicker
                          date={formatDate(client.closing2Date)}
                          onDateChange={(date) => handleUpdateClient(client.id, "closing2Date", formatDateString(date))}
                          placeholder="Select date"
                          className="text-sm h-8"
                        />
                        <Input
                          type="number"
                          value={client.closing2Duration || ""}
                          onChange={(e) => handleUpdateClient(client.id, "closing2Duration", parseInt(e.target.value) || null)}
                          placeholder="Duration (min)"
                          className="text-xs h-8"
                        />
                        <div className="flex items-center space-x-1">
                          <Input
                            type="url"
                            value={client.closing2Recording || ""}
                            onChange={(e) => handleUpdateClient(client.id, "closing2Recording", e.target.value)}
                            placeholder="Recording URL"
                            className="text-xs h-8"
                          />
                          {client.closing2Recording && (
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8"
                              onClick={() => window.open(client.closing2Recording!, "_blank")}
                            >
                              <ExternalLink className="h-3 w-3" />
                            </Button>
                          )}
                        </div>
                      </div>
                    </td>

                    {/* Closing 3 */}
                    <td className="py-3 px-4">
                      <div className="space-y-1">
                        <DatePicker
                          date={formatDate(client.closing3Date)}
                          onDateChange={(date) => handleUpdateClient(client.id, "closing3Date", formatDateString(date))}
                          placeholder="Select date"
                          className="text-sm h-8"
                        />
                        <Input
                          type="number"
                          value={client.closing3Duration || ""}
                          onChange={(e) => handleUpdateClient(client.id, "closing3Duration", parseInt(e.target.value) || null)}
                          placeholder="Duration (min)"
                          className="text-xs h-8"
                        />
                        <div className="flex items-center space-x-1">
                          <Input
                            type="url"
                            value={client.closing3Recording || ""}
                            onChange={(e) => handleUpdateClient(client.id, "closing3Recording", e.target.value)}
                            placeholder="Recording URL"
                            className="text-xs h-8"
                          />
                          {client.closing3Recording && (
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8"
                              onClick={() => window.open(client.closing3Recording!, "_blank")}
                            >
                              <ExternalLink className="h-3 w-3" />
                            </Button>
                          )}
                        </div>
                      </div>
                    </td>

                    {/* Proposal Status */}
                    <td className="py-3 px-4">
                      <Select
                        value={client.proposalStatus || "N/A"}
                        onValueChange={(value) => handleUpdateClient(client.id, "proposalStatus", value)}
                      >
                        <SelectTrigger className="text-sm h-8">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="N/A">N/A</SelectItem>
                          <SelectItem value="Created">Creada</SelectItem>
                          <SelectItem value="Pitched">Presentada</SelectItem>
                        </SelectContent>
                      </Select>
                    </td>

                    {/* Revenue */}
                    <td className="py-3 px-4 w-48">
                      <div className="relative w-full">
                        <span className="absolute left-3 top-3 text-gray-500 text-sm">$</span>
                        <Input
                          type="text"
                          value={client.revenue || "0"}
                          onChange={(e) => handleUpdateClient(client.id, "revenue", e.target.value)}
                          placeholder="0"
                          className="w-full pl-8 pr-3 py-2 text-sm h-10 min-w-[150px]"
                        />
                      </div>
                    </td>

                    {/* Files */}
                    <td className="py-3 px-4">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => openFileModal(client.id)}
                        className="flex items-center space-x-1 text-xs h-8"
                      >
                        <Folder className="h-3 w-3" />
                        <span>{getFileCount(client.files)} files</span>
                      </Button>
                    </td>

                    {/* Actions */}
                    <td className="py-3 px-4">
                      <div className="flex items-center space-x-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => openConversation(client.id)}
                          className="text-blue-500 hover:text-blue-700 h-8 w-8"
                          title="Open conversation"
                        >
                          <MessageCircle className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDeleteClient(client.id)}
                          className="text-red-500 hover:text-red-700 h-8 w-8"
                          title="Delete client"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* File Upload Modal */}
      {selectedClientId && (
        <FileUploadModal
          isOpen={fileModalOpen}
          onClose={() => setFileModalOpen(false)}
          clientId={selectedClientId}
          currentFiles={getFiles(localClients.find(c => c.id === selectedClientId)?.files || "[]")}
          onFilesUpdate={(files) => handleFilesUpdate(selectedClientId, files)}
        />
      )}

      {/* Client Conversation Modal */}
      {selectedClientId && (
        <ClientConversation
          isOpen={conversationOpen}
          onClose={() => setConversationOpen(false)}
          clientId={selectedClientId}
          clientName={localClients.find(c => c.id === selectedClientId)?.name || "Client"}
        />
      )}
    </div>
  );
}
