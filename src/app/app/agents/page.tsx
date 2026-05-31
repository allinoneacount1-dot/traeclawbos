"use client"

import React, { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Brain, Users } from "lucide-react"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import Link from "next/link"

// Define agent types
const agentTypes = [
  "CEO",
  "RESEARCH",
  "MARKETING",
  "COMMUNITY",
  "TREASURY",
  "SECURITY",
  "ANALYTICS",
  "GROWTH"
] as const

type AgentType = typeof agentTypes[number]

export default function AgentsPage() {
  const [name, setName] = useState("")
  const [type, setType] = useState<AgentType>("CEO")
  const [goal, setGoal] = useState("")
  const [organizationId, setOrganizationId] = useState("")
  const queryClient = useQueryClient()

  // Fetch organizations first for dropdown
  const { data: organizations = [] } = useQuery({
    queryKey: ["organizations"],
    queryFn: async () => {
      // Temporary: we'll add auth later
      return []
    }
  })

  const { data: agents = [], isLoading } = useQuery({
    queryKey: ["agents"],
    queryFn: async () => {
      // Temporary: we'll add auth and org selection later
      return []
    }
  })

  const createAgentMutation = useMutation({
    mutationFn: async (data: {
      name: string
      type: AgentType
      goal?: string
      organizationId?: string
    }) => {
      const res = await fetch("/api/agents", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
      })
      if (!res.ok) throw new Error("Failed to create agent")
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["agents"] })
      setName("")
      setGoal("")
      setOrganizationId("")
    }
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    createAgentMutation.mutate({
      name,
      type,
      goal: goal || undefined,
      organizationId: organizationId || undefined
    })
  }

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Agents</h1>
        <p className="text-slate-600">Create and manage your AI agents</p>
      </div>

      <div className="grid gap-6 mb-8">
        {isLoading ? (
          <p>Loading agents...</p>
        ) : agents?.length === 0 ? (
          <Card>
            <CardContent className="py-8 text-center">
              <p className="text-slate-600 mb-4">No agents yet. Create your first one below!</p>
            </CardContent>
          </Card>
        ) : (
          agents?.map((agent: any) => (
            <Card key={agent.id}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="p-3 rounded-lg bg-gradient-to-br from-blue-100 to-purple-100">
                      <Brain className="h-6 w-6 text-purple-600" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">{agent.name}</CardTitle>
                      <CardDescription>
                        {agent.type}
                        {agent.organization && ` • ${agent.organization.name}`}
                      </CardDescription>
                    </div>
                  </div>
                  <Link href={`/app/agents/${agent.id}`}>
                    <Button variant="outline">View</Button>
                  </Link>
                </div>
              </CardHeader>
              {agent.goal && (
                <CardContent>
                  <p className="text-slate-600">{agent.goal}</p>
                </CardContent>
              )}
            </Card>
          ))
        )}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Create New Agent</CardTitle>
          <CardDescription>Add an AI agent to your team</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Agent Name</Label>
              <Input
                id="name"
                placeholder="e.g., Alice - Marketing Agent"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="type">Agent Type</Label>
              <select
                id="type"
                value={type}
                onChange={(e) => setType(e.target.value as AgentType)}
                className="flex h-10 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm ring-offset-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-950 focus-visible:ring-offset-2"
              >
                {agentTypes.map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="goal">Goal (Optional)</Label>
              <Input
                id="goal"
                placeholder="e.g., Grow Twitter followers by 20% this month"
                value={goal}
                onChange={(e) => setGoal(e.target.value)}
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
                  <option key={org.id} value={org.id}>
                    {org.name}
                  </option>
                ))}
              </select>
            </div>

            <Button type="submit" disabled={createAgentMutation.isPending}>
              {createAgentMutation.isPending ? "Creating..." : "Create Agent"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
