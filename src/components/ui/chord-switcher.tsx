import React from 'react'
import { Music } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'

interface ChordSwitcherProps {
  showChords: boolean
  onToggle: (show: boolean) => void
  className?: string
}

export function ChordSwitcher({
  showChords,
  onToggle,
  className,
}: ChordSwitcherProps) {
  return (
    <Button
      variant={showChords ? 'default' : 'outline'}
      size='sm'
      onClick={() => onToggle(!showChords)}
      className={cn('flex items-center gap-2', className)}
    >
      <Music className='h-4 w-4' />
      {showChords ? 'Hide Chords' : 'Show Chords'}
    </Button>
  )
}
