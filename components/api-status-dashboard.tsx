"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, XCircle, RefreshCw, Activity } from "lucide-react"

interface ServiceStatus {
  name: string
  status: number
  available: boolean
  error?: string
}

interface ApiStatusData {
  configured: boolean
  apiKey?: string
  services?: ServiceStatus[]
  summary?: {
    available: number
    total: number
    percentage: number
  }
  error?: string
}

export function ApiStatusDashboard() {
  const [statusData, setStatusData] = useState<ApiStatusData | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const checkApiStatus = async () => {
    setIsLoading(true)
    try {
      const response = await fetch("/api/rapidapi/test-services")
      const data = await response.json()
      setStatusData(data)
    } catch (error) {
      console.error("Error checking API status:", error)
      setStatusData({
        configured: false,
        error: "Failed to check API status",
      })
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    checkApiStatus()
  }, [])

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Activity className="h-5 w-5" />
          API Services Status
        </CardTitle>
        <CardDescription>Monitor the availability of RapidAPI services</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="text-sm text-muted-foreground">
            {statusData?.configured ? <>API Key: {statusData.apiKey}</> : "No API key configured"}
          </div>
          <Button variant="outline" size="sm" onClick={checkApiStatus} disabled={isLoading}>
            {isLoading ? (
              <>
                <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                Checking...
              </>
            ) : (
              <>
                <RefreshCw className="mr-2 h-4 w-4" />
                Refresh
              </>
            )}
          </Button>
        </div>

        {statusData?.summary && (
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-green-600">{statusData.summary.available}</div>
              <div className="text-sm text-muted-foreground">Available</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-red-600">
                {statusData.summary.total - statusData.summary.available}
              </div>
              <div className="text-sm text-muted-foreground">Unavailable</div>
            </div>
            <div>
              <div className="text-2xl font-bold">{statusData.summary.percentage}%</div>
              <div className="text-sm text-muted-foreground">Uptime</div>
            </div>
          </div>
        )}

        {statusData?.services && (
          <div className="space-y-2">
            <h4 className="font-medium">Service Details</h4>
            {statusData.services.map((service, index) => (
              <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-3">
                  {service.available ? (
                    <CheckCircle className="h-5 w-5 text-green-500" />
                  ) : (
                    <XCircle className="h-5 w-5 text-red-500" />
                  )}
                  <span className="font-medium">{service.name}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant={service.available ? "default" : "destructive"}>
                    {service.available ? "Available" : "Unavailable"}
                  </Badge>
                  {service.error && <span className="text-sm text-muted-foreground">{service.error}</span>}
                </div>
              </div>
            ))}
          </div>
        )}

        {statusData?.error && <div className="p-3 bg-red-50 text-red-700 rounded-lg text-sm">{statusData.error}</div>}
      </CardContent>
    </Card>
  )
}
