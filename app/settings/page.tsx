import { ApiKeyConfig } from "@/components/settings/api-key-config"

export default function SettingsPage() {
  return (
    <main className="min-h-screen bg-background">
      <div className="container py-10">
        <h1 className="text-3xl font-bold mb-6">Settings</h1>
        <div className="space-y-6">
          <ApiKeyConfig />
        </div>
      </div>
    </main>
  )
}
