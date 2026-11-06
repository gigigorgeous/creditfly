import Link from "next/link"
import { MusicStudio } from "@/components/music-studio"

export default function MusicStudioPage() {
  return (
    <div className="min-h-screen bg-[#0a0a0f]">
      <div className="flex justify-end border-b border-purple-900/30 px-4 py-3">
        <Link href="/daw" className="rounded-md border border-purple-500/50 px-4 py-2 text-sm font-medium text-purple-200 hover:bg-purple-500/10">
          Open MIDI Workstation
        </Link>
      </div>
      <MusicStudio />
    </div>
  )
}
