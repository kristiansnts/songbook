import React, { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Checkbox } from '@/components/ui/checkbox'
import { Plus, Music } from 'lucide-react'
import { Song } from '@/types/song'

interface PlaylistDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  song?: Song
  onAddToPlaylist: (playlistIds: string[], newPlaylistName?: string) => void
}

// Mock playlists - replace with actual data fetching
const mockPlaylists = [
  { id: '1', name: 'My Favorites', songCount: 12 },
  { id: '2', name: 'Worship Songs', songCount: 8 },
  { id: '3', name: 'Christmas Carols', songCount: 15 },
]

export function PlaylistDialog({ open, onOpenChange, song, onAddToPlaylist }: PlaylistDialogProps) {
  const [selectedPlaylists, setSelectedPlaylists] = useState<Set<string>>(new Set())
  const [newPlaylistName, setNewPlaylistName] = useState('')
  const [showNewPlaylistInput, setShowNewPlaylistInput] = useState(false)

  const handlePlaylistToggle = (playlistId: string) => {
    const newSelected = new Set(selectedPlaylists)
    if (newSelected.has(playlistId)) {
      newSelected.delete(playlistId)
    } else {
      newSelected.add(playlistId)
    }
    setSelectedPlaylists(newSelected)
  }

  const handleAddToPlaylists = () => {
    const playlistIds = Array.from(selectedPlaylists)
    onAddToPlaylist(playlistIds, newPlaylistName.trim() || undefined)
    
    // Reset state
    setSelectedPlaylists(new Set())
    setNewPlaylistName('')
    setShowNewPlaylistInput(false)
    onOpenChange(false)
  }

  const canAddToPlaylists = selectedPlaylists.size > 0 || newPlaylistName.trim()

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
            </div>
          )}

          <div className="space-y-3">
            <h4 className="text-sm font-medium text-gray-900">Select existing playlists:</h4>
            
            {mockPlaylists.map((playlist) => (
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
            ))}
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
              onClick={handleAddToPlaylists}
              disabled={!canAddToPlaylists}
              className="flex-1 bg-black text-white hover:bg-gray-800 disabled:bg-gray-300"
            >
              Add to Playlist{selectedPlaylists.size > 1 ? 's' : ''}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}