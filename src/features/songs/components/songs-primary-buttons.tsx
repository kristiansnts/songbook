import { IconPlus } from '@tabler/icons-react'
import { Button } from '@/components/ui/button'
import { useSongs } from '../context/songs-context'

export function SongsPrimaryButtons() {
  const { openModal } = useSongs()
  return (
    <div className='flex gap-2'>
      <Button className='space-x-1' onClick={() => openModal('create')}>
        <span>Create</span> <IconPlus size={18} />
      </Button>
    </div>
  )
}
