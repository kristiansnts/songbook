import { useState, useEffect } from 'react'
import { createFileRoute, redirect } from '@tanstack/react-router'
import { useNavigate } from '@tanstack/react-router'
import { songService } from '@/services/songService'
import { Song } from '@/types/song'
import { Search, ChevronLeft, ChevronRight } from 'lucide-react'
import { authManager } from '@/lib/auth-manager'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

function ArtistSongsPage() {
  const navigate = useNavigate()
  const { name: artistName } = Route.useParams()
  const [songs, setSongs] = useState<Song[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')

  // Decode URL-encoded artist name
  const decodedArtistName = decodeURIComponent(artistName)

  useEffect(() => {
    const fetchSongs = async () => {
      try {
        setIsLoading(true)
        const data = await songService.getAllSongs()
        // Filter songs by artist
        const artistSongs = data.filter(
          (song) =>
            song.artist.toLowerCase() === decodedArtistName.toLowerCase()
        )
        setSongs(artistSongs)
        setError(null)
      } catch (_err) {
        setError('Failed to load songs')
      } finally {
        setIsLoading(false)
      }
    }

    fetchSongs()
  }, [decodedArtistName])

  // Helper function to strip HTML tags from lyrics
  const stripHtmlTags = (html: string) => {
    return html.replace(/<[^>]*>/g, '').replace(/&[^;]+;/g, '')
  }

  // Filter and sort songs based on search term
  const filteredSongs = songs
    .filter((song: Song) => {
      const searchLower = searchTerm.toLowerCase()
      return (
        song.title.toLowerCase().includes(searchLower) ||
        song.artist.toLowerCase().includes(searchLower) ||
        stripHtmlTags(song.lyrics_and_chords || '')
          .toLowerCase()
          .includes(searchLower)
      )
    })
    .sort((a, b) => a.title.toLowerCase().localeCompare(b.title.toLowerCase()))

  return (
    <div className='flex h-screen flex-col'>
      {/* Fixed Header */}
      <header className='flex items-center justify-between border-b bg-white px-4 py-4'>
        <div className='flex items-center'>
          <Button
            variant='ghost'
            size='sm'
            onClick={() => navigate({ to: '/user/artist' })}
            className='mr-2 p-1'
          >
            <ChevronLeft className='h-6 w-6' />
          </Button>
          <span className='text-lg'>Artists</span>
        </div>
      </header>

      {/* Fixed Title */}
      <div className='bg-white px-4 py-6'>
        <h1 className='text-4xl font-bold'>{decodedArtistName}</h1>
        <p className='mt-1 text-gray-500'>
          {songs.length} song{songs.length !== 1 ? 's' : ''}
        </p>
      </div>

      {/* Fixed Search */}
      <div className='border-b bg-white px-4 py-4'>
        <div className='relative'>
          <Search className='absolute top-1/2 left-3 h-5 w-5 -translate-y-1/2 text-gray-400' />
          <Input
            className='pl-10'
            placeholder='Search songs, artists, or lyrics'
            type='text'
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Scrollable Song List */}
      <main className='flex-1 overflow-y-auto px-4 py-4'>
        {isLoading ? (
          <div className='flex justify-center py-8'>
            <div className='text-gray-500'>Loading songs...</div>
          </div>
        ) : error ? (
          <div className='flex justify-center py-8'>
            <div className='text-red-500'>Error loading songs</div>
          </div>
        ) : filteredSongs.length === 0 ? (
          <div className='flex justify-center py-8'>
            <div className='text-gray-500'>No songs found for this artist</div>
          </div>
        ) : (
          <div className='space-y-1'>
            {filteredSongs.map((song) => (
              <Button
                key={song.id}
                variant='ghost'
                className='h-auto w-full justify-between p-3'
                onClick={() => {
                  navigate({
                    to: '/user/song/$id',
                    params: { id: song.id.toString() },
                  })
                }}
              >
                <div className='min-w-0 flex-1 text-left'>
                  <h3 className='truncate text-lg font-medium'>{song.title}</h3>
                  <p className='truncate text-gray-500'>{song.artist}</p>
                </div>
                <ChevronRight className='ml-2 h-5 w-5 flex-shrink-0 text-gray-400' />
              </Button>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}

export const Route = createFileRoute('/_authenticated/user/artist/$name')({
  beforeLoad: async ({ params }) => {
    // 🛡️ User route protection - require peserta permission
    try {
      const hasPermission = await authManager.hasPermission('peserta')

      if (!hasPermission) {
        throw redirect({
          to: '/unauthorized',
        })
      }
    } catch (error) {
      console.error('User artist songs permission check failed:', error)
      // If permission check fails but we have a token, allow access for development
      if (!authManager.getToken()) {
        throw redirect({
          to: '/sign-in',
        })
      }
    }

    // Redirect to song list with artist filter
    const artistName = decodeURIComponent(params.name)
    throw redirect({
      to: '/user/song',
      search: { artist: artistName },
    })
  },
})
