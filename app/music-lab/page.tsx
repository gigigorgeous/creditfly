import { AdvancedMusicGenerator } from "@/components/advanced-music-generator"
import { MusicAnalytics } from "@/components/music-analytics"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default function MusicLabPage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Music Lab</h1>
          <p className="text-muted-foreground text-lg">
            Professional AI music generation with advanced features and analytics
          </p>
        </div>

        <Tabs defaultValue="generator" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="generator">Music Generator</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>

          <TabsContent value="generator" className="mt-6">
            <AdvancedMusicGenerator />
          </TabsContent>

          <TabsContent value="analytics" className="mt-6">
            <MusicAnalytics />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
