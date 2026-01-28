import { useState, useEffect } from 'react'
import { useNavigate } from '@tanstack/react-router'
import { artistService } from '@/services/artist-service'
import { Search, User, ChevronLeft, ChevronRight, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

interface Artist {
  id: number
  name: string
}

export function ArtistView() {
  const navigate = useNavigate()
  const [searchTerm, setSearchTerm] = useState('')
  const [artists, setArtists] = useState<Artist[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchArtists = async () => {
      try {
        setIsLoading(true)
        const data = await artistService.getAllArtists()
        setArtists(data)
        setError(null)
      } catch (_err) {
        setError('Failed to load artists')
      } finally {
        setIsLoading(false)
      }
    }

    fetchArtists()
  }, [])

  const filteredArtists = artists.filter((artist: Artist) =>
    artist.name.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className='flex h-screen flex-col'>
      {/* Fixed Header */}
      <header className='bg-background dark:bg-background flex items-center justify-between border-b px-4 py-4'>
        <div className='flex items-center'>
          <Button
            variant='ghost'
            size='sm'
            onClick={() => navigate({ to: '/user/dashboard' })}
            className='mr-2 p-1'
          >
            <ChevronLeft className='h-6 w-6' />
          </Button>
          <span className='text-lg'>Library</span>
        </div>
      </header>

      {/* Fixed Title */}
      <div className='bg-background dark:bg-background px-4 py-6'>
        <h1 className='text-4xl font-bold'>Artists</h1>
      </div>

      {/* Fixed Search */}
      <div className='bg-background dark:bg-background border-b px-4 pb-4'>
        <div className='relative'>
          <Search className='absolute top-1/2 left-3 h-5 w-5 -translate-y-1/2 text-gray-400' />
          <Input
            className='pr-10 pl-10'
            placeholder='Search'
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
      </div>

      {/* Scrollable List */}
      <main className='flex-1 overflow-y-auto px-4 py-4'>
        {isLoading ? (
          <div className='flex justify-center py-8'>
            <div className='text-muted-foreground'>Loading artists...</div>
          </div>
        ) : error ? (
          <div className='flex justify-center py-8'>
            <div className='text-red-500'>Error loading artists</div>
          </div>
        ) : (
          <div className='space-y-1'>
            {filteredArtists.map((artist) => (
              <Button
                key={artist.id}
                variant='ghost'
                className='h-auto w-full justify-between p-3'
                onClick={() => {
                  navigate({
                    to: '/user/artist/$name',
                    params: { name: encodeURIComponent(artist.name) },
                  })
                }}
              >
                <div className='flex min-w-0 flex-1 items-center'>
                  <User className='text-muted-foreground mr-4 h-6 w-6 flex-shrink-0' />
                  <span className='truncate text-lg'>{artist.name}</span>
                </div>
                <ChevronRight className='text-muted-foreground ml-2 h-5 w-5 flex-shrink-0' />
              </Button>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
