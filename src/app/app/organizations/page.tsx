"use client"

import React, { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Plus, Users } from "lucide-react"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import Link from "next/link"

export default function OrganizationsPage() {
  const [name, setName] = useState("")
  const [tokenAddress, setTokenAddress] = useState("")
  const queryClient = useQueryClient()

  const { data: organizations = [], isLoading } = useQuery({
    queryKey: ["organizations"],
    queryFn: async () => {
      // Temporary: we'll add auth later
      return []
    },
  })

  const createOrgMutation = useMutation({
    mutationFn: async (data: { name: string; tokenAddress?: string }) => {
      const res = await fetch("/api/organizations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })
      if (!res.ok) throw new Error("Failed to create organization")
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["organizations"] })
      setName("")
      setTokenAddress("")
    },
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    createOrgMutation.mutate({ name, tokenAddress })
  }

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">Organizations</h1>
          <p className="text-slate-600">Create and manage your autonomous organizations</p>
        </div>
      </div>

      <div className="grid gap-6 mb-8">
        {isLoading ? (
          <p>Loading organizations...</p>
        ) : organizations?.length === 0 ? (
          <Card>
            <CardContent className="py-8 text-center">
              <p className="text-slate-600 mb-4">No organizations yet. Create your first one below!</p>
            </CardContent>
          </Card>
        ) : (
          organizations?.map((org: any) => (
            <Card key={org.id}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Users className="h-5 w-5" />
                      {org.name}
                    </CardTitle>
                    {org.tokenAddress && (
                      <CardDescription>Token: {org.tokenAddress.slice(0, 8)}...</CardDescription>
                    )}
                  </div>
                  <Link href={`/app/organizations/${org.id}`}>
            <Button variant="outline">View</Button>
          </Link>
                </div>
              </CardHeader>
            </Card>
          ))
        )}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Create New Organization</CardTitle>
          <CardDescription>Set up your autonomous organization with AI agents</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Organization Name</Label>
              <Input
                id="name"
                placeholder="My Awesome DAO"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="token">Token Address (Optional)</Label>
              <Input
                id="token"
                placeholder="So11111111111111111111111111111111111111112"
                value={tokenAddress}
                onChange={(e) => setTokenAddress(e.target.value)}
              />
            </div>
            <Button type="submit" disabled={createOrgMutation.isPending}>
              {createOrgMutation.isPending ? "Creating..." : "Create Organization"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
