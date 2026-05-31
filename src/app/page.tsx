"use client"

import Navbar from "@/components/Navbar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Brain, Users, Zap, BarChart3, Shield, BookOpen } from "lucide-react"
import Link from "next/link"

export default function Home() {
  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="flex-1">
        <section className="w-full py-24">
          <div className="container mx-auto px-6">
            <div className="flex flex-col items-center text-center gap-8">
              <div className="inline-flex items-center gap-2 rounded-full bg-blue-50 px-4 py-1.5 text-sm text-blue-700">
                <Zap className="h-4 w-4" />
                Autonomous Organization Operating System
              </div>
              <h1 className="max-w-4xl text-5xl md:text-7xl font-bold tracking-tight">
                Every Token Deserves a Brain.
              </h1>
              <p className="max-w-2xl text-lg text-slate-600">
                Transform any Solana project into a self-operating autonomous organization powered by AI agents that collaborate, learn, and automate your work.
              </p>
              <div className="flex flex-wrap justify-center gap-4">
            <Link href="/app">
              <Button className="h-12 px-8 text-base">Launch App</Button>
            </Link>
            <Link href="/product">
              <Button variant="outline" className="h-12 px-8 text-base">Learn More</Button>
            </Link>
          </div>
            </div>
          </div>
        </section>

        <section className="w-full py-24 bg-slate-50">
          <div className="container mx-auto px-6">
            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
              <Card>
                <CardHeader>
                  <Users className="h-10 w-10 text-blue-500 mb-2" />
                  <CardTitle>Organizations</CardTitle>
                  <CardDescription>Create and manage your autonomous organization with a complete AI team.</CardDescription>
                </CardHeader>
              </Card>
              <Card>
                <CardHeader>
                  <Brain className="h-10 w-10 text-purple-500 mb-2" />
                  <CardTitle>AI Agents</CardTitle>
                  <CardDescription>Deploy specialized agents for research, marketing, community, treasury, and more.</CardDescription>
                </CardHeader>
              </Card>
              <Card>
                <CardHeader>
                  <BookOpen className="h-10 w-10 text-green-500 mb-2" />
                  <CardTitle>Knowledge Hub</CardTitle>
                  <CardDescription>Upload documents, whitepapers, and build a semantic knowledge base for your agents.</CardDescription>
                </CardHeader>
              </Card>
              <Card>
                <CardHeader>
                  <BarChart3 className="h-10 w-10 text-orange-500 mb-2" />
                  <CardTitle>Analytics</CardTitle>
                  <CardDescription>Track metrics, agent performance, and organization health in real-time.</CardDescription>
                </CardHeader>
              </Card>
              <Card>
                <CardHeader>
                  <Zap className="h-10 w-10 text-yellow-500 mb-2" />
                  <CardTitle>Automation</CardTitle>
                  <CardDescription>Build visual workflows to automate operations and trigger agent actions.</CardDescription>
                </CardHeader>
              </Card>
              <Card>
                <CardHeader>
                  <Shield className="h-10 w-10 text-red-500 mb-2" />
                  <CardTitle>Security</CardTitle>
                  <CardDescription>Wallet signature verification, role-based access, and audit logs for everything.</CardDescription>
                </CardHeader>
              </Card>
            </div>
          </div>
        </section>
      </main>
    </div>
  )
}
