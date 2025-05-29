import { ApiKeyConfig } from "@/components/api-key-config"
import { ApiStatusDashboard } from "@/components/api-status-dashboard"

export default function SettingsPage() {
  return (
    <div className="container relative">
      <div className="space-y-6">
        <ApiKeyConfig />
        <ApiStatusDashboard />
      </div>
    </div>
  )
}
