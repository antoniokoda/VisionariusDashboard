import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Card, CardContent } from "@/components/ui/card";
import { Plus, Trash2, Mail, Phone, User } from "lucide-react";
import { type Contact } from "@shared/schema";
import { nanoid } from "nanoid";

interface ContactsModalProps {
  isOpen: boolean;
  onClose: () => void;
  opportunityId: number;
  opportunityName: string;
  currentContacts: string;
  onContactsUpdate: (contacts: string) => void;
}

export function ContactsModal({ 
  isOpen, 
  onClose, 
  opportunityId, 
  opportunityName, 
  currentContacts,
  onContactsUpdate 
}: ContactsModalProps) {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [newContact, setNewContact] = useState<Partial<Contact>>({
    name: "",
    email: "",
    phone: "",
    role: ""
  });

  useEffect(() => {
    if (isOpen) {
      try {
        const parsedContacts = JSON.parse(currentContacts || "[]");
        setContacts(parsedContacts);
      } catch {
        setContacts([]);
      }
    }
  }, [isOpen, currentContacts]);

  const handleAddContact = () => {
    if (!newContact.name || !newContact.email) return;

    const contact: Contact = {
      id: nanoid(),
      name: newContact.name,
      email: newContact.email,
      phone: newContact.phone || "",
      role: newContact.role || ""
    };

    const updatedContacts = [...contacts, contact];
    setContacts(updatedContacts);
    onContactsUpdate(JSON.stringify(updatedContacts));
    
    setNewContact({ name: "", email: "", phone: "", role: "" });
  };

  const handleDeleteContact = (contactId: string) => {
    const updatedContacts = contacts.filter(c => c.id !== contactId);
    setContacts(updatedContacts);
    onContactsUpdate(JSON.stringify(updatedContacts));
  };

  const handleUpdateContact = (contactId: string, field: keyof Contact, value: string) => {
    const updatedContacts = contacts.map(c => 
      c.id === contactId ? { ...c, [field]: value } : c
    );
    setContacts(updatedContacts);
    onContactsUpdate(JSON.stringify(updatedContacts));
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <User className="h-5 w-5" />
            <span>Manage Contacts - {opportunityName}</span>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Existing Contacts */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Current Contacts ({contacts.length})</h3>
            {contacts.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <User className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No contacts added yet</p>
              </div>
            ) : (
              <div className="grid gap-4">
                {contacts.map((contact) => (
                  <Card key={contact.id}>
                    <CardContent className="p-4">
                      <div className="grid grid-cols-5 gap-4 items-center">
                        <div>
                          <label className="text-xs font-medium text-gray-500 block mb-1">Name</label>
                          <Input
                            value={contact.name}
                            onChange={(e) => handleUpdateContact(contact.id, "name", e.target.value)}
                            placeholder="Full name"
                            className="text-sm"
                          />
                        </div>
                        <div>
                          <label className="text-xs font-medium text-gray-500 block mb-1">Email</label>
                          <Input
                            type="email"
                            value={contact.email}
                            onChange={(e) => handleUpdateContact(contact.id, "email", e.target.value)}
                            placeholder="email@company.com"
                            className="text-sm"
                          />
                        </div>
                        <div>
                          <label className="text-xs font-medium text-gray-500 block mb-1">Phone</label>
                          <Input
                            type="tel"
                            value={contact.phone}
                            onChange={(e) => handleUpdateContact(contact.id, "phone", e.target.value)}
                            placeholder="+1 (555) 123-4567"
                            className="text-sm"
                          />
                        </div>
                        <div>
                          <label className="text-xs font-medium text-gray-500 block mb-1">Role</label>
                          <Input
                            value={contact.role}
                            onChange={(e) => handleUpdateContact(contact.id, "role", e.target.value)}
                            placeholder="CEO, CTO, etc."
                            className="text-sm"
                          />
                        </div>
                        <div className="flex justify-end">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDeleteContact(contact.id)}
                            className="text-red-500 hover:text-red-700 h-8 w-8"
                            title="Delete contact"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>

          {/* Add New Contact */}
          <Card className="border-dashed border-2">
            <CardContent className="p-4">
              <h4 className="font-medium mb-4 flex items-center space-x-2">
                <Plus className="h-4 w-4" />
                <span>Add New Contact</span>
              </h4>
              <div className="grid grid-cols-4 gap-4">
                <div>
                  <label className="text-xs font-medium text-gray-500 block mb-1">Name *</label>
                  <Input
                    value={newContact.name || ""}
                    onChange={(e) => setNewContact(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Full name"
                    className="text-sm"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-500 block mb-1">Email *</label>
                  <Input
                    type="email"
                    value={newContact.email || ""}
                    onChange={(e) => setNewContact(prev => ({ ...prev, email: e.target.value }))}
                    placeholder="email@company.com"
                    className="text-sm"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-500 block mb-1">Phone</label>
                  <Input
                    type="tel"
                    value={newContact.phone || ""}
                    onChange={(e) => setNewContact(prev => ({ ...prev, phone: e.target.value }))}
                    placeholder="+1 (555) 123-4567"
                    className="text-sm"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-500 block mb-1">Role</label>
                  <Input
                    value={newContact.role || ""}
                    onChange={(e) => setNewContact(prev => ({ ...prev, role: e.target.value }))}
                    placeholder="CEO, CTO, etc."
                    className="text-sm"
                  />
                </div>
              </div>
              <div className="flex justify-end mt-4">
                <Button
                  onClick={handleAddContact}
                  disabled={!newContact.name || !newContact.email}
                  className="flex items-center space-x-2"
                >
                  <Plus className="h-4 w-4" />
                  <span>Add Contact</span>
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Contact Summary */}
          {contacts.length > 0 && (
            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="font-medium mb-2">Quick Contact Summary</h4>
              <div className="space-y-1 text-sm">
                {contacts.map((contact) => (
                  <div key={contact.id} className="flex items-center space-x-4">
                    <span className="font-medium">{contact.name}</span>
                    {contact.role && <span className="text-gray-500">({contact.role})</span>}
                    <div className="flex items-center space-x-2">
                      <Mail className="h-3 w-3" />
                      <span>{contact.email}</span>
                    </div>
                    {contact.phone && (
                      <div className="flex items-center space-x-2">
                        <Phone className="h-3 w-3" />
                        <span>{contact.phone}</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}