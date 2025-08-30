import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Input } from '@/components/ui/input'
import { Search, ChevronLeft, ChevronRight } from 'lucide-react'
import { useNavigate, useSearch } from '@tanstack/react-router'
import { useState, useEffect } from 'react'
import { songService } from '@/services/songService'
import { Song } from '@/types/song'

export function SongListView() {
  const navigate = useNavigate()
  const search = useSearch({ from: '/_authenticated/user/song/' }) as { artist?: string }
  const [songs, setSongs] = useState<Song[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedSongs, setSelectedSongs] = useState<Set<number>>(new Set())
  const [searchTerm, setSearchTerm] = useState('')
  const [isSelectMode, setIsSelectMode] = useState(false)

  useEffect(() => {
    const fetchSongs = async () => {
      try {
        setIsLoading(true)
        const data = await songService.getAllSongs()
        setSongs(data)
        setError(null)
      } catch (_err) {
        setError('Failed to load songs')
      } finally {
        setIsLoading(false)
      }
    }

    fetchSongs()
  }, [])

  const handleSongToggle = (songId: number) => {
    const newSelected = new Set(selectedSongs)
    if (newSelected.has(songId)) {
      newSelected.delete(songId)
    } else {
      newSelected.add(songId)
    }
    setSelectedSongs(newSelected)
  }

  // Helper function to strip HTML tags from lyrics
  const stripHtmlTags = (html: string) => {
    return html.replace(/<[^>]*>/g, '').replace(/&[^;]+;/g, '')
  }

  // Filter and sort songs based on search term and artist filter
  const filteredSongs = songs
    .filter((song: Song) => {
      // First filter by artist if specified
      if (search.artist && song.artist.toLowerCase() !== search.artist.toLowerCase()) {
        return false
      }
      
      // Then filter by search term (title, artist, and lyrics)
      if (searchTerm) {
        const searchLower = searchTerm.toLowerCase()
        return (
          song.title.toLowerCase().includes(searchLower) ||
          song.artist.toLowerCase().includes(searchLower) ||
          stripHtmlTags(song.lyrics_and_chords || '').toLowerCase().includes(searchLower)
        )
      }
      
      return true
    })
    .sort((a, b) => a.title.toLowerCase().localeCompare(b.title.toLowerCase()))

  const handleSelectAll = () => {
    if (selectedSongs.size === filteredSongs.length) {
      setSelectedSongs(new Set())
    } else {
      setSelectedSongs(new Set(filteredSongs.map(song => song.id)))
    }
  }

  const handleBackToLibrary = () => {
    navigate({ to: '/user/dashboard' })
  }

  const handleSelectMode = () => {
    setIsSelectMode(true)
  }

  const handleDone = () => {
    // Navigate back with selected songs or return to browse mode
    setIsSelectMode(false)
  }

  const handleAddToPlaylist = () => {
    // Handle add to playlist action
    // TODO: Implement playlist functionality
  }

  return (
    <div className="flex flex-col h-screen">
      {/* Fixed Header */}
      <header className="flex justify-between items-center px-4 py-4 border-b bg-white">
        {!isSelectMode ? (
          <>
            <div className="flex items-center">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleBackToLibrary}
                className="mr-2 p-1"
              >
                <ChevronLeft className="h-6 w-6" />
              </Button>
              <span className="text-lg">{search.artist ? 'Artists' : 'Library'}</span>
            </div>
            <Button variant="ghost" size="sm" onClick={handleSelectMode}>
              Select
            </Button>
          </>
        ) : (
          <>
             <>
            <div className="flex items-center">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleBackToLibrary}
                className="mr-2 p-1"
              >
                <ChevronLeft className="h-6 w-6" />
              </Button>
              <span className="text-lg">{search.artist ? 'Artists' : 'Library'}</span>
            </div>
            <Button variant="ghost" onClick={handleDone} className="text-blue-500">
              Done
            </Button>
          </>
          </>
        )}
      </header>

       <div className="px-4 py-6 bg-white">
          <h1 className="text-4xl font-bold">{search.artist || 'Songs'}</h1>
          {search.artist && (
            <p className="text-gray-500 mt-1">{filteredSongs.length} song{filteredSongs.length !== 1 ? 's' : ''}</p>
          )}
        </div>

      {/* Fixed Search */}
      <div className="px-4 py-4 bg-white border-b">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-5 w-5" />
          <Input
            className="pl-10"
            placeholder="Search songs, artists, or lyrics"
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Scrollable Song List */}
      <main className="flex-1 overflow-y-auto px-4 py-4">
        {isLoading ? (
          <div className="flex justify-center py-8">
            <div className="text-gray-500">Loading songs...</div>
          </div>
        ) : error ? (
          <div className="flex justify-center py-8">
            <div className="text-red-500">Error loading songs</div>
          </div>
        ) : (
          <div className="space-y-1">
            {filteredSongs.map((song) => (
              <div key={song.id}>
                {isSelectMode ? (
                  <div className="flex items-center space-x-3 px-3 py-3">
                    <Checkbox
                      checked={selectedSongs.has(song.id)}
                      onCheckedChange={() => handleSongToggle(song.id)}
                    />
                    <div className="flex-1 text-left">
                      <h3 className="text-lg font-medium">{song.title}</h3>
                    </div>
                  </div>
                ) : (
                  <Button
                    variant="ghost"
                    className="w-full justify-between p-3 h-auto"
                    onClick={() => {
                      navigate({ to: '/user/song/$id', params: { id: String(song.id) } })
                    }}
                  >
                    <div className="flex-1 text-left">
                      <h3 className="text-lg font-medium">{song.title}</h3>
                      <p className="text-gray-500">{song.artist}</p>
                    </div>
                    <ChevronRight className="h-5 w-5 text-gray-400" />
                  </Button>
                )}
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Fixed Bottom Actions - only in select mode */}
      {isSelectMode && (
        <div className="border-t bg-white px-4 py-4 pb-6 flex justify-between items-center sticky bottom-0 z-10">
          <span className="text-gray-600">
            {selectedSongs.size} song{selectedSongs.size !== 1 ? 's' : ''} selected
          </span>
          <div className="flex space-x-3">
            <Button variant="ghost" onClick={handleSelectAll} className="text-blue-500">
              {selectedSongs.size === filteredSongs.length && filteredSongs.length > 0 ? 'Deselect All' : 'Select All'}
            </Button>
            <Button 
              onClick={handleAddToPlaylist}
              disabled={selectedSongs.size === 0}
              className="bg-black text-white hover:bg-gray-800 disabled:bg-gray-300"
            >
              Add to Playlist
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
