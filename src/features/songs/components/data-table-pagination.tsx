import {
  ChevronLeftIcon,
  ChevronRightIcon,
  DoubleArrowLeftIcon,
  DoubleArrowRightIcon,
} from '@radix-ui/react-icons'
import { Table } from '@tanstack/react-table'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

interface DataTablePaginationProps<TData> {
  table: Table<TData>
  serverSidePagination?: {
    currentPage: number
    totalPages: number
    totalItems: number
    itemsPerPage: number
    hasNextPage: boolean
    hasPrevPage: boolean
    onPageChange: (page: number) => void
    onPageSizeChange: (pageSize: number) => void
  }
}

export function DataTablePagination<TData>({
  table,
  serverSidePagination,
}: DataTablePaginationProps<TData>) {
  // Use server-side pagination if provided, otherwise fall back to client-side
  const isServerSide = !!serverSidePagination

  const currentPage = isServerSide
    ? serverSidePagination.currentPage
    : table.getState().pagination.pageIndex + 1

  const totalPages = isServerSide
    ? serverSidePagination.totalPages
    : table.getPageCount()

  const pageSize = isServerSide
    ? serverSidePagination.itemsPerPage
    : table.getState().pagination.pageSize

  const totalItems = isServerSide
    ? serverSidePagination.totalItems
    : table.getFilteredRowModel().rows.length

  const canPreviousPage = isServerSide
    ? serverSidePagination.hasPrevPage
    : table.getCanPreviousPage()

  const canNextPage = isServerSide
    ? serverSidePagination.hasNextPage
    : table.getCanNextPage()

  const handlePageSizeChange = (value: string) => {
    const newPageSize = Number(value)
    if (isServerSide) {
      serverSidePagination.onPageSizeChange(newPageSize)
    } else {
      table.setPageSize(newPageSize)
    }
  }

  const handleFirstPage = () => {
    if (isServerSide) {
      serverSidePagination.onPageChange(1)
    } else {
      table.setPageIndex(0)
    }
  }

  const handlePreviousPage = () => {
    if (isServerSide) {
      serverSidePagination.onPageChange(currentPage - 1)
    } else {
      table.previousPage()
    }
  }

  const handleNextPage = () => {
    if (isServerSide) {
      serverSidePagination.onPageChange(currentPage + 1)
    } else {
      table.nextPage()
    }
  }

  const handleLastPage = () => {
    if (isServerSide) {
      serverSidePagination.onPageChange(totalPages)
    } else {
      table.setPageIndex(table.getPageCount() - 1)
    }
  }

  return (
    <div
      className='flex items-center justify-between overflow-clip px-2'
      style={{ overflowClipMargin: 1 }}
    >
      <div className='text-muted-foreground hidden flex-1 text-sm sm:block'>
        {!isServerSide && (
          <>
            {table.getFilteredSelectedRowModel().rows.length} of{' '}
            {table.getFilteredRowModel().rows.length} row(s) selected.
          </>
        )}
        {isServerSide && <>{totalItems} total item(s).</>}
      </div>
      <div className='flex items-center sm:space-x-6 lg:space-x-8'>
        <div className='flex items-center space-x-2'>
          <p className='hidden text-sm font-medium sm:block'>Rows per page</p>
          <Select value={`${pageSize}`} onValueChange={handlePageSizeChange}>
            <SelectTrigger className='h-8 w-[70px]'>
              <SelectValue placeholder={pageSize} />
            </SelectTrigger>
            <SelectContent>
              {[5, 10, 15, 20, 25].map((pageSizeOption) => (
                <SelectItem key={pageSizeOption} value={`${pageSizeOption}`}>
                  {pageSizeOption}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className='flex w-[100px] items-center justify-center text-sm font-medium'>
          Page {currentPage} of {totalPages}
        </div>
        <div className='flex items-center space-x-2'>
          <Button
            variant='outline'
            className='hidden h-8 w-8 p-0 lg:flex'
            onClick={handleFirstPage}
            disabled={!canPreviousPage}
          >
            <span className='sr-only'>Go to first page</span>
            <DoubleArrowLeftIcon className='h-4 w-4' />
          </Button>
          <Button
            variant='outline'
            className='h-8 w-8 p-0'
            onClick={handlePreviousPage}
            disabled={!canPreviousPage}
          >
            <span className='sr-only'>Go to previous page</span>
            <ChevronLeftIcon className='h-4 w-4' />
          </Button>
          <Button
            variant='outline'
            className='h-8 w-8 p-0'
            onClick={handleNextPage}
            disabled={!canNextPage}
          >
            <span className='sr-only'>Go to next page</span>
            <ChevronRightIcon className='h-4 w-4' />
          </Button>
          <Button
            variant='outline'
            className='hidden h-8 w-8 p-0 lg:flex'
            onClick={handleLastPage}
            disabled={!canNextPage}
          >
            <span className='sr-only'>Go to last page</span>
            <DoubleArrowRightIcon className='h-4 w-4' />
          </Button>
        </div>
      </div>
    </div>
  )
}
