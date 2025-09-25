import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Search, ChevronLeft, ChevronRight, X } from 'lucide-react'
import { useNavigate, useSearch } from '@tanstack/react-router'
import { useState, useEffect } from 'react'
import { songService } from '@/services/songService'
import { Song, PaginationMeta } from '@/types/song'
import { KEYS } from '@/lib/transpose-utils'
import { BulkPlaylistDialog } from '@/components/bulk-playlist-dialog'
import { toast } from 'sonner'

export function SongListView() {
  const navigate = useNavigate()
  const search = useSearch({ from: '/_authenticated/user/song/' }) as { artist?: string }
  const [songs, setSongs] = useState<Song[]>([])
  const [_pagination, _setPagination] = useState<PaginationMeta | null>(null)
  const [_currentPage, _setCurrentPage] = useState(1)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedSongs, setSelectedSongs] = useState<Set<number>>(new Set())
  const [searchTerm, setSearchTerm] = useState('')
  const [isSelectMode, setIsSelectMode] = useState(false)
  const [selectedChord, setSelectedChord] = useState<string>('')
  const [showBulkPlaylistDialog, setShowBulkPlaylistDialog] = useState(false)
  const [orderBy, setOrderBy] = useState<'title' | 'base_chord'>('title')

  useEffect(() => {
    const fetchSongs = async () => {
      try {
        setIsLoading(true)
        // For alphabet grouping, fetch all songs with a large limit
        const filters = {
          page: 1,
          limit: 10000, // Large limit to get all songs for proper alphabet grouping
          ...(searchTerm && { search: searchTerm }),
          ...(selectedChord && { base_chord: selectedChord }),
          ...(search.artist && { search: search.artist }),
          sort_by: orderBy,
          sort_order: 'asc' as const
        }
        const response = await songService.getAllSongs(filters)
        setSongs(response.data)
        _setPagination(response.pagination)
        setError(null)
      } catch (_err) {
        setError('Failed to load songs')
      } finally {
        setIsLoading(false)
      }
    }

    fetchSongs()
  }, [searchTerm, selectedChord, search.artist, orderBy]) // Removed currentPage dependency

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

  // Group songs by first letter for alphabet display
  const groupSongs = (songs: Song[], groupBy: 'title' | 'base_chord') => {
    const groups = new Map<string, Song[]>()

    songs.forEach(song => {
      const key = groupBy === 'title'
        ? song.title.charAt(0).toUpperCase()
        : song.base_chord.charAt(0).toUpperCase()

      if (!groups.has(key)) {
        groups.set(key, [])
      }
      groups.get(key)!.push(song)
    })

    // Sort groups by key
    const sortedGroups = Array.from(groups.entries()).sort(([a], [b]) => a.localeCompare(b))
    return sortedGroups
  }

  const groupedSongs = groupSongs(filteredSongs, orderBy)

  const _handlePrevPage = () => {
    // Unused - pagination disabled for alphabet grouping
  }

  const _handleNextPage = () => {
    // Unused - pagination disabled for alphabet grouping
  }

  const resetPagination = () => {
    // No longer needed since we fetch all songs
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

  const handleOrderByChange = (value: 'title' | 'base_chord') => {
    setOrderBy(value)
    resetPagination()
  }

  return (
    <div className="flex flex-col h-screen">
      {/* Fixed Header */}
      <header className="flex justify-between items-center px-4 py-4 border-b bg-background dark:bg-background">
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

       <div className="px-4 pt-6 pb-2 bg-background dark:bg-background">
          <h1 className="text-4xl font-bold">{search.artist || 'Songs'}</h1>
          {songs.length > 0 && (
            <p className="text-muted-foreground mt-1">
              {songs.length} song{songs.length !== 1 ? 's' : ''} total
            </p>
          )}
        </div>

      {/* Fixed Search */}
      <div className="px-4 py-4 bg-background dark:bg-background border-b space-y-4">
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

        {/* Order By and Filter Section - same line */}
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Order by:</span>
            <Select value={orderBy} onValueChange={handleOrderByChange}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="title">Title</SelectItem>
                <SelectItem value="base_chord">Chord</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Chord: </span>
            <Select value={selectedChord || "all"} onValueChange={(value) => handleChordFilter(value === "all" ? '' : value)}>
              <SelectTrigger className="w-32">
                <SelectValue placeholder="All chords" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All chords</SelectItem>
                {KEYS.map((chord) => (
                  <SelectItem key={chord} value={chord}>
                    {chord}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
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
        </div>

        {selectedChord && songs.length > 0 && (
          <p className="text-sm text-muted-foreground">
            Showing {songs.filter(song => song.base_chord === selectedChord).length} songs in key <strong>{selectedChord}</strong>
          </p>
        )}
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
          <div className="space-y-4">
            {groupedSongs.map(([letter, songs]) => (
              <div key={letter}>
                {/* Alphabet Letter Header */}
                <div className="top-0 text-[#960001] py-3 px-4 mb-2 rounded-md font-bold text-xl z-10">
                  {letter}
                </div>

                {/* Songs in this letter group */}
                <div className="space-y-1">
                  {songs.map((song) => (
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
              </div>
            ))}
          </div>
        )}

        {/* Pagination Controls - Disabled for alphabet grouping */}
        {/* {pagination && pagination.totalPages > 1 && (
          <div className="flex justify-center items-center gap-4 py-4 border-t bg-background dark:bg-background">
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

            <span className="text-sm text-muted-foreground">
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
        )} */}
      </main>

      {/* Fixed Bottom Actions - only in select mode */}
      {isSelectMode && (
        <div className="border-t bg-background dark:bg-background px-4 py-4 pb-6 flex justify-between items-center sticky bottom-0 z-10">
          <span className="text-muted-foreground">
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
