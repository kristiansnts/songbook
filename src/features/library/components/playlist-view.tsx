import { useNavigate } from '@tanstack/react-router'
import { ArrowLeft, MoreHorizontal, Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface PlaylistViewProps {
  playlistName?: string
  songCount?: number
}

export default function PlaylistView({
  playlistName = 'Test',
  songCount = 0,
}: PlaylistViewProps) {
  const navigate = useNavigate()

  return (
    <div className='flex min-h-screen flex-col'>
      <header className='flex items-center justify-between border-b p-4'>
        <div className='flex items-center'>
          <Button
            variant='ghost'
            onClick={() => navigate({ to: '/user/dashboard' })}
            className='flex items-center p-0 hover:bg-transparent'
          >
            <ArrowLeft className='mr-2 h-5 w-5' />
            <span className='text-lg'>Song lists</span>
          </Button>
        </div>
        <Button variant='ghost' size='icon'>
          <MoreHorizontal className='h-6 w-6' />
        </Button>
      </header>

      <main className='flex flex-grow flex-col items-center justify-center px-4 text-center'>
        <div className='mb-6 flex h-48 w-48 items-center justify-center rounded-lg bg-gray-100'>
          <svg
            className='h-32 w-32 text-gray-300'
            fill='currentColor'
            viewBox='0 0 20 20'
            xmlns='http://www.w3.org/2000/svg'
          >
            <path
              clipRule='evenodd'
              d='M10 18a8 8 0 100-16 8 8 0 000 16zM6 9a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 4a1 1 0 100 2h3a1 1 0 100-2H7z'
              fillRule='evenodd'
            />
            <path d='M12.293 5.293a1 1 0 011.414 0l4 4a1 1 0 01-1.414 1.414L13 7.414V17a1 1 0 11-2 0V7.414L8.707 9.707a1 1 0 01-1.414-1.414l4-4z' />
          </svg>
        </div>
        <h1 className='mb-2 text-3xl font-bold'>{playlistName}</h1>
        <p className='text-gray-500'>
          {songCount === 0 ? 'Setlist has no songs.' : `${songCount} songs`}
        </p>
      </main>

      <div className='border-t px-4 py-6'>
        <Button
          variant='ghost'
          className='flex h-auto w-full items-center justify-start py-2 text-left'
        >
          <Plus className='mr-3 h-6 w-6 text-blue-500' />
          <span className='text-lg'>Add ...</span>
        </Button>
        <div className='my-4 border-t' />
        <p className='text-gray-500'>{songCount} songs</p>
      </div>
    </div>
  )
}
