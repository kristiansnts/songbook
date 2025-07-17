import { ColumnDef } from '@tanstack/react-table'
import { Song } from '../data/schema'
import { DataTableColumnHeader } from './data-table-column-header'
import { DataTableRowActions } from './data-table-row-actions'
import { parseLyricsAndChords, richTextToPlainText } from '@/utils/lyrics-parser'
import { ViewButton } from './view-button'
import { Checkbox } from '@/components/ui/checkbox'

// Helper function to get base chord from lyrics
function getBaseChord(song: Song): string {
  // First priority: use explicitly set baseChord
  if (song.baseChord) {
    return song.baseChord
  }
  
  // Second priority: get from stored chords string
  if (song.chords) {
    const chordsArray = song.chords.split(',').map(c => c.trim()).filter(c => c)
    if (chordsArray.length > 0) return chordsArray[0]
  }
  
  // Fallback to parsing lyricAndChords
  if (!song.lyricAndChords) return '-'
  
  const plainText = richTextToPlainText(song.lyricAndChords)
  const parsed = parseLyricsAndChords(plainText)
  
  return parsed.chords.length > 0 ? parsed.chords[0] : '-'
}

export const columns: ColumnDef<Song>[] = [
  {
    id: 'select',
    header: ({ table }) => (
      <Checkbox
        checked={
          table.getIsAllPageRowsSelected() ||
          (table.getIsSomePageRowsSelected() && 'indeterminate')
        }
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label='Select all'
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label='Select row'
      />
    ),
    enableSorting: false,
    enableHiding: false,
    size: 5, // Percentage width
  },
  {
    accessorKey: 'title',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Song Title' />
    ),
    cell: ({ row }) => (
      <div className='min-w-0 flex-1'>
        <div className='truncate font-medium text-sm sm:text-base max-w-[120px] sm:max-w-[200px] md:max-w-[300px]'>
          {row.getValue('title')}
        </div>
      </div>
    ),
    size: 35, // Percentage width
  },
  {
    accessorKey: 'artist',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Artist' />
    ),
    cell: ({ row }) => (
      <div className='min-w-0 flex-1'>
        <div className='truncate text-sm sm:text-base max-w-[100px] sm:max-w-[150px] md:max-w-[200px]'>
          {row.getValue('artist') || '-'}
        </div>
      </div>
    ),
    size: 25, // Percentage width
  },
  {
    id: 'baseChord',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Key' />
    ),
    cell: ({ row }) => (
      <span className='font-mono font-medium text-sm whitespace-nowrap'>
        {getBaseChord(row.original)}
      </span>
    ),
    size: 20, // Percentage width
  },
  {
    id: 'actions',
    header: 'Actions',
    cell: ({ row }) => (
      <div className="flex items-center gap-1 justify-end">
        <ViewButton song={row.original} />
        <DataTableRowActions row={row} />
      </div>
    ),
    enableSorting: false,
    size: 15, // Percentage width
  },
]
