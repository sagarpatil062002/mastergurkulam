"use client"

import type React from "react"

import { useState, useEffect } from "react"
import AdminLayout from "@/components/AdminLayout"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog"
import { Plus, Edit, Trash2, Eye, Mail } from "lucide-react"
import { toast } from "sonner"

interface EmailTemplate {
  _id: string
  name: string
  subject: string
  body: string
  type: "registration" | "confirmation" | "admission" | "grievance" | "admit_card" | "result"
  variables: string[]
  createdAt: string
  updatedAt: string
}

export default function EmailTemplatesPage() {
  const [templates, setTemplates] = useState<EmailTemplate[]>([])
  const [loading, setLoading] = useState(true)
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isPreviewDialogOpen, setIsPreviewDialogOpen] = useState(false)
  const [editingTemplate, setEditingTemplate] = useState<EmailTemplate | null>(null)
  const [previewTemplate, setPreviewTemplate] = useState<EmailTemplate | null>(null)
  const [formData, setFormData] = useState({
    name: "",
    subject: "",
    body: "",
    type: "registration" as EmailTemplate["type"],
    variables: ""
  })

  useEffect(() => {
    fetchTemplates()
  }, [])

  const fetchTemplates = async () => {
    try {
      const response = await fetch("/api/email-templates")
      if (response.ok) {
        const data = await response.json()
        setTemplates(data)
      }
    } catch (error) {
      console.error("Error fetching templates:", error)
      toast.error("Failed to fetch templates")
    } finally {
      setLoading(false)
    }
  }

  const handleCreateTemplate = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const variables = formData.variables.split(",").map(v => v.trim()).filter(v => v)
      const response = await fetch("/api/email-templates", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          variables
        })
      })

      if (response.ok) {
        toast.success("Template created successfully")
        setIsCreateDialogOpen(false)
        setFormData({ name: "", subject: "", body: "", type: "registration", variables: "" })
        fetchTemplates()
      } else {
        const error = await response.json()
        toast.error(error.error || "Failed to create template")
      }
    } catch (error) {
      console.error("Error creating template:", error)
      toast.error("Failed to create template")
    }
  }

  const handleEditTemplate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingTemplate) return

    try {
      const variables = formData.variables.split(",").map(v => v.trim()).filter(v => v)
      const response = await fetch(`/api/email-templates/${editingTemplate._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          variables
        })
      })

      if (response.ok) {
        toast.success("Template updated successfully")
        setIsEditDialogOpen(false)
        setEditingTemplate(null)
        setFormData({ name: "", subject: "", body: "", type: "registration", variables: "" })
        fetchTemplates()
      } else {
        const error = await response.json()
        toast.error(error.error || "Failed to update template")
      }
    } catch (error) {
      console.error("Error updating template:", error)
      toast.error("Failed to update template")
    }
  }

  const handleDeleteTemplate = async (templateId: string) => {
    try {
      const response = await fetch(`/api/email-templates/${templateId}`, {
        method: "DELETE"
      })

      if (response.ok) {
        toast.success("Template deleted successfully")
        fetchTemplates()
      } else {
        const error = await response.json()
        toast.error(error.error || "Failed to delete template")
      }
    } catch (error) {
      console.error("Error deleting template:", error)
      toast.error("Failed to delete template")
    }
  }

  const openEditDialog = (template: EmailTemplate) => {
    setEditingTemplate(template)
    setFormData({
      name: template.name,
      subject: template.subject,
      body: template.body,
      type: template.type,
      variables: template.variables.join(", ")
    })
    setIsEditDialogOpen(true)
  }

  const openPreviewDialog = (template: EmailTemplate) => {
    setPreviewTemplate(template)
    setIsPreviewDialogOpen(true)
  }

  const getTypeBadgeColor = (type: string) => {
    switch (type) {
      case "registration": return "bg-blue-100 text-blue-800"
      case "confirmation": return "bg-green-100 text-green-800"
      case "admission": return "bg-purple-100 text-purple-800"
      case "grievance": return "bg-orange-100 text-orange-800"
      case "admit_card": return "bg-red-100 text-red-800"
      case "result": return "bg-indigo-100 text-indigo-800"
      default: return "bg-gray-100 text-gray-800"
    }
  }

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center min-h-96">
          <div className="text-lg">Loading...</div>
        </div>
      </AdminLayout>
    )
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">Email Templates</h1>
            <p className="text-gray-600 mt-2">Manage email templates for different purposes</p>
          </div>
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-primary hover:bg-primary/90">
                <Plus className="w-4 h-4 mr-2" />
                Create Template
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Create Email Template</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleCreateTemplate} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="name">Template Name</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="e.g., Registration Confirmation"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="type">Template Type</Label>
                    <Select value={formData.type} onValueChange={(value: any) => setFormData({ ...formData, type: value })}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="registration">Registration</SelectItem>
                        <SelectItem value="confirmation">Confirmation</SelectItem>
                        <SelectItem value="admission">Admission</SelectItem>
                        <SelectItem value="grievance">Grievance</SelectItem>
                        <SelectItem value="admit_card">Admit Card</SelectItem>
                        <SelectItem value="result">Result</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div>
                  <Label htmlFor="subject">Email Subject</Label>
                  <Input
                    id="subject"
                    value={formData.subject}
                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                    placeholder="e.g., Welcome to Master's Gurukulam!"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="variables">Variables (comma-separated)</Label>
                  <Input
                    id="variables"
                    value={formData.variables}
                    onChange={(e) => setFormData({ ...formData, variables: e.target.value })}
                    placeholder="e.g., name, email, registrationNumber"
                  />
                  <p className="text-sm text-gray-500 mt-1">Use these variables in your template with &#123;&#123;variable&#125;&#125; syntax</p>
                </div>
                <div>
                  <Label htmlFor="body">Email Body (HTML)</Label>
                  <Textarea
                    id="body"
                    value={formData.body}
                    onChange={(e) => setFormData({ ...formData, body: e.target.value })}
                    placeholder="<p>Dear {{name}},</p><p>Welcome to our institute...</p>"
                    rows={10}
                    required
                  />
                </div>
                <div className="flex justify-end gap-2">
                  <Button type="button" variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit">Create Template</Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <div className="bg-white rounded-lg shadow">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Subject</TableHead>
                <TableHead>Variables</TableHead>
                <TableHead>Created</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {templates.map((template) => (
                <TableRow key={template._id}>
                  <TableCell className="font-medium">{template.name}</TableCell>
                  <TableCell>
                    <Badge className={getTypeBadgeColor(template.type)}>
                      {template.type.replace("_", " ").toUpperCase()}
                    </Badge>
                  </TableCell>
                  <TableCell className="max-w-xs truncate">{template.subject}</TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {template.variables.slice(0, 3).map((variable) => (
                        <Badge key={variable} variant="outline" className="text-xs">
                          {variable}
                        </Badge>
                      ))}
                      {template.variables.length > 3 && (
                        <Badge variant="outline" className="text-xs">
                          +{template.variables.length - 3} more
                        </Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>{new Date(template.createdAt).toLocaleDateString()}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => openPreviewDialog(template)}
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => openEditDialog(template)}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button size="sm" variant="outline">
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Delete Template</AlertDialogTitle>
                            <AlertDialogDescription>
                              Are you sure you want to delete "{template.name}"? This action cannot be undone.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={() => handleDeleteTemplate(template._id)}>
                              Delete
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {/* Edit Dialog */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Edit Email Template</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleEditTemplate} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="edit-name">Template Name</Label>
                  <Input
                    id="edit-name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="edit-type">Template Type</Label>
                  <Select value={formData.type} onValueChange={(value: any) => setFormData({ ...formData, type: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="registration">Registration</SelectItem>
                      <SelectItem value="confirmation">Confirmation</SelectItem>
                      <SelectItem value="admission">Admission</SelectItem>
                      <SelectItem value="grievance">Grievance</SelectItem>
                      <SelectItem value="admit_card">Admit Card</SelectItem>
                      <SelectItem value="result">Result</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div>
                <Label htmlFor="edit-subject">Email Subject</Label>
                <Input
                  id="edit-subject"
                  value={formData.subject}
                  onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label htmlFor="edit-variables">Variables (comma-separated)</Label>
                <Input
                  id="edit-variables"
                  value={formData.variables}
                  onChange={(e) => setFormData({ ...formData, variables: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="edit-body">Email Body (HTML)</Label>
                <Textarea
                  id="edit-body"
                  value={formData.body}
                  onChange={(e) => setFormData({ ...formData, body: e.target.value })}
                  rows={10}
                  required
                />
              </div>
              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit">Update Template</Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>

        {/* Preview Dialog */}
        <Dialog open={isPreviewDialogOpen} onOpenChange={setIsPreviewDialogOpen}>
          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Email Template Preview</DialogTitle>
            </DialogHeader>
            {previewTemplate && (
              <div className="space-y-4">
                <div>
                  <Label className="text-sm font-medium">Subject:</Label>
                  <p className="text-sm bg-gray-50 p-2 rounded">{previewTemplate.subject}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Variables:</Label>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {previewTemplate.variables.map((variable) => (
                      <Badge key={variable} variant="outline" className="text-xs">
                        {variable}
                      </Badge>
                    ))}
                  </div>
                </div>
                <div>
                  <Label className="text-sm font-medium">Body:</Label>
                  <div className="border rounded p-4 bg-gray-50 max-h-96 overflow-y-auto">
                    <div dangerouslySetInnerHTML={{ __html: previewTemplate.body }} />
                  </div>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  )
}