"use client"

import { useState, useEffect } from "react"
import { Trash2, Edit2 } from "lucide-react"
import type { Contact } from "@/lib/db-models"
import AdminLayout from "@/components/AdminLayout"

export default function ContactsAdmin() {
  const [contacts, setContacts] = useState<Contact[]>([])
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [editForm, setEditForm] = useState({
    name: "",
    email: "",
    mobile: "",
    type: "",
    message: "",
  })

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
        await fetchContacts()
        setSelectedContact(null)
        setIsEditing(false)
        window.location.reload() // Force page refresh after CRUD operation
      }
    } catch (error) {
      console.error("Delete error:", error)
    }
  }

  const handleEdit = (contact: Contact) => {
    setEditForm({
      name: contact.name,
      email: contact.email,
      mobile: contact.mobile,
      type: contact.type || "general",
      message: contact.message,
    })
    setSelectedContact(contact)
    setIsEditing(true)
  }

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedContact) return

    try {
      const response = await fetch(`/api/contacts/${selectedContact._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editForm),
      })
      if (response.ok) {
        await fetchContacts()
        setIsEditing(false)
        window.location.reload() // Force page refresh after CRUD operation
      }
    } catch (error) {
      console.error("Update error:", error)
    }
  }

  const handleCancelEdit = () => {
    setIsEditing(false)
    setEditForm({ name: "", email: "", mobile: "", type: "", message: "" })
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
            <div className="flex gap-2">
              <button
                onClick={() => handleEdit(selectedContact)}
                className="p-2 hover:bg-blue-100 text-blue-600 rounded-lg transition"
                title="Edit Contact"
              >
                <Edit2 size={18} />
              </button>
              <button
                onClick={() => handleDelete(selectedContact._id?.toString() || "")}
                className="p-2 hover:bg-red-100 text-red-600 rounded-lg transition"
                title="Delete Contact"
              >
                <Trash2 size={18} />
              </button>
            </div>
          </div>

          {isEditing ? (
            <form onSubmit={handleUpdate} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold mb-2">Name</label>
                <input
                  type="text"
                  value={editForm.name}
                  onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                  className="w-full border border-border rounded-lg px-4 py-2"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-2">Email</label>
                <input
                  type="email"
                  value={editForm.email}
                  onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                  className="w-full border border-border rounded-lg px-4 py-2"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-2">Mobile</label>
                <input
                  type="text"
                  value={editForm.mobile}
                  onChange={(e) => setEditForm({ ...editForm, mobile: e.target.value })}
                  className="w-full border border-border rounded-lg px-4 py-2"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-2">Type</label>
                <select
                  value={editForm.type}
                  onChange={(e) => setEditForm({ ...editForm, type: e.target.value })}
                  className="w-full border border-border rounded-lg px-4 py-2"
                >
                  <option value="general">General</option>
                  <option value="admission">Admission</option>
                  <option value="complaint">Complaint</option>
                  <option value="feedback">Feedback</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold mb-2">Message</label>
                <textarea
                  value={editForm.message}
                  onChange={(e) => setEditForm({ ...editForm, message: e.target.value })}
                  rows={4}
                  className="w-full border border-border rounded-lg px-4 py-2"
                  required
                />
              </div>
              <div className="flex gap-4 pt-4">
                <button
                  type="submit"
                  className="flex-1 bg-primary text-primary-foreground py-2 rounded-lg hover:opacity-90"
                >
                  Update Contact
                </button>
                <button
                  type="button"
                  onClick={handleCancelEdit}
                  className="flex-1 bg-border text-foreground py-2 rounded-lg hover:bg-border/80"
                >
                  Cancel
                </button>
              </div>
            </form>
          ) : (
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
          )}
        </div>
      )}
      </div>
    </AdminLayout>
  )
}
