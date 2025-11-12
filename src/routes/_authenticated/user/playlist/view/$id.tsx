import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useEffect, useState, useCallback } from 'react'
import { playlistService } from '@/services/playlist-service'
import { Playlist } from '@/types/playlist'
import { Song } from '@/types/song'
import { Button } from '@/components/ui/button'
import { ChevronLeft, Loader2, Home, Music2 } from 'lucide-react'
import { toast } from 'sonner'
import { KEYS, transposeStoredChords } from '@/lib/transpose-utils'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Swiper, SwiperSlide } from 'swiper/react'
import { Pagination } from 'swiper/modules'
import 'swiper/css'
import 'swiper/css/pagination'

export const Route = createFileRoute('/_authenticated/user/playlist/view/$id')({
  component: PlaylistViewerComponent,
})

// Component to render individual song content with transpose functionality
function SongContent({
  song,
  index,
  defaultKey,
  showChords
}: {
  song: Song;
  index: number;
  defaultKey?: string;
  showChords: boolean;
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

    let content = transposeStoredChords(
      song.lyrics_and_chords,
      song.base_chord || 'C',
      selectedKey
    );

    // Apply chord visibility using CSS
    if (!showChords) {
      // Enhanced CSS to hide chords and slash characters properly
      const style = `
        <style>
          .c { display: none !important; }
          /* Hide slash characters that appear before or after chord spans */
          .lyrics-content *:has(.c) .c + *:not(.c):not(br):not(div) {
            display: none !important;
          }
          /* Hide standalone slash characters */
          .lyrics-content span:not(.c):empty + span:not(.c)[title*="/"],
          .lyrics-content span:not(.c):contains("/") {
            display: none !important;
          }
          /* More specific targeting of slash characters */
          .lyrics-content {
            --chord-display: none !important;
          }
          .lyrics-content .c,
          .lyrics-content .c + span:not(.c):not([class]) {
            display: var(--chord-display) !important;
          }
        </style>
      `;
      content = style + content;

      // Additional processing: Remove chord notation characters (/, #, b)
      const tempDiv = document.createElement('div');
      tempDiv.innerHTML = content;

      // Find and remove text nodes that contain chord notation symbols
      const walker = document.createTreeWalker(
        tempDiv,
        NodeFilter.SHOW_TEXT,
        null,
        false
      );

      const textNodesToRemove: Text[] = [];
      let node;
      while (node = walker.nextNode()) {
        const textNode = node as Text;
        const trimmedText = textNode.textContent?.trim() || '';
        // Remove nodes with slash, sharp, or flat symbols that are part of chord notation
        if (trimmedText === '/' || trimmedText === '#' || trimmedText === 'b' ||
            trimmedText === '/#' || trimmedText === '/b') {
          textNodesToRemove.push(textNode);
        }
      }

      textNodesToRemove.forEach(textNode => {
        if (textNode.parentNode) {
          textNode.parentNode.removeChild(textNode);
        }
      });

      content = tempDiv.innerHTML;
    }

    return content;
  }, [song.lyrics_and_chords, song.base_chord, selectedKey, showChords]);

  return (
    <div className="h-full w-full flex flex-col">
      {/* Song Header - Fixed at top */}
      <div className="mb-4 pb-4 border-b border-border flex-shrink-0">
        <div className="flex items-center gap-3 mb-3">
          <span className="bg-muted text-muted-foreground px-3 py-1 rounded-full text-sm font-medium">
            {index + 1}
          </span>
          <div>
            <h2 className="text-xl font-bold text-card-foreground">{song.title}</h2>
            <p className="text-muted-foreground">{song.artist}</p>
          </div>
        </div>
        {/* Transpose Selector */}
        <div className="flex items-center gap-3">
          <label className="text-sm font-medium text-muted-foreground">
            Transpose:
          </label>
          <Select value={selectedKey} onValueChange={setSelectedKey}>
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Select key" />
            </SelectTrigger>
            <SelectContent>
              {KEYS.map((key) => (
                <SelectItem key={key} value={key}>
                  {key}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Song Lyrics and Chords - Scrollable content */}
      <div className="lyrics-content flex-1 overflow-y-auto">
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
  const [globalShowChords, setGlobalShowChords] = useState(true)

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

  const handleHomeClick = () => {
    navigate({ to: '/user/dashboard' })
  }

  return (
    <div className="flex flex-col h-screen bg-background">
      {/* Swiper Container - Horizontal Scrolling */}
      <div className="flex-1 overflow-hidden">
        <Swiper
          modules={[Pagination]}
          spaceBetween={50}
          loop={true}
          slidesPerView={1}
          pagination={{ clickable: true }}
          className="h-full w-full"
        >
          {songs.map((song, index) => (
            <SwiperSlide key={song.id} className="h-full">
              <div className="h-full overflow-y-auto px-4 py-6">
                <div className="max-w-4xl mx-auto">
                  <SongContent
                    song={song}
                    index={index}
                    defaultKey={getDefaultKeyForSong(song.id)}
                    showChords={globalShowChords}
                  />
                </div>
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
      </div>

      {/* Floating Action Buttons */}
      <div className="fixed bottom-5 right-4 flex flex-col gap-3 z-50">
        {/* Toggle Chords Button */}
        <Button
          size="icon"
          onClick={() => setGlobalShowChords(!globalShowChords)}
          className="h-14 w-14 rounded-full shadow-lg"
          variant={globalShowChords ? "default" : "secondary"}
        >
          <Music2 className="h-6 w-6" />
        </Button>

        {/* Home Button */}
        <Button
          size="icon"
          onClick={handleHomeClick}
          className="h-14 w-14 rounded-full shadow-lg"
          variant="outline"
        >
          <Home className="h-6 w-6" />
        </Button>
      </div>
    </div>
  )
}