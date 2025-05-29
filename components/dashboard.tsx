"use client"
import { useUserMusic } from "@/hooks/use-user-music"

const Dashboard = () => {
  const { userMusic, loading, error, refetch } = useUserMusic()

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p>Loading...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-red-600 mb-4">Error: {error}</p>
          <button onClick={refetch} className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
            Retry
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-2xl font-bold mb-4">User Music Dashboard</h1>
      {userMusic && userMusic.length > 0 ? (
        <ul>
          {userMusic.map((music) => (
            <li key={music.id} className="mb-2">
              {music.title} - {music.artist}
            </li>
          ))}
        </ul>
      ) : (
        <p>No music found for this user.</p>
      )}
    </div>
  )
}

export default Dashboard
