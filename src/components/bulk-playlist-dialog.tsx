import React, { useState, useEffect } from 'react'
import { playlistService } from '@/services/playlist-service'
import { Playlist } from '@/types/playlist'
import { Song } from '@/types/song'
import { Plus, Music, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { useAuth } from '@/lib/auth'
import {
  canCreatePlaylist,
  canAddSongsToPlaylist,
  getSongLimitMessage,
} from '@/lib/plan-limits'
import { KEYS } from '@/lib/transpose-utils'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { UpgradeModal } from '@/components/modals/UpgradeModal'
import { SongsService } from '@/features/songs/services/songs-service'

interface BulkPlaylistDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  songs: Song[]
  onAddToPlaylist: (playlistIds: string[], newPlaylistName?: string) => void
}

export function BulkPlaylistDialog({
  open,
  onOpenChange,
  songs,
  onAddToPlaylist,
}: BulkPlaylistDialogProps) {
  const { user } = useAuth()
  const [playlists, setPlaylists] = useState<Playlist[]>([])
  const [loading, setLoading] = useState(false)
  const [selectedPlaylists, setSelectedPlaylists] = useState<Set<string>>(
    new Set()
  )
  const [newPlaylistName, setNewPlaylistName] = useState('')
  const [showNewPlaylistInput, setShowNewPlaylistInput] = useState(false)
  const [selectedChord, setSelectedChord] = useState<string>('')
  const [useCustomChord, setUseCustomChord] = useState<boolean>(false)
  const [upgradeModalOpen, setUpgradeModalOpen] = useState(false)
  const [upgradeReason, setUpgradeReason] = useState<
    'playlist-limit' | 'song-limit'
  >('playlist-limit')
  const [upgradeMessage, setUpgradeMessage] = useState<string>('')

  useEffect(() => {
    if (open) {
      loadPlaylists()
      setSelectedChord('') // No default chord - use original chords
      setUseCustomChord(false) // Default to using original chords
    }
  }, [open])

  const loadPlaylists = async () => {
    try {
      setLoading(true)
      // Only load playlists where the user is the owner
      const playlistsData = await playlistService.getOwnerPlaylists()
      setPlaylists(playlistsData)
    } catch (err) {
      toast.error('Failed to load playlists', {
        action: {
          label: 'x',
          onClick: () => toast.dismiss(),
        },
      })
      // eslint-disable-next-line no-console
      console.error('Error loading playlists:', err)
      // Fallback to mock data on error - but only owner playlists
      setPlaylists([
        { id: '1', name: 'My Favorites', songCount: 12, access_type: 'owner' },
        { id: '2', name: 'Worship Songs', songCount: 8, access_type: 'owner' },
        {
          id: '3',
          name: 'Christmas Carols',
          songCount: 15,
          access_type: 'owner',
        },
      ])
    } finally {
      setLoading(false)
    }
  }

  const handlePlaylistToggle = (playlistId: string) => {
    const newSelected = new Set(selectedPlaylists)
    if (newSelected.has(playlistId)) {
      newSelected.delete(playlistId)
    } else {
      newSelected.add(playlistId)
    }
    setSelectedPlaylists(newSelected)
  }

  const handleAddToExistingPlaylists = async () => {
    if (!songs.length || selectedPlaylists.size === 0) return

    try {
      setLoading(true)
      const songIds = songs.map((song) => song.id)
      const selectedPlaylistIds = Array.from(selectedPlaylists)

      // Add songs to each selected playlist
      for (const playlistId of selectedPlaylistIds) {
        const success = await SongsService.addMultipleSongsToPlaylist(
          songIds,
          playlistId,
          useCustomChord ? selectedChord : undefined // Only use custom chord if enabled
        )

        if (!success) {
          throw new Error(`Failed to add songs to playlist ${playlistId}`)
        }
      }

      const chordMessage = useCustomChord
        ? ` with chord ${selectedChord}`
        : ' with their original chords'
      toast.success(
        `${songs.length} songs added to ${selectedPlaylistIds.length} playlist(s)${chordMessage}`,
        {
          action: {
            label: 'x',
            onClick: () => toast.dismiss(),
          },
        }
      )

      // Call parent callback for UI updates
      onAddToPlaylist(selectedPlaylistIds)

      // Reset state
      setSelectedPlaylists(new Set())
      setSelectedChord('')
      setUseCustomChord(false)
      onOpenChange(false)
    } catch (err: any) {
      if (err.name === 'PLAN_LIMIT_EXCEEDED') {
        setUpgradeMessage(err.message)
        setUpgradeReason('song-limit')
        setUpgradeModalOpen(true)
        onOpenChange(false)
      } else {
        toast.error('Failed to add songs to playlist', {
          action: {
            label: 'x',
            onClick: () => toast.dismiss(),
          },
        })
      }
      // eslint-disable-next-line no-console
      console.error('Error adding to playlist:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleCreateNewPlaylist = async () => {
    if (!newPlaylistName.trim()) return

    // Check playlist limit before creating
    if (!canCreatePlaylist(user, playlists.length)) {
      setUpgradeMessage(
        'Silahkan hubungi LevelUp kota Kalian untuk menjadi Squad agar mendapatkan benefit 25 playlist terbuka, dan menjadi Core untuk menerima seluruh manfaat SongBank.'
      )
      setUpgradeReason('playlist-limit')
      setUpgradeModalOpen(true)
      onOpenChange(false)
      return
    }

    try {
      setLoading(true)

      await playlistService.createPlaylist({
        playlist_name: newPlaylistName.trim(),
      })

      toast.success(`New playlist "${newPlaylistName.trim()}" created`, {
        action: {
          label: 'x',
          onClick: () => toast.dismiss(),
        },
      })

      // Reset only the create playlist form, keep modal open
      setNewPlaylistName('')
      setShowNewPlaylistInput(false)

      // Reload playlists to show the newly created one
      await loadPlaylists()
    } catch (err: any) {
      if (err.name === 'PLAN_LIMIT_EXCEEDED') {
        setUpgradeMessage(err.message)
        setUpgradeReason('playlist-limit')
        setUpgradeModalOpen(true)
        onOpenChange(false)
      } else {
        toast.error('Failed to create playlist', {
          action: {
            label: 'x',
            onClick: () => toast.dismiss(),
          },
        })
      }
      // eslint-disable-next-line no-console
      console.error('Error creating playlist:', err)
    } finally {
      setLoading(false)
    }
  }

  const canAddToExistingPlaylists =
    selectedPlaylists.size > 0 &&
    (!useCustomChord || selectedChord.trim() !== '')

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='max-w-md'>
        <DialogHeader>
          <DialogTitle className='flex items-center gap-2'>
            <Music className='h-5 w-5' />
            Add {songs.length} Songs to Playlist
          </DialogTitle>
        </DialogHeader>

        <div className='space-y-4'>
          {/* Selected Songs Summary */}
          <div className='bg-muted max-h-32 overflow-y-auto rounded-lg p-3'>
            <div className='text-foreground mb-2 text-sm font-medium'>
              Selected Songs ({songs.length}):
            </div>
            <div className='space-y-1'>
              {songs.slice(0, 3).map((song) => (
                <div key={song.id} className='text-muted-foreground text-xs'>
                  • {song.title} -{' '}
                  {Array.isArray(song.artist)
                    ? song.artist.join(', ')
                    : song.artist}
                </div>
              ))}
              {songs.length > 3 && (
                <div className='text-muted-foreground text-xs italic'>
                  ... and {songs.length - 3} more songs
                </div>
              )}
            </div>
          </div>

          {/* Chord Selector */}
          <div className='space-y-3'>
            <div className='flex items-center space-x-3'>
              <Checkbox
                checked={useCustomChord}
                onCheckedChange={(checked) => {
                  setUseCustomChord(!!checked)
                  if (!checked) {
                    setSelectedChord('')
                  }
                }}
              />
              <h4 className='text-foreground text-sm font-medium'>
                Override base chord for all songs
              </h4>
            </div>

            {useCustomChord && (
              <div className='space-y-2'>
                <Select value={selectedChord} onValueChange={setSelectedChord}>
                  <SelectTrigger className='w-[180px]'>
                    <SelectValue placeholder='Select key' />
                  </SelectTrigger>
                  <SelectContent>
                    {KEYS.map((key) => (
                      <SelectItem key={key} value={key}>
                        {key}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {selectedChord && (
                  <p className='text-muted-foreground text-xs'>
                    Selected chord: <strong>{selectedChord}</strong> (will
                    override all songs' original chords)
                  </p>
                )}
              </div>
            )}

            {!useCustomChord && (
              <p className='text-muted-foreground text-xs'>
                Songs will be added with their original base chords
              </p>
            )}
          </div>

          <div className='space-y-3'>
            <h4 className='text-foreground text-sm font-medium'>
              Select existing playlists:
            </h4>

            {loading ? (
              <div className='flex items-center justify-center py-4'>
                <Loader2 className='h-4 w-4 animate-spin' />
                <span className='text-muted-foreground ml-2 text-sm'>
                  Loading playlists...
                </span>
              </div>
            ) : playlists.length === 0 ? (
              <div className='text-muted-foreground py-2 text-sm'>
                There are no playlists you own
              </div>
            ) : (
              playlists.map((playlist) => {
                const songLimitMsg = getSongLimitMessage(
                  user,
                  playlist.songCount || 0
                )
                const canAddSong = canAddSongsToPlaylist(
                  user,
                  playlist.songCount || 0
                )

                return (
                  <div
                    key={playlist.id}
                    className='flex items-center space-x-3'
                  >
                    <Checkbox
                      checked={selectedPlaylists.has(playlist.id)}
                      onCheckedChange={() => handlePlaylistToggle(playlist.id)}
                      disabled={!canAddSong}
                    />
                    <div className='flex-1'>
                      <div className='flex items-center gap-2'>
                        <p className='text-foreground text-sm font-medium'>
                          {playlist.name}
                        </p>
                        {songLimitMsg && !canAddSong && (
                          <Badge variant='destructive' className='text-xs'>
                            Full
                          </Badge>
                        )}
                      </div>
                      <p className='text-muted-foreground text-xs'>
                        {songLimitMsg || `${playlist.songCount} songs`}
                      </p>
                    </div>
                  </div>
                )
              })
            )}
          </div>

          <div className='border-t pt-4'>
            {!showNewPlaylistInput ? (
              <Button
                variant='outline'
                onClick={() => {
                  // Check playlist limit before showing input
                  if (!canCreatePlaylist(user, playlists.length)) {
                    setUpgradeMessage(
                      'Silahkan hubungi LevelUp kota Kalian untuk menjadi Squad agar mendapatkan benefit 25 playlist terbuka, dan menjadi Core untuk menerima seluruh manfaat SongBank.'
                    )
                    setUpgradeReason('playlist-limit')
                    setUpgradeModalOpen(true)
                    return
                  }
                  setShowNewPlaylistInput(true)
                }}
                className='flex w-full items-center gap-2'
              >
                <Plus className='h-4 w-4' />
                Create New Playlist
              </Button>
            ) : (
              <div className='space-y-2'>
                <Input
                  placeholder='Enter playlist name'
                  value={newPlaylistName}
                  onChange={(e) => setNewPlaylistName(e.target.value)}
                  className='w-full'
                />
                <div className='flex gap-2'>
                  <Button
                    variant='ghost'
                    size='sm'
                    onClick={() => {
                      setShowNewPlaylistInput(false)
                      setNewPlaylistName('')
                    }}
                  >
                    Cancel
                  </Button>
                  <Button
                    size='sm'
                    onClick={handleCreateNewPlaylist}
                    disabled={!newPlaylistName.trim() || loading}
                  >
                    {loading ? (
                      <>
                        <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                        Creating...
                      </>
                    ) : (
                      'Create'
                    )}
                  </Button>
                </div>
              </div>
            )}
          </div>

          <div className='flex gap-3 pt-4'>
            <Button
              variant='ghost'
              onClick={() => onOpenChange(false)}
              className='flex-1'
            >
              Cancel
            </Button>
            <Button
              onClick={handleAddToExistingPlaylists}
              disabled={!canAddToExistingPlaylists || loading}
              className='flex-1'
            >
              {loading ? (
                <>
                  <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                  Adding...
                </>
              ) : (
                `Add to ${selectedPlaylists.size} Playlist${selectedPlaylists.size > 1 ? 's' : ''}`
              )}
            </Button>
          </div>
        </div>
      </DialogContent>

      {/* Upgrade Modal */}
      <UpgradeModal
        open={upgradeModalOpen}
        onOpenChange={setUpgradeModalOpen}
        message={upgradeMessage}
        reason={upgradeReason}
      />
    </Dialog>
  )
}
