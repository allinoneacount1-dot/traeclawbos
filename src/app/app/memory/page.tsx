"use client"

import React, { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Network, MessageSquare } from "lucide-react"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import Link from "next/link"

const memoryTypes = [
  "CONVERSATION", "TASK", "REPORT", "DECISION"
] as const

type MemoryType = typeof memoryTypes[number]

export default function MemoryGraphPage() {
  const [content, setContent] = useState("")
  const [type, setType] = useState<MemoryType>("CONVERSATION")
  const [agentId, setAgentId] = useState("")
  const queryClient = useQueryClient()

  const { data: agents } = useQuery({
    queryKey: ["agents"],
    queryFn: async () => {
      const res = await fetch("/api/agents")
      return res.json()
    }
  })

  const { data: memories, isLoading } = useQuery({
    queryKey: ["memories"],
    queryFn: async () => {
      const res = await fetch("/api/memories")
      return res.json()
    }
  })

  const createMemoryMutation = useMutation({
    mutationFn: async (data: {
      content: string
      type: MemoryType
      agentId: string
    }) => {
      const res = await fetch("/api/memories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
      })
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["memories"] })
      setContent("")
      setAgentId("")
    }
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!agentId) return
    createMemoryMutation.mutate({ content, type, agentId })
  }

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Memory Graph</h1>
        <p className="text-slate-600">Track agent interactions and memories</p>
      </div>

      <div className="grid gap-6 mb-8">
        {isLoading ? (
          <p>Loading...</p>
        ) : memories?.length === 0 ? (
          <Card>
            <CardContent className="py-8 text-center">
              <p className="text-slate-600 mb-4">No memories yet. Add your first one below!</p>
            </CardContent>
          </Card>
        ) : (
          memories?.map((memory: any) => (
            <Card key={memory.id}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="p-3 rounded-lg bg-gradient-to-br from-indigo-100 to-violet-100">
                      <MessageSquare className="h-6 w-6 text-violet-600" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">{memory.type}</CardTitle>
                      <CardDescription>
                        {memory.agent.name} • {new Date(memory.createdAt).toLocaleDateString()}
                      </CardDescription>
                    </div>
                  </div>
                  <Link href={`/app/memory/${memory.id}`}>
                    <Button variant="outline">View</Button>
                  </Link>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-slate-600">{memory.content}</p>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Add Memory</CardTitle>
          <CardDescription>Record an agent interaction or thought</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="agent">Agent</Label>
              <select
                id="agent"
                value={agentId}
                onChange={(e) => setAgentId(e.target.value)}
                className="flex h-10 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm ring-offset-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-950 focus-visible:ring-offset-2"
                required
              >
                <option value="">Select an agent...</option>
                {agents?.map((agent: any) => (
                  <option key={agent.id} value={agent.id}>{agent.name}</option>
                ))}
              </select>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="type">Type</Label>
              <select
                id="type"
                value={type}
                onChange={(e) => setType(e.target.value as MemoryType)}
                className="flex h-10 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm ring-offset-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-950 focus-visible:ring-offset-2"
              >
                {memoryTypes.map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="content">Content</Label>
              <textarea
                id="content"
                placeholder="Describe the memory..."
                value={content}
                onChange={(e) => setContent(e.target.value)}
                rows={4}
                className="flex w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm ring-offset-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-950 focus-visible:ring-offset-2"
                required
              />
            </div>

            <Button type="submit" disabled={createMemoryMutation.isPending || !agentId}>
              {createMemoryMutation.isPending ? "Adding..." : "Add Memory"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
