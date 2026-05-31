"use client"

import React, { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { BookOpen, FileText, Link as LinkIcon } from "lucide-react"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import Link from "next/link"

const knowledgeTypes = [
  "PDF", "TXT", "DOCX", "MARKDOWN", "URL", "GITHUB", "WHITEPAPER"
] as const

type KnowledgeType = typeof knowledgeTypes[number]

export default function KnowledgeHubPage() {
  const [name, setName] = useState("")
  const [type, setType] = useState<KnowledgeType>("PDF")
  const [url, setUrl] = useState("")
  const [content, setContent] = useState("")
  const [organizationId, setOrganizationId] = useState("")
  const queryClient = useQueryClient()

  const { data: organizations } = useQuery({
    queryKey: ["organizations"],
    queryFn: async () => {
      const res = await fetch("/api/organizations")
      return res.json()
    }
  })

  const { data: knowledgeSources, isLoading } = useQuery({
    queryKey: ["knowledge"],
    queryFn: async () => {
      const res = await fetch("/api/knowledge")
      return res.json()
    }
  })

  const createKnowledgeMutation = useMutation({
    mutationFn: async (data: {
      name: string
      type: KnowledgeType
      url?: string
      content?: string
      organizationId?: string
    }) => {
      const res = await fetch("/api/knowledge", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
      })
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["knowledge"] })
      setName("")
      setUrl("")
      setContent("")
      setOrganizationId("")
    }
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    createKnowledgeMutation.mutate({
      name,
      type,
      url: url || undefined,
      content: content || undefined,
      organizationId: organizationId || undefined
    })
  }

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Knowledge Hub</h1>
        <p className="text-slate-600">Upload and manage your knowledge base for AI agents</p>
      </div>

      <div className="grid gap-6 mb-8">
        {isLoading ? (
          <p>Loading...</p>
        ) : knowledgeSources?.length === 0 ? (
          <Card>
            <CardContent className="py-8 text-center">
              <p className="text-slate-600 mb-4">No knowledge sources yet. Add your first one below!</p>
            </CardContent>
          </Card>
        ) : (
          knowledgeSources?.map((source: any) => (
            <Card key={source.id}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="p-3 rounded-lg bg-gradient-to-br from-green-100 to-emerald-100">
                      <BookOpen className="h-6 w-6 text-emerald-600" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">{source.name}</CardTitle>
                      <CardDescription>
                        {source.type}
                        {source.organization && ` • ${source.organization.name}`}
                      </CardDescription>
                    </div>
                  </div>
                  <Link href={`/app/knowledge/${source.id}`}>
                    <Button variant="outline">View</Button>
                  </Link>
                </div>
              </CardHeader>
              {source.url && (
                <CardContent>
                  <a href={source.url} target="_blank" rel="noreferrer" className="text-blue-600 hover:underline flex items-center gap-2">
                    <LinkIcon className="h-4 w-4" /> {source.url}
                  </a>
                </CardContent>
              )}
            </Card>
          ))
        )}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Add Knowledge Source</CardTitle>
          <CardDescription>Upload or link your documents</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Source Name</Label>
              <Input
                id="name"
                placeholder="e.g., Project Whitepaper"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="type">Type</Label>
              <select
                id="type"
                value={type}
                onChange={(e) => setType(e.target.value as KnowledgeType)}
                className="flex h-10 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm ring-offset-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-950 focus-visible:ring-offset-2"
              >
                {knowledgeTypes.map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="url">URL (Optional)</Label>
              <Input
                id="url"
                placeholder="https://..."
                value={url}
                onChange={(e) => setUrl(e.target.value)}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="content">Content (Optional)</Label>
              <textarea
                id="content"
                placeholder="Paste content here..."
                value={content}
                onChange={(e) => setContent(e.target.value)}
                rows={4}
                className="flex w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm ring-offset-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-950 focus-visible:ring-offset-2"
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="organization">Organization (Optional)</Label>
              <select
                id="organization"
                value={organizationId}
                onChange={(e) => setOrganizationId(e.target.value)}
                className="flex h-10 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm ring-offset-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-950 focus-visible:ring-offset-2"
              >
                <option value="">No Organization</option>
                {organizations?.map((org: any) => (
                  <option key={org.id} value={org.id}>{org.name}</option>
                ))}
              </select>
            </div>

            <Button type="submit" disabled={createKnowledgeMutation.isPending}>
              {createKnowledgeMutation.isPending ? "Adding..." : "Add Source"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
