import React, { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Checkbox } from '@/components/ui/checkbox'
import { Plus, Music, Loader2 } from 'lucide-react'
import { Song } from '@/types/song'
import { Playlist } from '@/types/playlist'
import { playlistService } from '@/services/playlist-service'
import { toast } from 'sonner'
import { KEYS } from '@/lib/transpose-utils'
import { cn } from '@/lib/utils'

interface PlaylistDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  song?: Song
  onAddToPlaylist: (playlistIds: string[], newPlaylistName?: string) => void
}

export function PlaylistDialog({ open, onOpenChange, song, onAddToPlaylist }: PlaylistDialogProps) {
  const [playlists, setPlaylists] = useState<Playlist[]>([])
  const [loading, setLoading] = useState(false)
  const [selectedPlaylists, setSelectedPlaylists] = useState<Set<string>>(new Set())
  const [newPlaylistName, setNewPlaylistName] = useState('')
  const [showNewPlaylistInput, setShowNewPlaylistInput] = useState(false)
  const [selectedChord, setSelectedChord] = useState<string>('')
  const [useCustomChord, setUseCustomChord] = useState<boolean>(false)

  useEffect(() => {
    if (open) {
      loadPlaylists()
      // Initialize selected chord to song's base chord, but don't use custom chord by default
      setSelectedChord(song?.base_chord || 'C')
      setUseCustomChord(false) // Default to using original chord
    }
  }, [open, song])

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
          onClick: () => toast.dismiss()
        }
      })
      // eslint-disable-next-line no-console
      console.error('Error loading playlists:', err)
      // Fallback to mock data on error - but only owner playlists
      setPlaylists([
        { id: '1', name: 'My Favorites', songCount: 12, access_type: 'owner' },
        { id: '2', name: 'Worship Songs', songCount: 8, access_type: 'owner' },
        { id: '3', name: 'Christmas Carols', songCount: 15, access_type: 'owner' },
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
    if (!song || selectedPlaylists.size === 0) return
    
    try {
      setLoading(true)
      const songId = parseInt(song.id.toString(), 10)
      const selectedPlaylistIds = Array.from(selectedPlaylists)
      
      for (const playlistId of selectedPlaylistIds) {
        const chordToUse = useCustomChord ? selectedChord : song?.base_chord || 'C'
        await playlistService.addSongToPlaylistWithChord(playlistId, songId, chordToUse)
      }
      
      const chordMessage = useCustomChord ? selectedChord : song?.base_chord || 'C'
      toast.success(`Song added to ${selectedPlaylistIds.length} playlist(s) with chord ${chordMessage}`, {
        action: {
          label: 'x',
          onClick: () => toast.dismiss()
        }
      })
      
      // Call parent callback for UI updates
      onAddToPlaylist(selectedPlaylistIds)
      
      // Reset state
      setSelectedPlaylists(new Set())
      setSelectedChord('')
      setUseCustomChord(false)
      onOpenChange(false)
    } catch (err) {
      toast.error('Failed to add song to playlist', {
        action: {
          label: 'x',
          onClick: () => toast.dismiss()
        }
      })
      // eslint-disable-next-line no-console
      console.error('Error adding to playlist:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleCreateNewPlaylist = async () => {
    if (!newPlaylistName.trim()) return
    
    try {
      setLoading(true)
      
      await playlistService.createPlaylist({
        playlist_name: newPlaylistName.trim()
      })
      
      toast.success(`New playlist "${newPlaylistName.trim()}" created`, {
        action: {
          label: 'x',
          onClick: () => toast.dismiss()
        }
      })
      
      // Reset only the create playlist form, keep modal open
      setNewPlaylistName('')
      setShowNewPlaylistInput(false)
      
      // Reload playlists to show the newly created one
      await loadPlaylists()
    } catch (err) {
      toast.error('Failed to create playlist', {
        action: {
          label: 'x',
          onClick: () => toast.dismiss()
        }
      })
      // eslint-disable-next-line no-console
      console.error('Error creating playlist:', err)
    } finally {
      setLoading(false)
    }
  }

  const canAddToExistingPlaylists = selectedPlaylists.size > 0 && (!useCustomChord || selectedChord.trim() !== '')

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Music className="h-5 w-5" />
            Add to Playlist
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          {song && (
            <div className="bg-muted rounded-lg p-3">
              <h3 className="font-medium text-foreground">{song.title}</h3>
              <p className="text-sm text-muted-foreground">{Array.isArray(song.artist) ? song.artist.join(', ') : song.artist}</p>
              <p className="text-xs text-muted-foreground mt-1">Original Key: {song.base_chord}</p>
            </div>
          )}

          {/* Chord Selector */}
          <div className="space-y-3">
            <div className="flex items-center space-x-3">
              <Checkbox
                checked={useCustomChord}
                onCheckedChange={(checked) => {
                  setUseCustomChord(!!checked)
                  if (!checked) {
                    setSelectedChord(song?.base_chord || 'C')
                  }
                }}
              />
              <h4 className="text-sm font-medium text-foreground">Override base chord</h4>
            </div>
            
            {useCustomChord && (
              <>
                <div className="grid grid-cols-6 gap-2">
                  {KEYS.map((key) => (
                    <button
                      key={key}
                      onClick={() => setSelectedChord(key)}
                      className={cn(
                        "h-8 w-8 rounded-lg text-sm font-semibold transition-colors",
                        selectedChord === key
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted text-muted-foreground hover:bg-muted/80"
                      )}
                    >
                      {key}
                    </button>
                  ))}
                </div>
                <p className="text-xs text-muted-foreground">
                  Selected chord: <strong>{selectedChord}</strong> 
                  {selectedChord !== song?.base_chord && song?.base_chord && (
                    <span> (transposed from {song.base_chord})</span>
                  )}
                </p>
              </>
            )}
            
            {!useCustomChord && (
              <p className="text-xs text-muted-foreground">
                Song will be added with its original chord: <strong>{song?.base_chord || 'C'}</strong>
              </p>
            )}
          </div>

          <div className="space-y-3">
            <h4 className="text-sm font-medium text-foreground">Select existing playlists:</h4>
            
            {loading ? (
              <div className="flex items-center justify-center py-4">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span className="ml-2 text-sm text-muted-foreground">Loading playlists...</span>
              </div>
            ) : playlists.length === 0 ? (
              <div className="text-sm text-muted-foreground py-2">There are no playlists you own</div>
            ) : (
              playlists.map((playlist) => (
                <div key={playlist.id} className="flex items-center space-x-3">
                  <Checkbox
                    checked={selectedPlaylists.has(playlist.id)}
                    onCheckedChange={() => handlePlaylistToggle(playlist.id)}
                  />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-foreground">{playlist.name}</p>
                    <p className="text-xs text-muted-foreground">{playlist.songCount} songs</p>
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="border-t pt-4">
            {!showNewPlaylistInput ? (
              <Button
                variant="outline"
                onClick={() => setShowNewPlaylistInput(true)}
                className="w-full flex items-center gap-2"
              >
                <Plus className="h-4 w-4" />
                Create New Playlist
              </Button>
            ) : (
              <div className="space-y-2">
                <Input
                  placeholder="Enter playlist name"
                  value={newPlaylistName}
                  onChange={(e) => setNewPlaylistName(e.target.value)}
                  className="w-full"
                />
                <div className="flex gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setShowNewPlaylistInput(false)
                      setNewPlaylistName('')
                    }}
                  >
                    Cancel
                  </Button>
                  <Button
                    size="sm"
                    onClick={handleCreateNewPlaylist}
                    disabled={!newPlaylistName.trim() || loading}
                    className="bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
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

          <div className="flex gap-3 pt-4">
            <Button
              variant="ghost"
              onClick={() => onOpenChange(false)}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              onClick={handleAddToExistingPlaylists}
              disabled={!canAddToExistingPlaylists || loading}
              className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Adding...
                </>
              ) : (
                `Add to ${selectedPlaylists.size} Playlist${selectedPlaylists.size > 1 ? 's' : ''}`
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}