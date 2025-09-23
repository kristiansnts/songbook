import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Input } from '@/components/ui/input'
import { Search, ChevronLeft, ChevronRight, Filter, X } from 'lucide-react'
import { useNavigate, useSearch } from '@tanstack/react-router'
import { useState, useEffect } from 'react'
import { songService } from '@/services/songService'
import { Song, PaginationMeta } from '@/types/song'
import { KEYS } from '@/lib/transpose-utils'
import { cn } from '@/lib/utils'
import { BulkPlaylistDialog } from '@/components/bulk-playlist-dialog'
import { toast } from 'sonner'

export function SongListView() {
  const navigate = useNavigate()
  const search = useSearch({ from: '/_authenticated/user/song/' }) as { artist?: string }
  const [songs, setSongs] = useState<Song[]>([])
  const [pagination, setPagination] = useState<PaginationMeta | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
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
        const filters = {
          page: currentPage,
          limit: 20,
          ...(searchTerm && { search: searchTerm }),
          ...(selectedChord && { base_chord: selectedChord }),
          ...(search.artist && { search: search.artist })
        }
        const response = await songService.getAllSongs(filters)
        setSongs(response.data)
        setPagination(response.pagination)
        setError(null)
      } catch (_err) {
        setError('Failed to load songs')
      } finally {
        setIsLoading(false)
      }
    }

    fetchSongs()
  }, [currentPage, searchTerm, selectedChord, search.artist])

  const handleSongToggle = (songId: number) => {
    const newSelected = new Set(selectedSongs)
    if (newSelected.has(songId)) {
      newSelected.delete(songId)
    } else {
      newSelected.add(songId)
    }
    setSelectedSongs(newSelected)
  }

  // Since filtering is now done server-side, use songs directly
  const filteredSongs = songs

  const handlePrevPage = () => {
    if (pagination?.hasPrevPage) {
      setCurrentPage(prev => prev - 1)
    }
  }

  const handleNextPage = () => {
    if (pagination?.hasNextPage) {
      setCurrentPage(prev => prev + 1)
    }
  }

  const resetPagination = () => {
    setCurrentPage(1)
  }

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
    resetPagination()
  }

  const clearChordFilter = () => {
    setSelectedChord('')
    resetPagination()
  }

  const handleSearchChange = (value: string) => {
    setSearchTerm(value)
    resetPagination()
  }

  const clearSearch = () => {
    setSearchTerm('')
    resetPagination()
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
          {pagination && (
            <p className="text-gray-500 mt-1">
              {pagination.totalItems} song{pagination.totalItems !== 1 ? 's' : ''} total
              {pagination.totalPages > 1 && (
                <span> • Page {pagination.currentPage} of {pagination.totalPages}</span>
              )}
            </p>
          )}
        </div>

      {/* Fixed Search */}
      <div className="px-4 py-4 bg-white border-b space-y-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-5 w-5" />
          <Input
            className="pl-10 pr-10"
            placeholder="Search songs, artists, or lyrics"
            type="text"
            value={searchTerm}
            onChange={(e) => handleSearchChange(e.target.value)}
          />
          {searchTerm && (
            <button
              onClick={clearSearch}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 h-5 w-5 flex items-center justify-center"
            >
              <X className="h-4 w-4" />
            </button>
          )}
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

          {selectedChord && pagination && (
            <p className="text-sm text-gray-600">
              Showing {pagination.totalItems} songs in key <strong>{selectedChord}</strong>
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

        {/* Pagination Controls */}
        {pagination && pagination.totalPages > 1 && (
          <div className="flex justify-center items-center gap-4 py-4 border-t bg-white">
            <Button
              variant="outline"
              size="sm"
              onClick={handlePrevPage}
              disabled={!pagination.hasPrevPage || isLoading}
              className="flex items-center gap-2"
            >
              <ChevronLeft className="h-4 w-4" />
              Previous
            </Button>

            <span className="text-sm text-gray-600">
              Page {pagination.currentPage} of {pagination.totalPages}
            </span>

            <Button
              variant="outline"
              size="sm"
              onClick={handleNextPage}
              disabled={!pagination.hasNextPage || isLoading}
              className="flex items-center gap-2"
            >
              Next
              <ChevronRight className="h-4 w-4" />
            </Button>
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
