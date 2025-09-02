import { Search, List, User, Plus, Music, Users, ChevronRight, Loader2 } from 'lucide-react'
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
import { useEffect, useState } from 'react'
import { playlistService } from '@/services/playlist-service'
import { Playlist } from '@/types/playlist'
import { toast } from 'sonner'
import { useAuth } from '@/lib/auth'

export default function Library() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [playlists, setPlaylists] = useState<Playlist[]>([])
  const [playlistsLoading, setPlaylistsLoading] = useState(true)
  const [createDialogOpen, setCreateDialogOpen] = useState(false)
  const [playlistName, setPlaylistName] = useState('')
  const [creating, setCreating] = useState(false)
  
  const songs = [
    { id: 1, type: 'all', label: 'All songs', count: 2, icon: List },
    { id: 2, type: 'artists', label: 'Artists', icon: User },
  ]

  useEffect(() => {
    loadPlaylists()
  }, [])

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

  const teams = [
    { id: 1, name: 'My Team' },
  ]

  // Check if user is a verified member (peserta with verifikasi = '1')
  // Don't show badge for owned playlists - only for shared/joined playlists
  const isVerifiedMember = user?.userType === 'peserta' && user?.verifikasi === '1'

  return (
    <div className="container mx-auto px-4 py-6">
      <header className="flex justify-between items-center mb-6">
        <h1 className="text-4xl font-bold">Library</h1>
      </header>

      <div className="relative mb-8">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-5 w-5" />
        <Input
          className="pl-10"
          placeholder="Song, tag or artist"
          type="text"
        />
      </div>

      <main>
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