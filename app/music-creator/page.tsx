import { UnifiedMusicCreator } from "@/components/unified-music-creator"

export const metadata = {
  title: "AI Music Creator - Generate Music & Videos",
  description: "Create original music and music videos with AI",
}

export default function MusicCreatorPage() {
  return (
    <div className="min-h-screen">
      <UnifiedMusicCreator />
    </div>
  )
}
