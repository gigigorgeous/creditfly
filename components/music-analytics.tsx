"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts"
import { Music, TrendingUp, Clock, Zap } from "lucide-react"

interface AnalyticsData {
  totalTracks: number
  totalDuration: number
  genreDistribution: { genre: string; count: number; color: string }[]
  providerStats: { provider: string; count: number; successRate: number }[]
  recentActivity: { date: string; tracks: number }[]
  popularMoods: { mood: string; count: number }[]
}

export function MusicAnalytics() {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchAnalytics()
  }, [])

  const fetchAnalytics = async () => {
    try {
      // In a real app, this would fetch from your analytics API
      // For now, we'll use mock data
      const mockData: AnalyticsData = {
        totalTracks: 42,
        totalDuration: 5040, // in seconds
        genreDistribution: [
          { genre: "Pop", count: 15, color: "#8884d8" },
          { genre: "Rock", count: 12, color: "#82ca9d" },
          { genre: "Electronic", count: 8, color: "#ffc658" },
          { genre: "Hip Hop", count: 5, color: "#ff7300" },
          { genre: "Jazz", count: 2, color: "#00ff00" },
        ],
        providerStats: [
          { provider: "Suno", count: 25, successRate: 92 },
          { provider: "Udio", count: 10, successRate: 88 },
          { provider: "MusicGen", count: 5, successRate: 85 },
          { provider: "Basic", count: 2, successRate: 100 },
        ],
        recentActivity: [
          { date: "2024-01-01", tracks: 3 },
          { date: "2024-01-02", tracks: 5 },
          { date: "2024-01-03", tracks: 2 },
          { date: "2024-01-04", tracks: 7 },
          { date: "2024-01-05", tracks: 4 },
          { date: "2024-01-06", tracks: 6 },
          { date: "2024-01-07", tracks: 8 },
        ],
        popularMoods: [
          { mood: "Happy", count: 18 },
          { mood: "Energetic", count: 12 },
          { mood: "Calm", count: 8 },
          { mood: "Dark", count: 4 },
        ],
      }

      setAnalytics(mockData)
    } catch (error) {
      console.error("Error fetching analytics:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    return `${hours}h ${minutes}m`
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (!analytics) {
    return <div className="text-center p-8 text-muted-foreground">Failed to load analytics data</div>
  }

  return (
    <div className="space-y-6">
      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Music className="h-8 w-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground">Total Tracks</p>
                <p className="text-2xl font-bold">{analytics.totalTracks}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Clock className="h-8 w-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground">Total Duration</p>
                <p className="text-2xl font-bold">{formatDuration(analytics.totalDuration)}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <TrendingUp className="h-8 w-8 text-purple-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground">This Week</p>
                <p className="text-2xl font-bold">
                  {analytics.recentActivity.reduce((sum, day) => sum + day.tracks, 0)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Zap className="h-8 w-8 text-orange-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground">Success Rate</p>
                <p className="text-2xl font-bold">
                  {Math.round(
                    analytics.providerStats.reduce((sum, p) => sum + p.successRate * p.count, 0) /
                      analytics.providerStats.reduce((sum, p) => sum + p.count, 0),
                  )}
                  %
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Genre Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Genre Distribution</CardTitle>
            <CardDescription>Your music preferences by genre</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={analytics.genreDistribution}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ genre, count }) => `${genre}: ${count}`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="count"
                >
                  {analytics.genreDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>Tracks generated over the last 7 days</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={analytics.recentActivity}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="tracks" fill="#8884d8" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Provider Stats */}
      <Card>
        <CardHeader>
          <CardTitle>AI Provider Performance</CardTitle>
          <CardDescription>Success rates and usage statistics by provider</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {analytics.providerStats.map((provider) => (
              <div key={provider.provider} className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <Badge variant="outline">{provider.provider}</Badge>
                  <span className="text-sm text-muted-foreground">{provider.count} tracks</span>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="w-32">
                    <Progress value={provider.successRate} className="h-2" />
                  </div>
                  <span className="text-sm font-medium">{provider.successRate}%</span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Popular Moods */}
      <Card>
        <CardHeader>
          <CardTitle>Popular Moods</CardTitle>
          <CardDescription>Most frequently used moods in your music</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {analytics.popularMoods.map((mood) => (
              <div key={mood.mood} className="text-center">
                <div className="text-2xl font-bold text-primary">{mood.count}</div>
                <div className="text-sm text-muted-foreground">{mood.mood}</div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
