import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export function DashboardContent() {
  return (
    <div className="grid auto-rows-min gap-4 md:grid-cols-2 lg:grid-cols-3">
      <Card>
        <CardHeader>
          <CardTitle>Total Users</CardTitle>
          <CardDescription>Overview of user base.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-4xl font-bold">1,234</div>
          <p className="text-sm text-muted-foreground">+15% from last month</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Revenue</CardTitle>
          <CardDescription>Total earnings this quarter.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-4xl font-bold">$12,345</div>
          <p className="text-sm text-muted-foreground">+8% from last quarter</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Active Projects</CardTitle>
          <CardDescription>Currently ongoing projects.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-4xl font-bold">7</div>
          <p className="text-sm text-muted-foreground">2 new projects started</p>
        </CardContent>
      </Card>
      <Card className="lg:col-span-3">
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
          <CardDescription>Latest actions in your dashboard.</CardDescription>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2">
            <li>User 'John Doe' logged in.</li>
            <li>New project 'Marketing Campaign' created.</li>
            <li>Report 'Q2 Sales' generated.</li>
            <li>User 'Jane Smith' updated profile.</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  )
}
