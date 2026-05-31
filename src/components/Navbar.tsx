"use client"

import React from "react"
import { Button } from "@/components/ui/button"
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui"
import Link from "next/link"

export default function Navbar() {
  return (
    <nav className="border-b border-slate-200 px-6 py-4">
      <div className="flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 font-bold text-xl">
          <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600"></div>
          TRAECLAWB OS
        </Link>
        <div className="hidden md:flex items-center gap-6">
          <Link href="/product" className="text-slate-600 hover:text-slate-900 transition-colors">Product</Link>
          <Link href="/solutions" className="text-slate-600 hover:text-slate-900 transition-colors">Solutions</Link>
          <Link href="/agents" className="text-slate-600 hover:text-slate-900 transition-colors">Agents</Link>
          <Link href="/marketplace" className="text-slate-600 hover:text-slate-900 transition-colors">Marketplace</Link>
          <Link href="/developers" className="text-slate-600 hover:text-slate-900 transition-colors">Developers</Link>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/app">
            <Button variant="outline">Launch App</Button>
          </Link>
          <WalletMultiButton />
        </div>
      </div>
    </nav>
  )
}
