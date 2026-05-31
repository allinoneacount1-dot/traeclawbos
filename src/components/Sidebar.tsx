"use client"

import React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  LayoutDashboard,
  Users,
  Brain,
  Terminal,
  Network,
  BookOpen,
  BarChart3,
  Zap,
  Trophy,
  Swords,
  Shield,
  Vote,
  Settings,
  Bell,
  Wallet,
} from "lucide-react"

export default function Sidebar() {
  const pathname = usePathname()

  const navItems = [
    { href: "/app", label: "Dashboard", icon: LayoutDashboard },
    { href: "/app/organizations", label: "Organizations", icon: Users },
    { href: "/app/agents", label: "Agents", icon: Brain },
    { href: "/app/memory", label: "Memory Graph", icon: Network },
    { href: "/app/knowledge", label: "Knowledge Hub", icon: BookOpen },
    { href: "/app/analytics", label: "Analytics", icon: BarChart3 },
    { href: "/app/automation", label: "Automation", icon: Zap },
    { href: "/app/marketplace", label: "Marketplace", icon: Wallet },
    { href: "/app/arena", label: "Arena", icon: Swords },
    { href: "/app/reputation", label: "Reputation", icon: Trophy },
    { href: "/app/treasury", label: "Treasury", icon: Shield },
    { href: "/app/governance", label: "Governance", icon: Vote },
  ]

  return (
    <div className="border-r border-slate-200 w-64 flex flex-col bg-white h-screen sticky top-0">
      <div className="p-6 border-b border-slate-200">
        <Link href="/app" className="flex items-center gap-2 font-bold text-xl">
          <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600"></div>
          TRAECLAWB
        </Link>
      </div>
      <nav className="flex-1 p-4 space-y-2">
        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
              pathname === item.href
                ? "bg-slate-100 text-slate-900"
                : "text-slate-600 hover:bg-slate-50"
            }`}
          >
            <item.icon className="h-5 w-5" />
            {item.label}
          </Link>
        ))}
      </nav>
      <div className="p-4 border-t border-slate-200 space-y-2">
        <Link
          href="/app/notifications"
          className="flex items-center gap-3 px-3 py-2 rounded-lg text-slate-600 hover:bg-slate-50 transition-colors"
        >
          <Bell className="h-5 w-5" />
          Notifications
        </Link>
        <Link
          href="/app/settings"
          className="flex items-center gap-3 px-3 py-2 rounded-lg text-slate-600 hover:bg-slate-50 transition-colors"
        >
          <Settings className="h-5 w-5" />
          Settings
        </Link>
      </div>
    </div>
  )
}
