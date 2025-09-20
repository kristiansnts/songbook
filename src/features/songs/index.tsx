import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Input } from '@/components/ui/input'
import { Search, ChevronLeft, ChevronRight, Filter, X } from 'lucide-react'
import { useNavigate, useSearch } from '@tanstack/react-router'
import { useState, useEffect } from 'react'
import { songService } from '@/services/songService'
import { Song } from '@/types/song'
import { KEYS } from '@/lib/transpose-utils'
import { cn } from '@/lib/utils'
import { BulkPlaylistDialog } from '@/components/bulk-playlist-dialog'
import { toast } from 'sonner'

export function SongListView() {
  const navigate = useNavigate()
  const search = useSearch({ from: '/_authenticated/user/song/' }) as { artist?: string }
  const [songs, setSongs] = useState<Song[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedSongs, setSelectedSongs] = useState<Set<number>>(new Set())
  const [searchTerm, setSearchTerm] = useState('')
  const [isSelectMode, setIsSelectMode] = useState(false)
  const [selectedChord, setSelectedChord] = useState<string>('')
  const [showChordFilter, setShowChordFilter] = useState(false)
  const [showBulkPlaylistDialog, setShowBulkPlaylistDialog] = useState(false)

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

  // Filter and sort songs based on search term, artist filter, and chord filter
  const filteredSongs = songs
    .filter((song: Song) => {
      // First filter by artist if specified
      if (search.artist && !song.artist.some(artist => artist.toLowerCase() === search.artist?.toLowerCase())) {
        return false
      }

      // Filter by chord if specified
      if (selectedChord && song.base_chord !== selectedChord) {
        return false
      }

      // Then filter by search term (title, artist, and lyrics)
      if (searchTerm) {
        const searchLower = searchTerm.toLowerCase()
        return (
          song.title.toLowerCase().includes(searchLower) ||
          song.artist.some(artist => artist.toLowerCase().includes(searchLower)) ||
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
    if (selectedSongs.size === 0) return
    setShowBulkPlaylistDialog(true)
  }

  const handleBulkPlaylistComplete = (playlistIds: string[], newPlaylistName?: string) => {
    // Clear selection after successful addition
    setSelectedSongs(new Set())
    setIsSelectMode(false)
    
    toast.success(
      `Songs successfully added to ${playlistIds.length} playlist(s)${newPlaylistName ? ` including "${newPlaylistName}"` : ''}`,
      {
        action: {
          label: 'x',
          onClick: () => toast.dismiss()
        }
      }
    )
  }

  // Get selected song objects for the dialog
  const selectedSongObjects = filteredSongs.filter(song => selectedSongs.has(song.id))

  const handleChordFilter = (chord: string) => {
    if (selectedChord === chord) {
      // If same chord is clicked, remove filter
      setSelectedChord('')
    } else {
      // Otherwise, set new chord filter
      setSelectedChord(chord)
    }
  }

  const clearChordFilter = () => {
    setSelectedChord('')
  }

  const toggleChordFilter = () => {
    setShowChordFilter(!showChordFilter)
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
      <div className="px-4 py-4 bg-white border-b space-y-4">
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

        {/* Chord Filter Section */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={toggleChordFilter}
                className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
              >
                <Filter className="h-4 w-4" />
                Filter by Chord
                {selectedChord && (
                  <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs font-medium">
                    {selectedChord}
                  </span>
                )}
              </Button>
            </div>
            {selectedChord && (
              <Button
                variant="ghost"
                size="sm"
                onClick={clearChordFilter}
                className="text-gray-500 hover:text-gray-700 p-1"
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>

          {showChordFilter && (
            <div className="grid grid-cols-6 gap-2">
              {KEYS.map((chord) => (
                <button
                  key={chord}
                  onClick={() => handleChordFilter(chord)}
                  className={cn(
                    "h-8 rounded-md text-sm font-semibold transition-colors",
                    selectedChord === chord
                      ? "bg-blue-500 text-white"
                      : "bg-gray-100 text-gray-800 hover:bg-gray-200"
                  )}
                >
                  {chord}
                </button>
              ))}
            </div>
          )}

          {selectedChord && (
            <p className="text-sm text-gray-600">
              Showing {filteredSongs.length} songs in key <strong>{selectedChord}</strong>
            </p>
          )}
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
                      <div className="flex items-center gap-2 mt-1">
                        <p className="text-gray-500">{song.artist.join(', ')}</p>
                        <span className="bg-gray-100 text-gray-600 px-2 py-1 rounded-full text-xs font-medium">
                          {song.base_chord}
                        </span>
                      </div>
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
                      <div className="flex items-center gap-2 mt-1">
                        <p className="text-gray-500">{song.artist.join(', ')}</p>
                        <span className="bg-gray-100 text-gray-600 px-2 py-1 rounded-full text-xs font-medium">
                          {song.base_chord}
                        </span>
                      </div>
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

      {/* Bulk Playlist Dialog */}
      <BulkPlaylistDialog
        open={showBulkPlaylistDialog}
        onOpenChange={setShowBulkPlaylistDialog}
        songs={selectedSongObjects}
        onAddToPlaylist={handleBulkPlaylistComplete}
      />
    </div>
  )
}
