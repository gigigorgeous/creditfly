import { createClient } from "@/supabase/server"
import Auth from "@/components/auth"
import Profile from "@/components/profile"
import VoiceMusicGenerator from "@/components/voice-music-generator" // Updated import
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default async function HomePage() {
  const supabase = createClient()
  const {
    data: { session },
  } = await supabase.auth.getSession()

  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-4rem)] p-4">
      {!session ? (
        <Auth />
      ) : (
        <div className="w-full max-w-4xl space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Welcome to MusicGen!</CardTitle>
            </CardHeader>
            <CardContent>
              <p>Start generating unique music from your text or voice prompts.</p>
            </CardContent>
          </Card>
          <VoiceMusicGenerator userId={session.user.id} /> {/* Updated component */}
          <Profile session={session} />
        </div>
      )}
    </div>
  )
}
