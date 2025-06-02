import { MusicLibrary } from "@/components/library/music-library"

export default function LibraryPage() {
  return (
    <div className="container py-6">
      <div className="flex flex-col space-y-2 mb-6">
        <h1 className="text-3xl font-bold tracking-tight">Music Library</h1>
        <p className="text-muted-foreground">Browse and manage your AI-generated music collection</p>
      </div>

      <MusicLibrary />
    </div>
  )
}
