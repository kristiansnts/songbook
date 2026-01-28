import { ColumnDef } from '@tanstack/react-table'
import {
  parseLyricsAndChords,
  richTextToPlainText,
} from '@/utils/lyrics-parser'
import { Checkbox } from '@/components/ui/checkbox'
import { Song } from '../data/schema'
import { DataTableColumnHeader } from './data-table-column-header'
import { DataTableRowActions } from './data-table-row-actions'
import { ViewButton } from './view-button'

// Helper function to get base chord from lyrics
function getBaseChord(song: Song): string {
  // First priority: use explicitly set baseChord
  if (song.baseChord) {
    return song.baseChord
  }

  // Second priority: get from stored chords string
  if (song.chords) {
    const chordsArray = song.chords
      .split(',')
      .map((c) => c.trim())
      .filter((c) => c)
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
        <div className='max-w-[120px] truncate text-sm font-medium sm:max-w-[200px] sm:text-base md:max-w-[300px]'>
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
        <div className='max-w-[100px] truncate text-sm sm:max-w-[150px] sm:text-base md:max-w-[200px]'>
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
      <span className='font-mono text-sm font-medium whitespace-nowrap'>
        {getBaseChord(row.original)}
      </span>
    ),
    size: 20, // Percentage width
  },
  {
    id: 'actions',
    header: 'Actions',
    cell: ({ row }) => (
      <div className='flex items-center justify-end gap-1'>
        <ViewButton song={row.original} />
        <DataTableRowActions row={row} />
      </div>
    ),
    enableSorting: false,
    size: 15, // Percentage width
  },
]
