import { MyMusicLibrary } from "@/components/library/my-music-library"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "My Music - AI Music Generator",
  description: "Manage and organize your AI-generated music collection",
}

export default function MyMusicPage() {
  return (
    <div className="container py-6">
      <MyMusicLibrary />
    </div>
  )
}
