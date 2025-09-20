import { Search, User, ChevronLeft, ChevronRight, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useNavigate } from '@tanstack/react-router'
import { useState, useEffect } from 'react'
import { artistService } from '@/services/artist-service'

interface Artist {
  id: number
  name: string
}

export function ArtistView() {
  const navigate = useNavigate()
  const [searchTerm, setSearchTerm] = useState('')
  const [artists, setArtists] = useState<Artist[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchArtists = async () => {
      try {
        setIsLoading(true)
        const data = await artistService.getAllArtists()
        setArtists(data)
        setError(null)
      } catch (_err) {
        setError('Failed to load artists')
      } finally {
        setIsLoading(false)
      }
    }

    fetchArtists()
  }, [])

  const filteredArtists = artists.filter((artist: Artist) =>
    artist.name.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="flex flex-col h-screen">
      {/* Fixed Header */}
      <header className="flex justify-between items-center px-4 py-4 border-b bg-white">
        <div className="flex items-center">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate({ to: '/user/dashboard' })}
            className="mr-2 p-1"
          >
            <ChevronLeft className="h-6 w-6" />
          </Button>
          <span className="text-lg">Library</span>
        </div>
      </header>

      {/* Fixed Title */}
      <div className="px-4 py-6 bg-white">
        <h1 className="text-4xl font-bold">Artists</h1>
      </div>

      {/* Fixed Search */}
      <div className="px-4 pb-4 bg-white border-b">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-5 w-5" />
          <Input
            className="pl-10 pr-10"
            placeholder="Search"
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 h-5 w-5 flex items-center justify-center"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>

      {/* Scrollable List */}
      <main className="flex-1 overflow-y-auto px-4 py-4">
        {isLoading ? (
          <div className="flex justify-center py-8">
            <div className="text-gray-500">Loading artists...</div>
          </div>
        ) : error ? (
          <div className="flex justify-center py-8">
            <div className="text-red-500">Error loading artists</div>
          </div>
        ) : (
          <div className="space-y-1">
            {filteredArtists.map((artist) => (
              <Button
                key={artist.id}
                variant="ghost"
                className="w-full justify-between p-3 h-auto"
                onClick={() => {
                  navigate({ to: '/user/artist/$name', params: { name: encodeURIComponent(artist.name) } })
                }}
              >
                <div className="flex items-center">
                  <User className="text-gray-600 mr-4 h-6 w-6" />
                  <span className="text-lg">{artist.name}</span>
                </div>
                <ChevronRight className="h-5 w-5 text-gray-400" />
              </Button>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}