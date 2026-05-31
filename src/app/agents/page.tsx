import Navbar from "@/components/Navbar"

export default function AgentsPage() {
  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="p-8">
        <div className="container mx-auto">
          <h1 className="text-4xl font-bold mb-4">Agents</h1>
          <p className="text-slate-600">Meet our AI agents</p>
        </div>
      </main>
    </div>
  )
}
