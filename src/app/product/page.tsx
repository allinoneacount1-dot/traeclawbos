import Navbar from "@/components/Navbar"

export default function ProductPage() {
  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="p-8">
        <div className="container mx-auto">
          <h1 className="text-4xl font-bold mb-4">Product</h1>
          <p className="text-slate-600">Explore our platform features</p>
        </div>
      </main>
    </div>
  )
}
