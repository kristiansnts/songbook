import { useEffect, useState, useCallback } from 'react'
import { useNavigate } from '@tanstack/react-router'
import { ArtistService } from '@/services/artist-service'
import { playlistService } from '@/services/playlist-service'
import { songService } from '@/services/songService'
import { TagService, Tag } from '@/services/tagService'
import { Playlist } from '@/types/playlist'
import { Song } from '@/types/song'
import {
  Search,
  List,
  User,
  Plus,
  Music,
  Users,
  ChevronRight,
  Loader2,
  X,
} from 'lucide-react'
import { toast } from 'sonner'
import { useAuth } from '@/lib/auth'
import { canCreatePlaylist, getPlaylistLimitMessage } from '@/lib/plan-limits'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { UpgradeModal } from '@/components/modals/UpgradeModal'

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
  const [upgradeModalOpen, setUpgradeModalOpen] = useState(false)
  const [upgradeReason, setUpgradeReason] = useState<
    'playlist-limit' | 'song-limit'
  >('playlist-limit')
  const [upgradeMessage, setUpgradeMessage] = useState<string>('')

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
        TagService.searchTags({ search: query, limit: 20 }),
      ])

      // Filter artists by name containing the query
      const filteredArtists = artistsResult.filter(
        (artist: { id: number; name: string }) =>
          artist.name.toLowerCase().includes(query.toLowerCase())
      )

      setSearchResults({
        songs: songsResult.data,
        artists: filteredArtists,
        tags: tagsResult,
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
      // Make minimal API call to get total count from pagination
      const response = await songService.getAllSongs({ page: 1, limit: 1 })
      setSongCount(response.pagination.totalItems)
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
        access_type: 'private',
      })

      // Reload playlists to show the new one
      await loadPlaylists()
      // Also refresh song count in case it changed
      await loadSongCount()

      toast.success('Playlist created successfully', {
        action: {
          label: 'x',
          onClick: () => toast.dismiss(),
        },
      })

      // Reset and close dialog
      setPlaylistName('')
      setCreateDialogOpen(false)

      // Navigate to the new playlist
      navigate({
        to: '/user/playlist/$id',
        params: { id: newPlaylist.id.toString() },
      })
    } catch (error: any) {
      if (error.name === 'PLAN_LIMIT_EXCEEDED') {
        setUpgradeMessage(error.message)
        setUpgradeReason('playlist-limit')
        setUpgradeModalOpen(true)
        setCreateDialogOpen(false)
      } else {
        toast.error('Failed to create playlist', {
          action: {
            label: 'x',
            onClick: () => toast.dismiss(),
          },
        })
      }
    } finally {
      setCreating(false)
    }
  }

  const handleOpenCreateDialog = () => {
    // Check if user can create playlist before opening dialog
    if (!canCreatePlaylist(user, playlists.length)) {
      setUpgradeMessage(
        `Silahkan hubungi LevelUp kota Kalian untuk menjadi Squad agar mendapatkan benefit 25 playlist terbuka, dan menjadi Core untuk menerima seluruh manfaat SongBank.`
      )
      setUpgradeReason('playlist-limit')
      setUpgradeModalOpen(true)
      return
    }

    setPlaylistName('')
    setCreateDialogOpen(true)
  }

  const handleCloseCreateDialog = () => {
    setPlaylistName('')
    setCreateDialogOpen(false)
  }

  // Check if user is a verified member (peserta with verifikasi = '1')
  // Don't show badge for owned playlists - only for shared/joined playlists
  const isVerifiedMember =
    user?.userType === 'peserta' && user?.verifikasi === '1'

  // Filter playlists based on search term
  const filteredPlaylists = playlists.filter((playlist) =>
    playlist.name.toLowerCase().includes(searchTerm.toLowerCase())
  )

  // Get playlist limit message for display
  const playlistLimitMsg = getPlaylistLimitMessage(user, playlists.length)
  const isAtPlaylistLimit = !canCreatePlaylist(user, playlists.length)

  return (
    <div className='container mx-auto px-4 py-6'>
      <header className='mb-6 flex items-center justify-between'>
        <h1 className='text-4xl font-bold'>Library</h1>
      </header>

      <div className='relative mb-8'>
        <Search className='absolute top-1/2 left-3 h-5 w-5 -translate-y-1/2 text-gray-400' />
        <Input
          className='pr-10 pl-10'
          placeholder='Song, tag, artist, or playlist'
          type='text'
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        {searchTerm && (
          <button
            onClick={() => setSearchTerm('')}
            className='absolute top-1/2 right-3 flex h-5 w-5 -translate-y-1/2 items-center justify-center text-gray-400 hover:text-gray-600'
          >
            <X className='h-4 w-4' />
          </button>
        )}
      </div>

      <main>
        {searchTerm ? (
          // Search Results View
          <div>
            {isSearching ? (
              <div className='flex items-center justify-center py-8'>
                <Loader2 className='mr-2 h-6 w-6 animate-spin' />
                <span className='text-gray-500'>Searching...</span>
              </div>
            ) : (
              <div className='space-y-6'>
                {/* Songs Section */}
                {searchResults.songs.length > 0 && (
                  <section>
                    <h2 className='mb-3 text-sm font-semibold tracking-wider text-gray-500 uppercase'>
                      Songs ({searchResults.songs.length})
                    </h2>
                    <div className='space-y-1'>
                      {searchResults.songs.slice(0, 10).map((song) => (
                        <Button
                          key={song.id}
                          variant='ghost'
                          className='h-auto w-full justify-between p-3 text-left'
                          onClick={() =>
                            navigate({
                              to: '/user/song/view/$id',
                              params: { id: song.id.toString() },
                            })
                          }
                        >
                          <div className='flex min-w-0 flex-1 items-center'>
                            <Music className='mr-4 h-6 w-6 flex-shrink-0 text-gray-600' />
                            <div className='min-w-0 flex-1'>
                              <div className='truncate text-lg font-medium'>
                                {song.title}
                              </div>
                              <div className='truncate text-sm text-gray-500'>
                                {song.artist}
                              </div>
                            </div>
                          </div>
                          <ChevronRight className='h-5 w-5 flex-shrink-0 text-gray-400' />
                        </Button>
                      ))}
                    </div>
                  </section>
                )}

                {/* Artists Section */}
                {searchResults.artists.length > 0 && (
                  <section>
                    <h2 className='mb-3 text-sm font-semibold tracking-wider text-gray-500 uppercase'>
                      Artists ({searchResults.artists.length})
                    </h2>
                    <div className='space-y-1'>
                      {searchResults.artists.slice(0, 10).map((artist) => (
                        <Button
                          key={artist.id}
                          variant='ghost'
                          className='h-auto w-full justify-between p-3'
                          onClick={() =>
                            navigate({
                              to: '/user/artist/$name',
                              params: { name: artist.name },
                            })
                          }
                        >
                          <div className='flex min-w-0 flex-1 items-center'>
                            <User className='mr-4 h-6 w-6 flex-shrink-0 text-gray-600' />
                            <span className='truncate text-lg'>
                              {artist.name}
                            </span>
                          </div>
                          <ChevronRight className='ml-2 h-5 w-5 flex-shrink-0 text-gray-400' />
                        </Button>
                      ))}
                    </div>
                  </section>
                )}

                {/* Tags Section */}
                {searchResults.tags.length > 0 && (
                  <section>
                    <h2 className='mb-3 text-sm font-semibold tracking-wider text-gray-500 uppercase'>
                      Tags ({searchResults.tags.length})
                    </h2>
                    <div className='space-y-1'>
                      {searchResults.tags.slice(0, 10).map((tag) => (
                        <Button
                          key={tag.id}
                          variant='ghost'
                          className='h-auto w-full justify-start p-3'
                          onClick={() =>
                            navigate({
                              to: '/user/song',
                              search: { tag: tag.name },
                            })
                          }
                        >
                          <div className='flex items-center'>
                            <Badge variant='outline' className='mr-4'>
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
                    <h2 className='mb-3 text-sm font-semibold tracking-wider text-gray-500 uppercase'>
                      Playlists ({filteredPlaylists.length})
                    </h2>
                    <div className='space-y-1'>
                      {filteredPlaylists.map((playlist) => (
                        <Button
                          key={playlist.id}
                          variant='ghost'
                          className='h-auto w-full justify-between p-3'
                          onClick={() =>
                            navigate({
                              to: '/user/playlist/$id',
                              params: { id: playlist.id.toString() },
                            })
                          }
                        >
                          <div className='flex min-w-0 flex-1 items-center'>
                            <Music className='mr-4 h-6 w-6 flex-shrink-0 text-gray-600' />
                            <span className='truncate text-lg'>
                              {playlist.name}
                            </span>
                          </div>
                          <div className='ml-2 flex flex-shrink-0 items-center'>
                            <span className='mr-2 text-gray-500'>
                              {playlist.songCount}
                            </span>
                            {isVerifiedMember &&
                              playlist.access_type !== 'owner' && (
                                <Badge className='mr-2 bg-blue-500 text-white hover:bg-blue-600'>
                                  Member
                                </Badge>
                              )}
                            <ChevronRight className='h-5 w-5 text-gray-400' />
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
                    <div className='py-8 text-center text-gray-500'>
                      <Music className='mx-auto mb-4 h-12 w-12 text-gray-300' />
                      <p className='text-lg font-medium'>No results found</p>
                      <p className='text-sm'>
                        Try searching with different keywords
                      </p>
                    </div>
                  )}
              </div>
            )}
          </div>
        ) : (
          // Default Library View
          <div>
            <section className='mb-8'>
              <h2 className='mb-3 text-sm font-semibold tracking-wider text-gray-500 uppercase'>
                Songs
              </h2>
              <div className='space-y-1'>
                {songs.map((song) => {
                  const IconComponent = song.icon
                  return (
                    <Button
                      key={song.id}
                      variant='ghost'
                      className='h-auto w-full justify-between p-3'
                      onClick={() => {
                        if (song.type === 'artists') {
                          navigate({ to: '/user/artist' })
                        }
                        if (song.type === 'all') {
                          navigate({ to: '/user/song' })
                        }
                      }}
                    >
                      <div className='flex items-center'>
                        <IconComponent className='mr-4 h-6 w-6 text-gray-600' />
                        <span className='text-lg'>{song.label}</span>
                      </div>
                      <div className='flex items-center'>
                        {song.count && (
                          <span className='mr-2 text-gray-500'>
                            {song.count}
                          </span>
                        )}
                        <ChevronRight className='h-5 w-5 text-gray-400' />
                      </div>
                    </Button>
                  )
                })}
              </div>
            </section>

            <section className='mb-8'>
              <div className='mb-3 flex items-center justify-between'>
                <h2 className='text-sm font-semibold tracking-wider text-gray-500 uppercase'>
                  Playlists
                </h2>
                {playlistLimitMsg && (
                  <Badge
                    variant={isAtPlaylistLimit ? 'destructive' : 'outline'}
                    className='text-xs'
                  >
                    {playlistLimitMsg}
                  </Badge>
                )}
              </div>
              <div className='space-y-1'>
                {playlistsLoading ? (
                  <div className='flex items-center justify-center py-4'>
                    <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                    <span className='text-gray-500'>Loading playlists...</span>
                  </div>
                ) : playlists.length === 0 ? (
                  <div className='py-4 text-center text-gray-500'>
                    No playlists found
                  </div>
                ) : (
                  playlists.map((playlist) => (
                    <Button
                      key={playlist.id}
                      variant='ghost'
                      className='h-auto w-full justify-between p-3'
                      onClick={() =>
                        navigate({
                          to: '/user/playlist/$id',
                          params: { id: playlist.id.toString() },
                        })
                      }
                    >
                      <div className='flex min-w-0 flex-1 items-center'>
                        <Music className='mr-4 h-6 w-6 flex-shrink-0 text-gray-600' />
                        <span className='truncate text-lg'>
                          {playlist.name}
                        </span>
                      </div>
                      <div className='ml-2 flex flex-shrink-0 items-center'>
                        <span className='mr-2 text-gray-500'>
                          {playlist.songCount}
                        </span>
                        {isVerifiedMember &&
                          playlist.access_type !== 'owner' && (
                            <Badge className='mr-2 bg-blue-500 text-white hover:bg-blue-600'>
                              Member
                            </Badge>
                          )}
                        <ChevronRight className='h-5 w-5 text-gray-400' />
                      </div>
                    </Button>
                  ))
                )}
                <Button
                  variant='ghost'
                  className='h-auto w-full justify-start p-3'
                  onClick={handleOpenCreateDialog}
                  disabled={isAtPlaylistLimit}
                >
                  <Plus className='mr-4 h-6 w-6 text-gray-600' />
                  <span className='text-lg'>
                    {isAtPlaylistLimit
                      ? 'Playlist limit reached'
                      : 'New playlist'}
                  </span>
                </Button>
              </div>
            </section>
          </div>
        )}
      </main>

      {/* Create Playlist Dialog */}
      <Dialog open={createDialogOpen} onOpenChange={handleCloseCreateDialog}>
        <DialogContent className='sm:max-w-md'>
          <DialogHeader>
            <DialogTitle>Create New Playlist</DialogTitle>
            <DialogDescription>
              Enter a name for your new playlist
            </DialogDescription>
          </DialogHeader>
          <div className='grid gap-4 py-4'>
            <Input
              id='playlistName'
              placeholder='Playlist name'
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
              variant='outline'
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
                  <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                  Creating...
                </>
              ) : (
                'Create Playlist'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Upgrade Modal */}
      <UpgradeModal
        open={upgradeModalOpen}
        onOpenChange={setUpgradeModalOpen}
        message={upgradeMessage}
        reason={upgradeReason}
      />
    </div>
  )
}
