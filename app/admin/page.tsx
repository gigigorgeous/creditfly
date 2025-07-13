import { redirect } from "next/navigation"
import { createClient } from "@/supabase/server"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default async function AdminDashboardPage() {
  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/") // Redirect to home if not logged in
  }

  // Check if user is admin
  const { data: profile, error } = await supabase.from("profiles").select("is_admin").eq("id", user.id).single()

  if (error || !profile?.is_admin) {
    redirect("/") // Redirect if not admin or error fetching profile
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-4rem)] p-4">
      <Card className="w-full max-w-2xl">
        <CardHeader>
          <CardTitle>Admin Dashboard</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-lg">Welcome, Admin {user.email}!</p>
          <p className="mt-4 text-muted-foreground">
            This is a protected area for administrative tasks. You can add more admin-specific functionalities here.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
