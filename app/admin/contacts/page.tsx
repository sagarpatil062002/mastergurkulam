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
      <div className="space-y-8">
        <div>
          <h2 className="text-3xl font-bold text-gray-800">Contact Messages</h2>
          <p className="text-gray-600 mt-2">Manage and respond to contact inquiries</p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-2xl p-6 border border-gray-100">
              <h3 className="text-xl font-bold text-gray-800 mb-6">All Messages</h3>
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {contacts.map((contact) => (
                  <button
                    key={contact._id?.toString()}
                    onClick={() => setSelectedContact(contact)}
                    className={`w-full text-left p-4 rounded-xl border-2 transition-all duration-300 transform hover:scale-105 ${
                      selectedContact?._id === contact._id
                        ? "border-primary bg-gradient-to-r from-primary/10 to-secondary/10 shadow-lg"
                        : "border-gray-200 hover:border-primary hover:shadow-md bg-white"
                    }`}
                  >
                    <p className="font-bold text-gray-900">{contact.name}</p>
                    <p className="text-sm text-gray-600 truncate">{contact.email}</p>
                    <div className="flex items-center justify-between mt-2">
                      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                        contact.type === 'complaint' ? 'bg-red-100 text-red-800' :
                        contact.type === 'admission' ? 'bg-blue-100 text-blue-800' :
                        contact.type === 'feedback' ? 'bg-green-100 text-green-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {contact.type || 'general'}
                      </span>
                      <p className="text-xs text-gray-500">{new Date(contact.createdAt).toLocaleDateString()}</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {selectedContact && (
            <div className="lg:col-span-2">
              <div className="bg-white rounded-xl shadow-2xl p-8 border border-gray-100">
                <div className="flex justify-between items-start mb-8">
                  <div>
                    <h3 className="text-2xl font-bold text-gray-800">{selectedContact.name}</h3>
                    <p className="text-gray-600 mt-1">Contact inquiry received</p>
                  </div>
                  <div className="flex gap-3">
                    <button
                      onClick={() => handleEdit(selectedContact)}
                      className="p-3 hover:bg-blue-50 text-blue-600 rounded-lg transition-all duration-300 hover:shadow-md"
                      title="Edit Contact"
                    >
                      <Edit2 size={20} />
                    </button>
                    <button
                      onClick={() => handleDelete(selectedContact._id?.toString() || "")}
                      className="p-3 hover:bg-red-50 text-red-600 rounded-lg transition-all duration-300 hover:shadow-md"
                      title="Delete Contact"
                    >
                      <Trash2 size={20} />
                    </button>
                  </div>
                </div>

                {isEditing ? (
                  <form onSubmit={handleUpdate} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-bold mb-3 text-gray-700">Name</label>
                        <input
                          type="text"
                          value={editForm.name}
                          onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                          className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 text-lg focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                          placeholder="Enter full name"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-bold mb-3 text-gray-700">Email</label>
                        <input
                          type="email"
                          value={editForm.email}
                          onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                          className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 text-lg focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                          placeholder="Enter email address"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-bold mb-3 text-gray-700">Mobile</label>
                        <input
                          type="text"
                          value={editForm.mobile}
                          onChange={(e) => setEditForm({ ...editForm, mobile: e.target.value })}
                          className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 text-lg focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                          placeholder="Enter mobile number"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-bold mb-3 text-gray-700">Type</label>
                        <select
                          value={editForm.type}
                          onChange={(e) => setEditForm({ ...editForm, type: e.target.value })}
                          className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 text-lg focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                          title="Select contact type"
                        >
                          <option value="general">General</option>
                          <option value="admission">Admission</option>
                          <option value="complaint">Complaint</option>
                          <option value="feedback">Feedback</option>
                        </select>
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-bold mb-3 text-gray-700">Message</label>
                      <textarea
                        value={editForm.message}
                        onChange={(e) => setEditForm({ ...editForm, message: e.target.value })}
                        rows={6}
                        className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 text-lg focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                        placeholder="Enter your message"
                        required
                      />
                    </div>
                    <div className="flex gap-4 pt-6 border-t border-gray-200">
                      <button
                        type="submit"
                        className="flex-1 bg-gradient-to-r from-primary to-secondary text-white py-4 rounded-xl font-bold text-lg hover:opacity-90 transform hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-xl"
                      >
                        Update Contact
                      </button>
                      <button
                        type="button"
                        onClick={handleCancelEdit}
                        className="flex-1 bg-gray-200 text-gray-800 py-4 rounded-xl font-bold text-lg hover:bg-gray-300 transform hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-xl"
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                ) : (
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="bg-gradient-to-r from-blue-50 to-blue-100 p-6 rounded-xl border border-blue-200">
                        <p className="text-sm font-bold text-blue-700 mb-2">Email</p>
                        <p className="font-bold text-lg text-blue-900">{selectedContact.email}</p>
                      </div>
                      <div className="bg-gradient-to-r from-green-50 to-green-100 p-6 rounded-xl border border-green-200">
                        <p className="text-sm font-bold text-green-700 mb-2">Mobile</p>
                        <p className="font-bold text-lg text-green-900">{selectedContact.mobile}</p>
                      </div>
                      <div className="bg-gradient-to-r from-purple-50 to-purple-100 p-6 rounded-xl border border-purple-200">
                        <p className="text-sm font-bold text-purple-700 mb-2">Type</p>
                        <p className="font-bold text-lg text-purple-900 capitalize">{selectedContact.type || 'general'}</p>
                      </div>
                      <div className="bg-gradient-to-r from-orange-50 to-orange-100 p-6 rounded-xl border border-orange-200">
                        <p className="text-sm font-bold text-orange-700 mb-2">Received</p>
                        <p className="font-bold text-lg text-orange-900">{new Date(selectedContact.createdAt).toLocaleString()}</p>
                      </div>
                    </div>
                    <div className="bg-gradient-to-r from-gray-50 to-gray-100 p-6 rounded-xl border border-gray-200">
                      <p className="text-sm font-bold text-gray-700 mb-3">Message</p>
                      <p className="text-gray-900 leading-relaxed text-lg">{selectedContact.message}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  )
}
