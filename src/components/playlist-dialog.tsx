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

  useEffect(() => {
    if (open) {
      loadPlaylists()
      // Initialize selected chord to song's base chord or default to 'C'
      setSelectedChord(song?.base_chord || 'C')
    }
  }, [open, song])

  const loadPlaylists = async () => {
    try {
      setLoading(true)
      const playlistsData = await playlistService.getAllPlaylists()
      setPlaylists(playlistsData)
    } catch (err) {
      toast.error('Failed to load playlists', {
        action: {
          label: 'x',
          onClick: () => toast.dismiss()
        }
      })
      console.error('Error loading playlists:', err)
      // Fallback to mock data on error
      setPlaylists([
        { id: '1', name: 'My Favorites', songCount: 12 },
        { id: '2', name: 'Worship Songs', songCount: 8 },
        { id: '3', name: 'Christmas Carols', songCount: 15 },
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
        await playlistService.addSongToPlaylistWithChord(playlistId, songId, selectedChord)
      }
      
      toast.success(`Song added to ${selectedPlaylistIds.length} playlist(s) with chord ${selectedChord}`, {
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
      onOpenChange(false)
    } catch (err) {
      toast.error('Failed to add song to playlist', {
        action: {
          label: 'x',
          onClick: () => toast.dismiss()
        }
      })
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
      console.error('Error creating playlist:', err)
    } finally {
      setLoading(false)
    }
  }

  const canAddToExistingPlaylists = selectedPlaylists.size > 0 && selectedChord.trim() !== ''

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
            <div className="bg-gray-50 rounded-lg p-3">
              <h3 className="font-medium text-gray-900">{song.title}</h3>
              <p className="text-sm text-gray-600">{song.artist}</p>
              <p className="text-xs text-gray-500 mt-1">Original Key: {song.base_chord}</p>
            </div>
          )}

          {/* Chord Selector */}
          <div className="space-y-3">
            <h4 className="text-sm font-medium text-gray-900">Choose base chord for playlist:</h4>
            <div className="grid grid-cols-6 gap-2">
              {KEYS.map((key) => (
                <button
                  key={key}
                  onClick={() => setSelectedChord(key)}
                  className={cn(
                    "h-8 w-8 rounded-lg text-sm font-semibold transition-colors",
                    selectedChord === key 
                      ? "bg-blue-500 text-white" 
                      : "bg-gray-100 text-gray-800 hover:bg-gray-200"
                  )}
                >
                  {key}
                </button>
              ))}
            </div>
            <p className="text-xs text-gray-500">
              Selected chord: <strong>{selectedChord}</strong> 
              {selectedChord !== song?.base_chord && song?.base_chord && (
                <span> (transposed from {song.base_chord})</span>
              )}
            </p>
          </div>

          <div className="space-y-3">
            <h4 className="text-sm font-medium text-gray-900">Select existing playlists:</h4>
            
            {loading ? (
              <div className="flex items-center justify-center py-4">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span className="ml-2 text-sm text-gray-500">Loading playlists...</span>
              </div>
            ) : playlists.length === 0 ? (
              <div className="text-sm text-gray-500 py-2">No playlists found</div>
            ) : (
              playlists.map((playlist) => (
                <div key={playlist.id} className="flex items-center space-x-3">
                  <Checkbox
                    checked={selectedPlaylists.has(playlist.id)}
                    onCheckedChange={() => handlePlaylistToggle(playlist.id)}
                  />
                  <div className="flex-1">
                    <p className="text-sm font-medium">{playlist.name}</p>
                    <p className="text-xs text-gray-500">{playlist.songCount} songs</p>
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
                    className="bg-black text-white hover:bg-gray-800 disabled:bg-gray-300"
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
              className="flex-1 bg-black text-white hover:bg-gray-800 disabled:bg-gray-300"
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