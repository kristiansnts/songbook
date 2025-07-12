import { Button } from '@/components/ui/button'
import { Eye } from 'lucide-react'
import { Song } from '../data/schema'
import { useSongs } from '../context/songs-context'

interface ViewButtonProps {
  song: Song
}

export function ViewButton({ song }: ViewButtonProps) {
  const { openViewDialog } = useSongs()

  return (
    <Button
      variant='ghost'
      size='sm'
      onClick={() => openViewDialog(song)}
      className='text-xs sm:text-sm px-2 sm:px-3'
    >
      <Eye className='h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2' />
      <span className='hidden sm:inline'>View</span>
      <span className='sm:hidden'>View</span>
    </Button>
  )
}