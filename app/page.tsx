import { ApiKeyBanner } from "@/components/api-key-banner"
import { Header } from "@/components/header"
import { Dashboard } from "@/components/dashboard"

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      <Header />
      <ApiKeyBanner />
      <Dashboard />
    </main>
  )
}
