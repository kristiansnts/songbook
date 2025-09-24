import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useEffect, useState, useCallback } from 'react'
import { playlistService } from '@/services/playlist-service'
import { Playlist } from '@/types/playlist'
import { Song } from '@/types/song'
import { Button } from '@/components/ui/button'
import { ChevronLeft, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { KEYS, transposeStoredChords } from '@/lib/transpose-utils'
import { cn } from '@/lib/utils'

export const Route = createFileRoute('/_authenticated/user/playlist/view/$id')({
  component: PlaylistViewerComponent,
})

// Component to render individual song content with transpose functionality
function SongContent({ 
  song, 
  index, 
  defaultKey 
}: { 
  song: Song; 
  index: number;
  defaultKey?: string;
}) {
  const [selectedKey, setSelectedKey] = useState(defaultKey || song.base_chord || 'C');

  // Update selected key when defaultKey changes (from playlist_notes)
  useEffect(() => {
    if (defaultKey) {
      setSelectedKey(defaultKey);
    }
  }, [defaultKey]);

  const memoizedTransposedContent = useCallback(() => {
    if (!song.lyrics_and_chords) return '';
    
    return transposeStoredChords(
      song.lyrics_and_chords, 
      song.base_chord || 'C', 
      selectedKey
    );
  }, [song.lyrics_and_chords, song.base_chord, selectedKey]);

  return (
    <div className="bg-card border border-border rounded-lg p-6 mb-6">
      {/* Song Header */}
      <div className="mb-4 pb-4 border-b border-border">
        <div className="flex items-center gap-3 mb-2">
          <span className="bg-muted text-muted-foreground px-2 py-1 rounded-full text-sm font-medium">
            {index + 1}
          </span>
          <div>
            <h2 className="text-xl font-bold text-card-foreground">{song.title}</h2>
            <p className="text-muted-foreground">{song.artist}</p>
          </div>
        </div>
        <div className="flex items-center gap-4 text-sm text-muted-foreground mb-3">
          <span>Original Key: <strong className="text-foreground">{song.base_chord}</strong></span>
          {defaultKey && defaultKey !== song.base_chord && (
            <span>Playlist Key: <strong className="text-primary">{defaultKey}</strong></span>
          )}
        </div>

        {/* Key Selector Grid */}
        <div className="grid grid-cols-6 gap-2 max-w-xs">
          {KEYS.map((key) => (
            <button
              key={key}
              onClick={() => setSelectedKey(key)}
              className={cn(
                "h-8 w-8 rounded-lg text-sm font-semibold transition-colors",
                selectedKey === key
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground hover:bg-muted/80"
              )}
            >
              {key}
            </button>
          ))}
        </div>
      </div>

      {/* Song Lyrics and Chords */}
      <div className="lyrics-content">
        {song.lyrics_and_chords && song.lyrics_and_chords.trim() !== '' ? (
          <div 
            key={selectedKey}
            className="prose-sm max-w-none text-sm md:text-base leading-normal"
            dangerouslySetInnerHTML={{ __html: memoizedTransposedContent() }}
          />
        ) : (
          <p className="text-muted-foreground italic">No lyrics available</p>
        )}
      </div>
    </div>
  )
}

function PlaylistViewerComponent() {
  const { id } = Route.useParams()
  const navigate = useNavigate()
  const [playlist, setPlaylist] = useState<Playlist | null>(null)
  const [songs, setSongs] = useState<Song[]>([])
  const [playlistNotes, setPlaylistNotes] = useState<Array<{song_id: number, base_chord: string}>>([])
  const [loading, setLoading] = useState(true)

  const loadPlaylistData = useCallback(async () => {
    try {
      setLoading(true)
      const playlistData = await playlistService.getPlaylist(id)
      setPlaylist(playlistData)
      setSongs(playlistData.songs || [])
      setPlaylistNotes(playlistData.playlist_notes || [])
    } catch (_error) {
      toast.error('Failed to load playlist', {
        action: {
          label: 'x',
          onClick: () => toast.dismiss()
        }
      })
      setPlaylist({ id: 'error', playlist_name: 'Playlist Not Found' } as Playlist)
      setSongs([])
      setPlaylistNotes([])
    } finally {
      setLoading(false)
    }
  }, [id])

  useEffect(() => {
    loadPlaylistData()
  }, [loadPlaylistData])

  const handleBackToPlaylist = () => {
    navigate({ to: '/user/playlist/$id', params: { id } })
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-center p-8">
            <Loader2 className="h-6 w-6 animate-spin mr-2 text-muted-foreground" />
            <span className="text-muted-foreground">Loading playlist...</span>
          </div>
        </div>
      </div>
    )
  }

  if (!playlist || songs.length === 0) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-center p-8">
            <div className="text-center">
              <p className="text-muted-foreground mb-4">No songs found in this playlist</p>
              <Button onClick={handleBackToPlaylist} variant="outline">
                Back to Playlist
              </Button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Function to get default key for a song from playlist notes
  const getDefaultKeyForSong = (songId: number): string | undefined => {
    const note = playlistNotes.find(note => note.song_id === songId);
    return note?.base_chord;
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-background border-b border-border px-4 py-4 sticky top-0 z-40">
        <div className="container mx-auto">
          <div className="flex items-center">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleBackToPlaylist}
              className="mr-2 p-1"
            >
              <ChevronLeft className="h-6 w-6" />
            </Button>
            <div>
              <h1 className="text-lg font-semibold text-foreground">{playlist.playlist_name || playlist.name}</h1>
              <p className="text-sm text-muted-foreground">
                {songs.length} {songs.length === 1 ? 'song' : 'songs'}
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* All Songs Content */}
      <div className="container mx-auto px-4 py-6">
        <div className="max-w-4xl mx-auto">
          {songs.map((song, index) => (
            <SongContent 
              key={song.id} 
              song={song} 
              index={index} 
              defaultKey={getDefaultKeyForSong(song.id)}
            />
          ))}
        </div>
      </div>
    </div>
  )
}