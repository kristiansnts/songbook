import { Cross2Icon } from '@radix-ui/react-icons'
import { Table } from '@tanstack/react-table'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { DataTableViewOptions } from '../components/data-table-view-options'
import { priorities, statuses } from '../data/data'
import { DataTableFacetedFilter } from './data-table-faceted-filter'
import { IconMusic, IconPlaylistAdd } from '@tabler/icons-react'
import { useState } from 'react'
import { Song } from '../data/schema'

interface DataTableToolbarProps<TData> {
  table: Table<TData>
  onBulkAddToPlaylist?: (songs: Song[]) => void
}

export function DataTableToolbar<TData>({
  table,
  onBulkAddToPlaylist,
}: DataTableToolbarProps<TData>) {
  const isFiltered = table.getState().columnFilters.length > 0
  const selectedRows = table.getFilteredSelectedRowModel().rows
  const selectedSongs = selectedRows.map(row => row.original as Song)

  return (
    <div className='space-y-4'>
      {/* Bulk Actions Bar - Shows when songs are selected */}
      {selectedRows.length > 0 && (
        <div className='flex items-center justify-between bg-blue-50 border border-blue-200 rounded-lg px-4 py-2'>
          <div className='flex items-center gap-2'>
            <IconMusic className='h-4 w-4 text-blue-600' />
            <span className='text-sm font-medium text-blue-900'>
              {selectedRows.length} song{selectedRows.length > 1 ? 's' : ''} selected
            </span>
          </div>
          <div className='flex items-center gap-2'>
            <Button
              variant='outline'
              size='sm'
              onClick={() => table.toggleAllPageRowsSelected(false)}
              className='text-blue-700 border-blue-300 hover:bg-blue-100'
            >
              Clear Selection
            </Button>
            {onBulkAddToPlaylist && (
              <Button
                size='sm'
                onClick={() => onBulkAddToPlaylist(selectedSongs)}
                className='bg-blue-600 text-white hover:bg-blue-700'
              >
                <IconPlaylistAdd className='h-4 w-4 mr-2' />
                Add to Playlist
              </Button>
            )}
          </div>
        </div>
      )}

      {/* Regular Toolbar */}
      <div className='flex items-center justify-between'>
        <div className='flex flex-1 flex-col-reverse items-start gap-y-2 sm:flex-row sm:items-center sm:space-x-2'>
          <Input
            placeholder='Filter songs...'
            value={(table.getColumn('title')?.getFilterValue() as string) ?? ''}
            onChange={(event) =>
              table.getColumn('title')?.setFilterValue(event.target.value)
            }
            className='h-8 w-[150px] lg:w-[250px]'
          />
          <div className='flex gap-x-2'>
            {table.getColumn('status') && (
              <DataTableFacetedFilter
                column={table.getColumn('status')}
                title='Status'
                options={statuses}
              />
            )}
            {table.getColumn('priority') && (
              <DataTableFacetedFilter
                column={table.getColumn('priority')}
                title='Priority'
                options={priorities}
              />
            )}
          </div>
          {isFiltered && (
            <Button
              variant='ghost'
              onClick={() => table.resetColumnFilters()}
              className='h-8 px-2 lg:px-3'
            >
              Reset
              <Cross2Icon className='ml-2 h-4 w-4' />
            </Button>
          )}
        </div>
        <DataTableViewOptions table={table} />
      </div>
    </div>
  )
}
