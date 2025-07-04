import React, { useState, useEffect, useRef, useCallback } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { FileUploadModal } from "./file-upload-modal";
import { ClientConversation } from "./client-conversation";
import { ContactsModal } from "./contacts-modal";
import { DatePicker } from "./ui/date-picker";
import { Plus, Trash2, ExternalLink, Folder, Check, MessageCircle, Users, Settings, X } from "lucide-react";
import { MediaEffects } from "./media-effects";
import { type Client, type InsertClient, type UpdateClient } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";

interface ClientTableProps {
  clients: Client[];
}

export function ClientTable({ clients }: ClientTableProps) {
  const [localClients, setLocalClients] = useState<Client[]>(clients);
  const [fileModalOpen, setFileModalOpen] = useState(false);
  const [conversationOpen, setConversationOpen] = useState(false);
  const [contactsModalOpen, setContactsModalOpen] = useState(false);
  const [selectedClientId, setSelectedClientId] = useState<number | null>(null);
  const [saveFeedback, setSaveFeedback] = useState<{ [key: number]: boolean }>({});
  const [highlightedClientId, setHighlightedClientId] = useState<number | null>(null);
  const [playMediaEffect, setPlayMediaEffect] = useState(false);
  const [currentMediaType, setCurrentMediaType] = useState<'won' | 'lost' | 'pitched' | null>(null);
  const [customLeadSources, setCustomLeadSources] = useState<string[]>([]);
  const [customSalespeople, setCustomSalespeople] = useState<string[]>([]);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<{type: 'lead' | 'salesperson', item: string} | null>(null);
  const tableRef = useRef<HTMLTableElement>(null);

  // Predefined options for dropdowns
  const baseLeadSourceOptions: string[] = [];

  const baseSalespersonOptions: string[] = [];

  // Combined options including custom ones
  const leadSourceOptions = [...baseLeadSourceOptions, ...customLeadSources];
  const salespersonOptions = [...baseSalespersonOptions, ...customSalespeople];
  const queryClient = useQueryClient();
  const debounceTimers = useRef<{ [key: string]: NodeJS.Timeout }>({});

  // Load custom options from localStorage
  useEffect(() => {
    // Clear all custom options on component mount
    localStorage.removeItem('customLeadSources');
    localStorage.removeItem('customSalespeople');
    setCustomLeadSources([]);
    setCustomSalespeople([]);
  }, []);

  // Save custom options to localStorage
  const saveCustomOptions = () => {
    localStorage.setItem('customLeadSources', JSON.stringify(customLeadSources));
    localStorage.setItem('customSalespeople', JSON.stringify(customSalespeople));
  };

  const addLeadSource = (newSource: string) => {
    if (newSource.trim() && !leadSourceOptions.includes(newSource.trim())) {
      const updated = [...customLeadSources, newSource.trim()];
      setCustomLeadSources(updated);
      localStorage.setItem('customLeadSources', JSON.stringify(updated));
    }
  };

  const addSalesperson = (newPerson: string) => {
    if (newPerson.trim() && !salespersonOptions.includes(newPerson.trim())) {
      const updated = [...customSalespeople, newPerson.trim()];
      setCustomSalespeople(updated);
      localStorage.setItem('customSalespeople', JSON.stringify(updated));
    }
  };

  const removeLeadSource = (source: string) => {
    const updated = customLeadSources.filter(s => s !== source);
    setCustomLeadSources(updated);
    localStorage.setItem('customLeadSources', JSON.stringify(updated));
  };

  const removeSalesperson = (person: string) => {
    const updated = customSalespeople.filter(p => p !== person);
    setCustomSalespeople(updated);
    localStorage.setItem('customSalespeople', JSON.stringify(updated));
  };

  const confirmDelete = (type: 'lead' | 'salesperson', item: string) => {
    setShowDeleteConfirm({ type, item });
  };

  const handleConfirmDelete = () => {
    if (showDeleteConfirm) {
      if (showDeleteConfirm.type === 'lead') {
        removeLeadSource(showDeleteConfirm.item);
      } else {
        removeSalesperson(showDeleteConfirm.item);
      }
      setShowDeleteConfirm(null);
    }
  };

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

  // Media effects configuration
  const mediaEffects = {
    won: {
      audio: "/sounds/celebration.mp3", // Add your celebration sound
      video: "/videos/confetti.mp4", // Add your celebration video
    },
    lost: {
      audio: "/sounds/sad-trombone.mp3", // Add your sad sound
      video: "/videos/rain.mp4", // Add your sad video
    },
    pitched: {
      audio: "/sounds/notification.mp3", // Add your notification sound
      video: "/videos/presentation.mp4", // Add your presentation video
    }
  };

  const createClientMutation = useMutation({
    mutationFn: async (client: InsertClient) => {
      const response = await apiRequest("POST", "/api/clients", client);
      return response.json();
    },
    onSuccess: (newClient) => {
      // Add new client to cache immediately for instant UI update
      queryClient.setQueryData(["/api/clients"], (oldData: Client[] | undefined) => {
        if (!oldData) return [newClient];
        return [...oldData, newClient];
      });

      // Update local state immediately
      setLocalClients(prev => [...prev, newClient]);

      // Invalidate dependent queries
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard"] });
      queryClient.invalidateQueries({ queryKey: ["/api/calendar"] });

      // Invalidate current month data
      const now = new Date();
      const monthKey = `/api/clients/month/${now.getFullYear()}/${now.getMonth() + 1}`;
      queryClient.invalidateQueries({ queryKey: [monthKey] });
    },
  });

  const updateClientMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: UpdateClient }) => {
      const response = await apiRequest("PATCH", `/api/clients/${id}`, data);
      return response.json();
    },
    onSuccess: (updatedClient, { id }) => {
      // Update specific client in cache immediately
      queryClient.setQueryData(["/api/clients"], (oldData: Client[] | undefined) => {
        if (!oldData) return oldData;
        return oldData.map(client => client.id === id ? updatedClient : client);
      });

      // Only invalidate dashboard and calendar for efficiency
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard"] });
      queryClient.invalidateQueries({ queryKey: ["/api/calendar"] });

      // Invalidate monthly client data if it exists
      const now = new Date();
      const monthKey = `/api/clients/month/${now.getFullYear()}/${now.getMonth() + 1}`;
      queryClient.invalidateQueries({ queryKey: [monthKey] });
    },
  });

  const deleteClientMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/clients/${id}`);
      return id;
    },
    onSuccess: (deletedId) => {
      // Remove client from cache immediately for instant UI update
      queryClient.setQueryData(["/api/clients"], (oldData: Client[] | undefined) => {
        if (!oldData) return oldData;
        return oldData.filter(client => client.id !== deletedId);
      });

      // Update local state immediately
      setLocalClients(prev => prev.filter(client => client.id !== deletedId));

      // Invalidate dependent queries
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard"] });
      queryClient.invalidateQueries({ queryKey: ["/api/calendar"] });

      // Invalidate current month data
      const now = new Date();
      const monthKey = `/api/clients/month/${now.getFullYear()}/${now.getMonth() + 1}`;
      queryClient.invalidateQueries({ queryKey: [monthKey] });
    },
  });

  const handleAddClient = () => {
    const newClient: InsertClient = {
      name: "New Sales Opportunity",
      contacts: "[]",
      proposalStatus: "N/A",
      revenue: "0",
      files: "[]",
      leadSource: "Referrals",
      salesperson: "Unknown",
    };

    createClientMutation.mutate(newClient);
  };

  const handleUpdateClient = useCallback((id: number, field: keyof UpdateClient, value: any) => {
    // Update local state immediately for responsive UI
    setLocalClients(prev => 
      prev.map(client => 
        client.id === id ? { ...client, [field]: value } : client
      )
    );

    // Clear existing debounce timer for this field
    const timerKey = `${id}-${field}`;
    if (debounceTimers.current[timerKey]) {
      clearTimeout(debounceTimers.current[timerKey]);
    }

    // For text fields like name, use debouncing to avoid excessive API calls
    const isTextFieldChange = field === 'name' && typeof value === 'string';

    if (isTextFieldChange) {
      // Debounce text input updates
      debounceTimers.current[timerKey] = setTimeout(() => {
        updateClientMutation.mutate({ id, data: { [field]: value } });
        showSaveFeedback(id);
        delete debounceTimers.current[timerKey];
      }, 800); // 800ms debounce for smoother typing
    } else {
      // Immediate update for dropdowns, dates, etc.
      updateClientMutation.mutate({ id, data: { [field]: value } });
      showSaveFeedback(id);
    }
  }, [updateClientMutation]);

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

  const handleContactsUpdate = (clientId: number, contacts: string) => {
    handleUpdateClient(clientId, "contacts", contacts);
  };

  const openFileModal = (clientId: number) => {
    setSelectedClientId(clientId);
    setFileModalOpen(true);
  };

  const openConversation = (clientId: number) => {
    setSelectedClientId(clientId);
    setConversationOpen(true);
  };

  const openContactsModal = (clientId: number) => {
    setSelectedClientId(clientId);
    setContactsModalOpen(true);
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

  // Group clients by month of first discovery call
  const groupClientsByMonth = (clients: Client[]) => {
    const grouped = new Map<string, Client[]>();

    clients.forEach(client => {
      let monthKey = 'no-discovery';

      if (client.discovery1Date) {
        const date = new Date(client.discovery1Date);
        monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      }

      if (!grouped.has(monthKey)) {
        grouped.set(monthKey, []);
      }
      grouped.get(monthKey)!.push(client);
    });

    // Sort groups by date (newest first)
    const sortedEntries = Array.from(grouped.entries()).sort((a, b) => {
      if (a[0] === 'no-discovery') return 1;
      if (b[0] === 'no-discovery') return -1;
      return b[0].localeCompare(a[0]);
    });

    return sortedEntries;
  };

  const formatMonthHeader = (monthKey: string): string => {
    if (monthKey === 'no-discovery') {
      return 'No Discovery Calls Scheduled';
    }

    const [year, month] = monthKey.split('-');
    const date = new Date(parseInt(year), parseInt(month) - 1);
    return date.toLocaleDateString('en-US', { 
      month: 'long', 
      year: 'numeric' 
    });
  };

  const getFiles = (filesJson: string | null): string[] => {
    try {
      const files = JSON.parse(filesJson || "[]");
      return Array.isArray(files) ? files : [];
    } catch {
      return [];
    }
  };

  const handleStatusChange = (clientId: number, field: string, value: string) => {
    const updatedClients = localClients.map(client => 
      client.id === clientId 
        ? { 
            ...client, 
            [field]: value,
            isWon: value === "Won",
            isLost: value === "Lost"
          }
        : client
    );
    setLocalClients(updatedClients);

    // Trigger media effects for status changes
    if (field === 'dealStatus') {
      if (value === 'Won') {
        setCurrentMediaType('won');
        setPlayMediaEffect(true);
      } else if (value === 'Lost') {
        setCurrentMediaType('lost');
        setPlayMediaEffect(true);
      }
    } else if (field === 'proposalStatus' && value === 'Pitched') {
        setCurrentMediaType('pitched');
        setPlayMediaEffect(true);
    }

    // Update the client
    const clientToUpdate = updatedClients.find(c => c.id === clientId);
    if (clientToUpdate) {
      updateClientMutation.mutate({ 
        id: clientId, 
        data: { 
          [field]: value,
          isWon: value === "Won",
          isLost: value === "Lost"
        } 
      });
    }
  };

  return (
    <div className="space-y-6">
      {playMediaEffect && currentMediaType && (
        <MediaEffects
          audioUrl={mediaEffects[currentMediaType]?.audio}
          videoUrl={mediaEffects[currentMediaType]?.video}
          trigger={playMediaEffect}
          onComplete={() => setPlayMediaEffect(false)}
        />
      )}

      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-neutral-900">Sales Opportunity Management</h2>
        <Button onClick={handleAddClient} className="flex items-center space-x-2">
          <Plus className="h-4 w-4" />
          <span>Add New Opportunity</span>
        </Button>
      </div>

      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto max-h-[70vh] overflow-y-auto">
            <table className="w-full">
              <thead className="bg-gray-100 border-b-2 border-gray-300 sticky top-0 z-10">
                <tr>
                  <th className="text-left py-4 px-4 font-bold text-gray-800 text-sm w-40 bg-gray-100">Sales Opportunity</th>
                  <th className="text-left py-4 px-4 font-bold text-gray-800 text-sm w-32 bg-gray-100">Lead Source</th>
                  <th className="text-left py-4 px-4 font-bold text-gray-800 text-sm w-32 bg-gray-100">Salesperson</th>
                  <th className="text-left py-4 px-4 font-bold text-gray-800 text-sm w-32 bg-gray-100">Discovery 1</th>
                  <th className="text-left py-4 px-4 font-bold text-gray-800 text-sm w-32 bg-gray-100">Discovery 2</th>
                  <th className="text-left py-4 px-4 font-bold text-gray-800 text-sm w-32 bg-gray-100">Discovery 3</th>
                  <th className="text-left py-4 px-4 font-bold text-gray-800 text-sm w-32 bg-gray-100">Closing 1</th>
                  <th className="text-left py-4 px-4 font-bold text-gray-800 text-sm w-32 bg-gray-100">Closing 2</th>
                  <th className="text-left py-4 px-4 font-bold text-gray-800 text-sm w-32 bg-gray-100">Closing 3</th>
                  <th className="text-left py-4 px-4 font-bold text-gray-800 text-sm w-24 bg-gray-100">Proposal</th>
                  <th className="text-left py-4 px-4 font-bold text-gray-800 text-sm w-32 bg-gray-100">Revenue</th>
                  <th className="text-left py-4 px-4 font-bold text-gray-800 text-sm w-32 bg-gray-100">Cash Collected</th>
                  <th className="text-left py-4 px-4 font-bold text-gray-800 text-sm w-24 bg-gray-100">Deal Status</th>
                  <th className="text-left py-4 px-4 font-bold text-gray-800 text-sm w-20 bg-gray-100">Files</th>
                  <th className="text-left py-4 px-4 font-bold text-gray-800 text-sm w-32 bg-gray-100">Actions</th>
                </tr>
              </thead>
              <tbody>
                {groupClientsByMonth(localClients).map(([monthKey, monthClients]) => (
                  <React.Fragment key={monthKey}>
                    {/* Month Header */}
                    <tr className="border-b border-gray-200">
                      <td colSpan={13} className="py-6 px-4">
                        <div className="flex items-center space-x-4">
                          <h3 className="text-lg font-bold text-gray-900">
                            {formatMonthHeader(monthKey)}
                          </h3>
                          <div className="h-px bg-gray-300 flex-1"></div>
                          <span className="text-sm text-gray-600 font-medium">
                            {monthClients.length} {monthClients.length === 1 ? 'opportunity' : 'opportunities'}
                          </span>
                        </div>
                      </td>
                    </tr>

                    {/* Client Rows */}
                    {monthClients.map((client) => (
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
                        <td className="py-3 px-4">
                          <Select 
                            value={client.leadSource || "Referrals"} 
                            onValueChange={(value) => {
                              if (value === "__ADD__") {
                                const newSource = prompt("Enter new lead source:");
                                if (newSource && newSource.trim()) {
                                  addLeadSource(newSource.trim());
                                }
                              } else if (value.startsWith("__DELETE__")) {
                                const sourceToDelete = value.replace("__DELETE__", "");
                                confirmDelete('lead', sourceToDelete);
                              } else {
                                handleUpdateClient(client.id, "leadSource", value);
                              }
                            }}
                          >
                            <SelectTrigger className="h-8 text-xs">
                              <SelectValue placeholder="Select lead source" />
                            </SelectTrigger>
                            <SelectContent>
                              {baseLeadSourceOptions.map((source) => (
                                <SelectItem key={source} value={source}>
                                  {source}
                                </SelectItem>
                              ))}
                              {customLeadSources.map((source) => (
                                <SelectItem key={source} value={source}>
                                  <div className="flex items-center justify-between w-full">
                                    <span>{source}</span>
                                    <span className="text-xs text-blue-600">(Custom)</span>
                                  </div>
                                </SelectItem>
                              ))}
                              {customLeadSources.length > 0 && (
                                <>
                                  <div className="px-2 py-1 text-xs text-gray-500 border-t">Remove Custom:</div>
                                  {customLeadSources.map((source) => (
                                    <SelectItem key={`delete-${source}`} value={`__DELETE__${source}`} className="text-red-600">
                                      <div className="flex items-center">
                                        <X className="h-3 w-3 mr-1" />
                                        Remove "{source}"
                                      </div>
                                    </SelectItem>
                                  ))}
                                </>
                              )}
                              <SelectItem value="__ADD__" className="text-blue-600 font-medium border-t">
                                <div className="flex items-center">
                                  <Plus className="h-3 w-3 mr-1" />
                                  Add New Lead Source...
                                </div>
                              </SelectItem>
                            </SelectContent>
                          </Select>
                        </td>
                        <td className="py-3 px-4">
                          <Select 
                            value={client.salesperson || "Unknown"} 
                            onValueChange={(value) => {
                              if (value === "__ADD__") {
                                const newPerson = prompt("Enter new salesperson:");
                                if (newPerson && newPerson.trim()) {
                                  addSalesperson(newPerson.trim());
                                }
                              } else if (value.startsWith("__DELETE__")) {
                                const personToDelete = value.replace("__DELETE__", "");
                                confirmDelete('salesperson', personToDelete);
                              } else {
                                handleUpdateClient(client.id, "salesperson", value);
                              }
                            }}
                          >
                            <SelectTrigger className="h-8 text-xs">
                              <SelectValue placeholder="Select salesperson" />
                            </SelectTrigger>
                            <SelectContent>
                              {baseSalespersonOptions.map((person) => (
                                <SelectItem key={person} value={person}>
                                  {person}
                                </SelectItem>
                              ))}
                              {customSalespeople.map((person) => (
                                <SelectItem key={person} value={person}>
                                  <div className="flex items-center justify-between w-full">
                                    <span>{person}</span>
                                    <span className="text-xs text-blue-600">(Custom)</span>
                                  </div>
                                </SelectItem>
                              ))}
                              {customSalespeople.length > 0 && (
                                <>
                                  <div className="px-2 py-1 text-xs text-gray-500 border-t">Remove Custom:</div>
                                  {customSalespeople.map((person) => (
                                    <SelectItem key={`delete-${person}`} value={`__DELETE__${person}`} className="text-red-600">
                                      <div className="flex items-center">
                                        <X className="h-3 w-3 mr-1" />
                                        Remove "{person}"
                                      </div>
                                    </SelectItem>
                                  ))}
                                </>
                              )}
                              <SelectItem value="__ADD__" className="text-blue-600 font-medium border-t">
                                <div className="flex items-center">
                                  <Plus className="h-3 w-3 mr-1" />
                                  Add New Salesperson...
                                </div>
                              </SelectItem>
                            </SelectContent>
                          </Select>
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
                        onValueChange={(value) => handleStatusChange(client.id, "proposalStatus", value)}
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
                    <td className="py-3 px-4 w-32">
                      <div className="relative w-full">
                        <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 text-sm">€</span>
                        <Input
                          type="text"
                          value={client.revenue || "0"}
                          onChange={(e) => handleUpdateClient(client.id, "revenue", e.target.value)}
                          placeholder="0"
                          className="w-full pl-8 pr-2 py-1 text-sm h-8 min-w-[100px]"
                        />
                      </div>
                    </td>

                    {/* Cash Collected */}
                    <td className="py-3 px-4 w-32">
                      <div className="relative w-full">
                        <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 text-sm">€</span>
                        <Input
                          type="text"
                          value={client.cashCollected || "0"}
                          onChange={(e) => handleUpdateClient(client.id, "cashCollected", e.target.value)}
                          placeholder="0"
                          className="w-full pl-8 pr-2 py-1 text-sm h-8 min-w-[100px]"
                        />
                      </div>
                    </td>

                    {/* Deal Status */}
                    <td className="py-3 px-4">
                      <Select
                        value={client.dealStatus || "Open"}
                        onValueChange={(value) => handleStatusChange(client.id, "dealStatus", value)}
                      >
                        <SelectTrigger className="text-sm h-8">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Open">Open</SelectItem>
                          <SelectItem value="Won">Won</SelectItem>
                          <SelectItem value="Lost">Lost</SelectItem>
                        </SelectContent>
                      </Select>
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
                          onClick={() => openContactsModal(client.id)}
                          className="text-green-500 hover:text-green-700 h-8 w-8"
                          title="Manage contacts"
                        >
                          <Users className="h-4 w-4" />
                        </Button>
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
                          title="Delete opportunity"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                        </tr>
                    ))}
                  </React.Fragment>
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

      {/* Contacts Management Modal */}
      {selectedClientId && (
        <ContactsModal
          isOpen={contactsModalOpen}
          onClose={() => setContactsModalOpen(false)}
          opportunityId={selectedClientId}
          opportunityName={localClients.find(c => c.id === selectedClientId)?.name || "Opportunity"}
          currentContacts={localClients.find(c => c.id === selectedClientId)?.contacts || "[]"}
          onContactsUpdate={(contacts) => handleContactsUpdate(selectedClientId, contacts)}
        />
      )}

      {/* Delete Confirmation Dialog */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold mb-4">Confirm Deletion</h3>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete "{showDeleteConfirm.item}"? This action cannot be undone.
            </p>
            <div className="flex justify-end space-x-3">
              <Button 
                variant="outline" 
                onClick={() => setShowDeleteConfirm(null)}
              >
                Cancel
              </Button>
              <Button 
                variant="destructive" 
                onClick={handleConfirmDelete}
              >
                Delete
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}