import { Eye } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useSongs } from '../context/songs-context'
import { Song } from '../data/schema'

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
      className='px-2 text-xs sm:px-3 sm:text-sm'
    >
      <Eye className='mr-1 h-3 w-3 sm:mr-2 sm:h-4 sm:w-4' />
      <span className='hidden sm:inline'>View</span>
      <span className='sm:hidden'>View</span>
    </Button>
  )
}
