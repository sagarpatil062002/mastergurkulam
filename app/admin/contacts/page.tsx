"use client"

import { useState, useEffect } from "react"
import { Trash2 } from "lucide-react"
import type { Contact } from "@/lib/db-models"
import AdminLayout from "@/components/AdminLayout"

export default function ContactsAdmin() {
  const [contacts, setContacts] = useState<Contact[]>([])
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null)

  useEffect(() => {
    fetchContacts()
  }, [])

  const fetchContacts = async () => {
    try {
      const response = await fetch("/api/contacts")
      const data = await response.json()
      setContacts(data)
    } catch (error) {
      console.error("Fetch error:", error)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure?")) return
    try {
      const response = await fetch(`/api/contacts/${id}`, { method: "DELETE" })
      if (response.ok) {
        fetchContacts()
        setSelectedContact(null)
      }
    } catch (error) {
      console.error("Delete error:", error)
    }
  }

  return (
    <AdminLayout>
      <div className="grid md:grid-cols-2 gap-6">
      <div>
        <h2 className="text-3xl font-bold mb-6">Contacts</h2>
        <div className="space-y-2 max-h-96 overflow-y-auto">
          {contacts.map((contact) => (
            <button
              key={contact._id?.toString()}
              onClick={() => setSelectedContact(contact)}
              className={`w-full text-left p-4 rounded-lg border-2 transition ${
                selectedContact?._id === contact._id
                  ? "border-primary bg-primary/10"
                  : "border-border hover:border-primary"
              }`}
            >
              <p className="font-semibold">{contact.name}</p>
              <p className="text-sm text-muted-foreground">{contact.email}</p>
              <p className="text-xs text-muted-foreground mt-1">{new Date(contact.createdAt).toLocaleDateString()}</p>
            </button>
          ))}
        </div>
      </div>

      {selectedContact && (
        <div className="bg-card border border-border rounded-lg p-6">
          <div className="flex justify-between items-start mb-4">
            <h3 className="text-xl font-bold">{selectedContact.name}</h3>
            <button
              onClick={() => handleDelete(selectedContact._id?.toString() || "")}
              className="p-2 hover:bg-red-100 text-red-600 rounded-lg transition"
            >
              <Trash2 size={18} />
            </button>
          </div>
          <div className="space-y-4">
            <div>
              <p className="text-sm text-muted-foreground">Email</p>
              <p className="font-semibold">{selectedContact.email}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Mobile</p>
              <p className="font-semibold">{selectedContact.mobile}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Type</p>
              <p className="font-semibold capitalize">{selectedContact.type}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Message</p>
              <p className="mt-2">{selectedContact.message}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Received</p>
              <p className="font-semibold">{new Date(selectedContact.createdAt).toLocaleString()}</p>
            </div>
          </div>
        </div>
      )}
      </div>
    </AdminLayout>
  )
}
