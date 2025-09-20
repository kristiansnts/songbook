import { Search, List, User, Plus, Music, Users, ChevronRight, Loader2, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { useNavigate } from '@tanstack/react-router'
import { useEffect, useState, useCallback } from 'react'
import { playlistService } from '@/services/playlist-service'
import { Playlist } from '@/types/playlist'
import { toast } from 'sonner'
import { useAuth } from '@/lib/auth'
import { songService } from '@/services/songService'
import { ArtistService } from '@/services/artist-service'
import { TagService, Tag } from '@/services/tagService'
import { Song } from '@/types/song'

export default function Library() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [playlists, setPlaylists] = useState<Playlist[]>([])
  const [playlistsLoading, setPlaylistsLoading] = useState(true)
  const [createDialogOpen, setCreateDialogOpen] = useState(false)
  const [playlistName, setPlaylistName] = useState('')
  const [creating, setCreating] = useState(false)
  const [songCount, setSongCount] = useState(0)
  const [searchTerm, setSearchTerm] = useState('')
  const [searchResults, setSearchResults] = useState<{
    songs: Song[]
    artists: { id: number; name: string }[]
    tags: Tag[]
  }>({ songs: [], artists: [], tags: [] })
  const [isSearching, setIsSearching] = useState(false)
  
  const songs = [
    { id: 1, type: 'all', label: 'All songs', count: songCount, icon: List },
    { id: 2, type: 'artists', label: 'Artists', icon: User },
  ]

  const performSearch = useCallback(async (query: string) => {
    if (!query.trim()) {
      setSearchResults({ songs: [], artists: [], tags: [] })
      setIsSearching(false)
      return
    }

    setIsSearching(true)
    try {
      const artistService = new ArtistService()
      const [songsResult, artistsResult, tagsResult] = await Promise.all([
        songService.searchSongs(query),
        artistService.getAllArtists(),
        TagService.searchTags({ search: query, limit: 20 })
      ])

      // Filter artists by name containing the query
      const filteredArtists = artistsResult.filter((artist: { id: number; name: string }) =>
        artist.name.toLowerCase().includes(query.toLowerCase())
      )

      setSearchResults({
        songs: songsResult,
        artists: filteredArtists,
        tags: tagsResult
      })
    } catch (error) {
      console.error('Error performing search:', error)
      setSearchResults({ songs: [], artists: [], tags: [] })
    } finally {
      setIsSearching(false)
    }
  }, [])

  const loadSongCount = async () => {
    try {
      const allSongs = await songService.getAllSongs({ limit: 1000 })
      setSongCount(allSongs.length)
    } catch (error) {
      console.error('Error loading song count:', error)
      setSongCount(0)
    }
  }

  useEffect(() => {
    loadPlaylists()
    loadSongCount()
  }, [])

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      performSearch(searchTerm)
    }, 300) // Debounce search by 300ms

    return () => clearTimeout(timeoutId)
  }, [searchTerm, performSearch])

  const loadPlaylists = async () => {
    try {
      setPlaylistsLoading(true)
      const playlistsData = await playlistService.getAllPlaylists()
      setPlaylists(playlistsData)
    } catch (error) {
      console.error('Error loading playlists:', error)
      // Fallback to empty array on error
      setPlaylists([])
    } finally {
      setPlaylistsLoading(false)
    }
  }

  const handleCreatePlaylist = async () => {
    if (!playlistName.trim()) {
      toast.error('Please enter a playlist name')
      return
    }

    try {
      setCreating(true)
      const newPlaylist = await playlistService.createPlaylist({
        playlist_name: playlistName.trim(),
        access_type: 'private'
      })
      
      // Reload playlists to show the new one
      await loadPlaylists()
      // Also refresh song count in case it changed
      await loadSongCount()
      
      toast.success('Playlist created successfully', {
        action: {
          label: 'x',
          onClick: () => toast.dismiss()
        }
      })
      
      // Reset and close dialog
      setPlaylistName('')
      setCreateDialogOpen(false)
      
      // Navigate to the new playlist
      navigate({ to: '/user/playlist/$id', params: { id: newPlaylist.id.toString() } })
    } catch (error) {
      toast.error('Failed to create playlist', {
        action: {
          label: 'x',
          onClick: () => toast.dismiss()
        }
      })
    } finally {
      setCreating(false)
    }
  }

  const handleOpenCreateDialog = () => {
    setPlaylistName('')
    setCreateDialogOpen(true)
  }

  const handleCloseCreateDialog = () => {
    setPlaylistName('')
    setCreateDialogOpen(false)
  }

  // Check if user is a verified member (peserta with verifikasi = '1')
  // Don't show badge for owned playlists - only for shared/joined playlists
  const isVerifiedMember = user?.userType === 'peserta' && user?.verifikasi === '1'

  // Filter playlists based on search term
  const filteredPlaylists = playlists.filter(playlist =>
    playlist.name.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="container mx-auto px-4 py-6">
      <header className="flex justify-between items-center mb-6">
        <h1 className="text-4xl font-bold">Library</h1>
      </header>

      <div className="relative mb-8">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-5 w-5" />
        <Input
          className="pl-10 pr-10"
          placeholder="Song, tag, artist, or playlist"
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

      <main>
        {searchTerm ? (
          // Search Results View
          <div>
            {isSearching ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin mr-2" />
                <span className="text-gray-500">Searching...</span>
              </div>
            ) : (
              <div className="space-y-6">
                {/* Songs Section */}
                {searchResults.songs.length > 0 && (
                  <section>
                    <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">
                      Songs ({searchResults.songs.length})
                    </h2>
                    <div className="space-y-1">
                      {searchResults.songs.slice(0, 10).map((song) => (
                        <Button
                          key={song.id}
                          variant="ghost"
                          className="w-full justify-between p-3 h-auto text-left"
                          onClick={() => navigate({ to: '/user/song/view/$id', params: { id: song.id.toString() } })}
                        >
                          <div className="flex items-center min-w-0 flex-1">
                            <Music className="text-gray-600 mr-4 h-6 w-6 flex-shrink-0" />
                            <div className="min-w-0 flex-1">
                              <div className="text-lg font-medium truncate">{song.title}</div>
                              <div className="text-sm text-gray-500 truncate">{song.artist}</div>
                            </div>
                          </div>
                          <ChevronRight className="h-5 w-5 text-gray-400 flex-shrink-0" />
                        </Button>
                      ))}
                    </div>
                  </section>
                )}

                {/* Artists Section */}
                {searchResults.artists.length > 0 && (
                  <section>
                    <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">
                      Artists ({searchResults.artists.length})
                    </h2>
                    <div className="space-y-1">
                      {searchResults.artists.slice(0, 10).map((artist) => (
                        <Button
                          key={artist.id}
                          variant="ghost"
                          className="w-full justify-between p-3 h-auto"
                          onClick={() => navigate({ to: '/user/artist/$name', params: { name: artist.name } })}
                        >
                          <div className="flex items-center">
                            <User className="text-gray-600 mr-4 h-6 w-6" />
                            <span className="text-lg">{artist.name}</span>
                          </div>
                          <ChevronRight className="h-5 w-5 text-gray-400" />
                        </Button>
                      ))}
                    </div>
                  </section>
                )}

                {/* Tags Section */}
                {searchResults.tags.length > 0 && (
                  <section>
                    <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">
                      Tags ({searchResults.tags.length})
                    </h2>
                    <div className="space-y-1">
                      {searchResults.tags.slice(0, 10).map((tag) => (
                        <Button
                          key={tag.id}
                          variant="ghost"
                          className="w-full justify-start p-3 h-auto"
                          onClick={() => navigate({ to: '/user/song', search: { tag: tag.name } })}
                        >
                          <div className="flex items-center">
                            <Badge variant="outline" className="mr-4">
                              {tag.name}
                            </Badge>
                          </div>
                        </Button>
                      ))}
                    </div>
                  </section>
                )}

                {/* Playlists Section */}
                {filteredPlaylists.length > 0 && (
                  <section>
                    <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">
                      Playlists ({filteredPlaylists.length})
                    </h2>
                    <div className="space-y-1">
                      {filteredPlaylists.map((playlist) => (
                        <Button
                          key={playlist.id}
                          variant="ghost"
                          className="w-full justify-between p-3 h-auto"
                          onClick={() => navigate({ to: '/user/playlist/$id', params: { id: playlist.id.toString() } })}
                        >
                          <div className="flex items-center">
                            <Music className="text-gray-600 mr-4 h-6 w-6" />
                            <span className="text-lg">{playlist.name}</span>
                          </div>
                          <div className="flex items-center">
                            <span className="text-gray-500 mr-2">{playlist.songCount}</span>
                            {isVerifiedMember && playlist.access_type !== 'owner' && (
                              <Badge className="bg-blue-500 text-white hover:bg-blue-600 mr-2">
                                Member
                              </Badge>
                            )}
                            <ChevronRight className="h-5 w-5 text-gray-400" />
                          </div>
                        </Button>
                      ))}
                    </div>
                  </section>
                )}

                {/* No Results */}
                {searchResults.songs.length === 0 &&
                 searchResults.artists.length === 0 &&
                 searchResults.tags.length === 0 &&
                 filteredPlaylists.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    <Music className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                    <p className="text-lg font-medium">No results found</p>
                    <p className="text-sm">Try searching with different keywords</p>
                  </div>
                )}
              </div>
            )}
          </div>
        ) : (
          // Default Library View
          <div>
            <section className="mb-8">
              <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">
                Songs
              </h2>
              <div className="space-y-1">
                {songs.map((song) => {
                  const IconComponent = song.icon
                  return (
                    <Button
                      key={song.id}
                      variant="ghost"
                      className="w-full justify-between p-3 h-auto"
                      onClick={() => {
                        if (song.type === 'artists') {
                          navigate({ to: '/user/artist' })
                        }
                        if (song.type === 'all') {
                          navigate({ to: '/user/song' })
                        }
                      }}
                    >
                      <div className="flex items-center">
                        <IconComponent className="text-gray-600 mr-4 h-6 w-6" />
                        <span className="text-lg">{song.label}</span>
                      </div>
                      <div className="flex items-center">
                        {song.count && (
                          <span className="text-gray-500 mr-2">{song.count}</span>
                        )}
                        <ChevronRight className="h-5 w-5 text-gray-400" />
                      </div>
                    </Button>
                  )
                })}
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">
                Playlists
              </h2>
              <div className="space-y-1">
                {playlistsLoading ? (
                  <div className="flex items-center justify-center py-4">
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    <span className="text-gray-500">Loading playlists...</span>
                  </div>
                ) : playlists.length === 0 ? (
                  <div className="text-center py-4 text-gray-500">
                    No playlists found
                  </div>
                ) : (
                  playlists.map((playlist) => (
                    <Button
                      key={playlist.id}
                      variant="ghost"
                      className="w-full justify-between p-3 h-auto"
                      onClick={() => navigate({ to: '/user/playlist/$id', params: { id: playlist.id.toString() } })}
                    >
                      <div className="flex items-center">
                        <Music className="text-gray-600 mr-4 h-6 w-6" />
                        <span className="text-lg">{playlist.name}</span>
                      </div>
                      <div className="flex items-center">
                        <span className="text-gray-500 mr-2">{playlist.songCount}</span>
                        {isVerifiedMember && playlist.access_type !== 'owner' && (
                          <Badge className="bg-blue-500 text-white hover:bg-blue-600 mr-2">
                            Member
                          </Badge>
                        )}
                        <ChevronRight className="h-5 w-5 text-gray-400" />
                      </div>
                    </Button>
                  ))
                )}
                <Button
                  variant="ghost"
                  className="w-full justify-start p-3 h-auto"
                  onClick={handleOpenCreateDialog}
                >
                  <Plus className="text-gray-600 mr-4 h-6 w-6" />
                  <span className="text-lg">New playlist</span>
                </Button>
              </div>
            </section>
          </div>
        )}
      </main>

      {/* Create Playlist Dialog */}
      <Dialog open={createDialogOpen} onOpenChange={handleCloseCreateDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Create New Playlist</DialogTitle>
            <DialogDescription>
              Enter a name for your new playlist
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <Input
              id="playlistName"
              placeholder="Playlist name"
              value={playlistName}
              onChange={(e) => setPlaylistName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !creating) {
                  handleCreatePlaylist()
                }
              }}
              disabled={creating}
              autoFocus
            />
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={handleCloseCreateDialog}
              disabled={creating}
            >
              Cancel
            </Button>
            <Button
              onClick={handleCreatePlaylist}
              disabled={creating || !playlistName.trim()}
            >
              {creating ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Creating...
                </>
              ) : (
                'Create Playlist'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}