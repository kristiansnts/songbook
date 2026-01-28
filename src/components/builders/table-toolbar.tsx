import { Cross2Icon } from '@radix-ui/react-icons'
import { Table } from '@tanstack/react-table'
import { FilterConfig, BulkActionConfig } from '@/lib/builders/table-builder'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Input } from '@/components/ui/input'

interface TableToolbarProps<T> {
  table: Table<T>
  searchable?: boolean
  searchPlaceholder?: string
  searchColumnId?: string
  filters?: FilterConfig[]
  bulkActions?: BulkActionConfig<T>[]
  selectedRows?: any[]
  showViewOptions?: boolean
  onSearchBlur?: (query: string) => void
}

export function DataTableToolbar<T>({
  table,
  searchable = true,
  searchPlaceholder = 'Search...',
  searchColumnId,
  filters = [],
  bulkActions = [],
  selectedRows = [],
  showViewOptions = true,
  onSearchBlur,
}: TableToolbarProps<T>) {
  const isFiltered = table.getState().columnFilters.length > 0

  return (
    <div className='flex items-center justify-between'>
      <div className='flex flex-1 items-center space-x-2'>
        {searchable && searchColumnId && (
          <Input
            placeholder={searchPlaceholder}
            value={
              (table.getColumn(searchColumnId)?.getFilterValue() as string) ??
              ''
            }
            onChange={(event) =>
              table
                .getColumn(searchColumnId)
                ?.setFilterValue(event.target.value)
            }
            onBlur={(event) => {
              if (onSearchBlur) {
                onSearchBlur(event.target.value)
              }
            }}
            className='h-8 w-[150px] lg:w-[250px]'
          />
        )}

        {filters.map((filter) => (
          <FilterDropdown key={filter.name} filter={filter} table={table} />
        ))}

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

      <div className='flex items-center space-x-2'>
        {selectedRows.length > 0 && bulkActions.length > 0 && (
          <div className='flex items-center space-x-2'>
            <Badge variant='secondary'>{selectedRows.length} selected</Badge>
            {bulkActions.map((action, index) => (
              <Button
                key={index}
                variant={action.variant || 'outline'}
                size='sm'
                onClick={() => action.onClick(selectedRows)}
                className='h-8'
              >
                {action.icon}
                {action.label}
              </Button>
            ))}
          </div>
        )}

        {showViewOptions && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant='outline'
                size='sm'
                className='ml-auto hidden h-8 lg:flex'
              >
                <svg
                  className='mr-2 h-4 w-4'
                  viewBox='0 0 20 20'
                  fill='currentColor'
                >
                  <path
                    fillRule='evenodd'
                    d='M3 3a1 1 0 011-1h12a1 1 0 011 1v3a1 1 0 01-.293.707L12 11.414V15a1 1 0 01-.293.707l-2 2A1 1 0 018 17v-5.586L3.293 6.707A1 1 0 013 6V3z'
                    clipRule='evenodd'
                  />
                </svg>
                View
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align='end' className='w-[150px]'>
              {table
                .getAllColumns()
                .filter(
                  (column) =>
                    typeof column.accessorFn !== 'undefined' &&
                    column.getCanHide()
                )
                .map((column) => {
                  return (
                    <DropdownMenuItem
                      key={column.id}
                      className='capitalize'
                      onClick={() =>
                        column.toggleVisibility(!column.getIsVisible())
                      }
                    >
                      <input
                        type='checkbox'
                        checked={column.getIsVisible()}
                        readOnly
                        className='mr-2'
                      />
                      {column.id}
                    </DropdownMenuItem>
                  )
                })}
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>
    </div>
  )
}

function FilterDropdown<T>({
  filter,
  table,
}: {
  filter: FilterConfig
  table: Table<T>
}) {
  const column = table.getColumn(filter.name)
  const facetedUniqueValues = column?.getFacetedUniqueValues()
  const selectedValues = new Set(column?.getFilterValue() as string[])

  if (filter.type === 'select' && filter.options) {
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant='outline' size='sm' className='h-8 border-dashed'>
            <svg
              className='mr-2 h-4 w-4'
              viewBox='0 0 20 20'
              fill='currentColor'
            >
              <path
                fillRule='evenodd'
                d='M3 3a1 1 0 011-1h12a1 1 0 011 1v3a1 1 0 01-.293.707L12 11.414V15a1 1 0 01-.293.707l-2 2A1 1 0 018 17v-5.586L3.293 6.707A1 1 0 013 6V3z'
                clipRule='evenodd'
              />
            </svg>
            {filter.label}
            {selectedValues?.size > 0 && (
              <>
                <div className='ml-2 h-4 w-px bg-gray-300' />
                <Badge
                  variant='secondary'
                  className='rounded-sm px-1 font-normal lg:hidden'
                >
                  {selectedValues.size}
                </Badge>
                <div className='hidden space-x-1 lg:flex'>
                  {selectedValues.size > 2 ? (
                    <Badge
                      variant='secondary'
                      className='rounded-sm px-1 font-normal'
                    >
                      {selectedValues.size} selected
                    </Badge>
                  ) : (
                    filter.options
                      .filter((option) => selectedValues.has(option.value))
                      .map((option) => (
                        <Badge
                          variant='secondary'
                          key={option.value}
                          className='rounded-sm px-1 font-normal'
                        >
                          {option.label}
                        </Badge>
                      ))
                  )}
                </div>
              </>
            )}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className='w-[200px]' align='start'>
          {filter.options.map((option) => {
            const isSelected = selectedValues.has(option.value)
            return (
              <DropdownMenuItem
                key={option.value}
                onClick={() => {
                  if (isSelected) {
                    selectedValues.delete(option.value)
                  } else {
                    selectedValues.add(option.value)
                  }
                  const filterValues = Array.from(selectedValues)
                  column?.setFilterValue(
                    filterValues.length ? filterValues : undefined
                  )
                }}
              >
                <input
                  type='checkbox'
                  checked={isSelected}
                  readOnly
                  className='mr-2'
                />
                {option.label}
                {facetedUniqueValues?.get(option.value) && (
                  <span className='bg-muted ml-auto flex h-4 w-4 items-center justify-center rounded-sm text-xs'>
                    {facetedUniqueValues.get(option.value)}
                  </span>
                )}
              </DropdownMenuItem>
            )
          })}
        </DropdownMenuContent>
      </DropdownMenu>
    )
  }

  return null
}
