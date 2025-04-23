import { Suspense } from "react"
import FirewallDashboard from "@/components/firewall-dashboard"
import { LoadingSpinner } from "@/components/ui/loading-spinner"

export default function Home() {
  return (
    <main className="container mx-auto p-4 md:p-6">
      <h1 className="text-3xl font-bold mb-6">Unified Firewall Management</h1>
      <Suspense fallback={<LoadingSpinner />}>
        <FirewallDashboard />
      </Suspense>
    </main>
  )
}
