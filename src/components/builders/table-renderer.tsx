import React, { useState } from 'react'
import {
  ColumnDef,
  ColumnFiltersState,
  SortingState,
  VisibilityState,
  flexRender,
  getCoreRowModel,
  getFacetedRowModel,
  getFacetedUniqueValues,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from '@tanstack/react-table'
import { format } from 'date-fns'
import { formatDistanceToNow } from 'date-fns'
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu'
import { MoreHorizontal, Check, X } from 'lucide-react'
import { cn } from '@/lib/utils'
import { ConfirmDialog } from '@/components/confirm-dialog'
import { 
  TableBuilderConfig, 
  ColumnConfig,
  TextColumnConfig,
  BadgeColumnConfig,
  DateColumnConfig,
  ActionsColumnConfig,
  ImageColumnConfig,
  IconColumnConfig,
  BooleanColumnConfig,
  NumberColumnConfig,
  ActionConfig
} from '@/lib/builders/table-builder'
import { DataTablePagination } from '@/features/songs/components/data-table-pagination'
import { DataTableToolbar } from './table-toolbar'

interface TableRendererProps<T = any> {
  config: TableBuilderConfig<T>
  className?: string
}

export function TableRenderer<T = any>({ 
  config, 
  className 
}: TableRendererProps<T>) {
  const [rowSelection, setRowSelection] = React.useState({})
  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({})
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([])
  const [sorting, setSorting] = React.useState<SortingState>([])
  const [refreshKey, setRefreshKey] = React.useState(0)

  const forceRefresh = React.useCallback(() => {
    setRefreshKey(prev => prev + 1)
  }, [])

  const columns = React.useMemo(() => {
    const tableColumns: ColumnDef<T>[] = []

    if (config.selectable) {
      tableColumns.push({
        id: 'select',
        header: ({ table }) => (
          <Checkbox
            checked={
              table.getIsAllPageRowsSelected() ||
              (table.getIsSomePageRowsSelected() && 'indeterminate')
            }
            onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
            aria-label="Select all"
          />
        ),
        cell: ({ row }) => (
          <Checkbox
            checked={row.getIsSelected()}
            onCheckedChange={(value) => row.toggleSelected(!!value)}
            aria-label="Select row"
          />
        ),
        enableSorting: false,
        enableHiding: false,
      })
    }

    config.columns.forEach((columnConfig) => {
      if (columnConfig.hidden) return

      const column: ColumnDef<T> = {
        id: columnConfig.name,
        accessorKey: columnConfig.accessor || columnConfig.name,
        header: columnConfig.label,
        enableSorting: columnConfig.sortable ?? true,
        cell: ({ row }) => {
          const value = row.getValue(columnConfig.name)
          return renderCell(columnConfig, value, row, config.onRefresh || forceRefresh)
        },
      }

      if (columnConfig.width) {
        column.size = typeof columnConfig.width === 'number' 
          ? columnConfig.width 
          : parseInt(columnConfig.width.toString())
      }

      tableColumns.push(column)
    })

    return tableColumns
  }, [config.columns, config.selectable, forceRefresh, refreshKey])

  const table = useReactTable({
    data: config.data,
    columns,
    state: {
      sorting,
      columnVisibility,
      rowSelection,
      columnFilters,
    },
    enableRowSelection: config.selectable,
    onRowSelectionChange: setRowSelection,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFacetedRowModel: getFacetedRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues(),
    initialState: {
      pagination: {
        pageSize: config.pageSize || 10,
      },
    },
  })

  const selectedRows = table.getSelectedRowModel().rows

  return (
    <div className={cn('space-y-4', className)}>
      <DataTableToolbar 
        table={table}
        searchable={config.searchable}
        searchPlaceholder={config.searchPlaceholder}
        searchColumnId={config.searchColumnId}
        filters={config.filters}
        bulkActions={config.bulkActions}
        selectedRows={selectedRows}
        showViewOptions={config.showViewOptions}
        onSearchBlur={config.onSearchBlur}
      />
      
      <div className="rounded-md border overflow-hidden">
        <div className="overflow-x-auto">
          <Table className="w-full">
            <TableHeader>
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map((header) => (
                    <TableHead key={header.id}>
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                    </TableHead>
                  ))}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              {table.getRowModel().rows?.length ? (
                table.getRowModel().rows.map((row) => (
                  <TableRow
                    key={row.id}
                    data-state={row.getIsSelected() && 'selected'}
                    className={config.onRowClick ? 'cursor-pointer' : ''}
                    onClick={() => config.onRowClick?.(row)}
                  >
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id}>
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={columns.length} className="h-24 text-center">
                    {config.emptyState ? (
                      <div className="flex flex-col items-center gap-2">
                        {config.emptyState.icon}
                        <div className="text-sm font-medium">{config.emptyState.title}</div>
                        {config.emptyState.description && (
                          <div className="text-xs text-muted-foreground">
                            {config.emptyState.description}
                          </div>
                        )}
                      </div>
                    ) : (
                      'No results.'
                    )}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {config.pagination && (
        <DataTablePagination table={table} />
      )}
    </div>
  )
}

function renderCell<T>(columnConfig: ColumnConfig<T>, value: any, row: any, onRefresh?: () => void) {
  switch (columnConfig.type) {
    case 'text':
      return renderTextCell(columnConfig as TextColumnConfig<T>, value)
    
    case 'badge':
      return renderBadgeCell(columnConfig as BadgeColumnConfig<T>, value)
    
    case 'date':
      return renderDateCell(columnConfig as DateColumnConfig<T>, value)
    
    case 'actions':
      return renderActionsCell(columnConfig as ActionsColumnConfig<T>, row, onRefresh)
    
    case 'image':
      return renderImageCell(columnConfig as ImageColumnConfig<T>, value)
    
    case 'icon':
      return renderIconCell(columnConfig as IconColumnConfig<T>, value)
    
    case 'boolean':
      return renderBooleanCell(columnConfig as BooleanColumnConfig<T>, value)
    
    case 'number':
      return renderNumberCell(columnConfig as NumberColumnConfig<T>, value)
    
    default:
      return String(value || '')
  }
}

function renderTextCell<T>(config: TextColumnConfig<T>, value: any) {
  const text = config.format ? config.format(value) : String(value || '')
  
  if (config.truncate && config.maxLength && text.length > config.maxLength) {
    return (
      <span title={text} className={config.className}>
        {text.slice(0, config.maxLength)}...
      </span>
    )
  }
  
  return <span className={config.className}>{text}</span>
}

function renderBadgeCell<T>(config: BadgeColumnConfig<T>, value: any) {
  const text = String(value || '')
  const colorName = config.colors?.[value] || 'default'
  
  const getBadgeColorClass = (color: string) => {
    switch (color) {
      case 'green':
        return 'bg-green-100 text-green-800 border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800'
      case 'red':
        return 'bg-red-100 text-red-800 border-red-200 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800'
      case 'yellow':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-400 dark:border-yellow-800'
      case 'blue':
        return 'bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-800'
      default:
        return ''
    }
  }
  
  return (
    <Badge 
      variant={config.variant || 'outline'}
      className={cn(config.className, getBadgeColorClass(colorName))}
    >
      {text}
    </Badge>
  )
}

function renderDateCell<T>(config: DateColumnConfig<T>, value: any) {
  if (!value) return null
  
  const date = new Date(value)
  
  if (config.relative) {
    return (
      <span className={config.className}>
        {formatDistanceToNow(date, { addSuffix: true })}
      </span>
    )
  }
  
  const formatted = config.format 
    ? format(date, config.format)
    : date.toLocaleDateString()
  
  return <span className={config.className}>{formatted}</span>
}

function ActionButton<T>({ action, row, className, onRefresh }: { action: ActionConfig<T>, row: any, className?: string, onRefresh?: () => void }) {
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const handleClick = async () => {
    if (action.requiresConfirmation) {
      setConfirmOpen(true)
    } else {
      executeAction()
    }
  }

  const executeAction = async () => {
    setIsLoading(true)
    try {
      await Promise.resolve(action.onClick(row, onRefresh))
      // Additional refresh call removed as it's now handled in the onClick
    } finally {
      setIsLoading(false)
      setConfirmOpen(false)
    }
  }

  const getColorClass = (color?: string) => {
    switch (color) {
      case 'green':
        return 'border-green-500 text-green-600 hover:bg-green-500 hover:text-white hover:border-green-500 dark:border-green-400 dark:text-green-400 dark:hover:bg-green-500 dark:hover:text-white dark:hover:border-green-500'
      case 'red':
        return 'border-red-500 text-red-600 hover:bg-red-500 hover:text-white hover:border-red-500 dark:border-red-400 dark:text-red-400 dark:hover:bg-red-500 dark:hover:text-white dark:hover:border-red-500'
      case 'yellow':
        return 'border-yellow-500 text-yellow-600 hover:bg-yellow-500 hover:text-white hover:border-yellow-500 dark:border-yellow-400 dark:text-yellow-400 dark:hover:bg-yellow-500 dark:hover:text-white dark:hover:border-yellow-500'
      default:
        return ''
    }
  }

  return (
    <>
      <Button
        variant={action.variant || 'ghost'}
        size={action.size as any || 'sm'}
        disabled={action.disabled?.(row) || isLoading}
        onClick={handleClick}
        className={cn(className, action.color && getColorClass(action.color))}
      >
        {action.icon}
        {action.label}
      </Button>
      
      {action.requiresConfirmation && (
        <ConfirmDialog
          open={confirmOpen}
          onOpenChange={setConfirmOpen}
          title={action.confirmationTitle || 'Confirm Action'}
          desc={action.confirmationMessage || 'Are you sure you want to perform this action?'}
          destructive={action.variant === 'destructive'}
          isLoading={isLoading}
          handleConfirm={executeAction}
        />
      )}
    </>
  )
}

function renderActionsCell<T>(config: ActionsColumnConfig<T>, row: any, onRefresh?: () => void) {
  const visibleActions = config.actions.filter(
    action => !action.hidden || !action.hidden(row)
  )

  if (visibleActions.length === 0) return null

  if (visibleActions.length === 1) {
    const action = visibleActions[0]
    return (
      <ActionButton
        action={action}
        row={row}
        className={config.className}
        onRefresh={onRefresh}
      />
    )
  }

  return <ActionDropdown actions={visibleActions} row={row} className={config.className} onRefresh={onRefresh} />
}

function ActionDropdown<T>({ actions, row, className, onRefresh }: { actions: ActionConfig<T>[], row: any, className?: string, onRefresh?: () => void }) {
  const [confirmAction, setConfirmAction] = useState<ActionConfig<T> | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const handleActionClick = async (action: ActionConfig<T>) => {
    if (action.requiresConfirmation) {
      setConfirmAction(action)
    } else {
      executeAction(action)
    }
  }

  const executeAction = async (action: ActionConfig<T>) => {
    setIsLoading(true)
    try {
      await Promise.resolve(action.onClick(row, onRefresh))
      // Additional refresh call removed as it's now handled in the onClick
    } finally {
      setIsLoading(false)
      setConfirmAction(null)
    }
  }

  const getDropdownColorClass = (color?: string) => {
    switch (color) {
      case 'green':
        return 'text-green-600 focus:bg-green-50 focus:text-green-700 dark:text-green-400 dark:focus:bg-green-950'
      case 'red':
        return 'text-red-600 focus:bg-red-50 focus:text-red-700 dark:text-red-400 dark:focus:bg-red-950'
      case 'yellow':
        return 'text-yellow-600 focus:bg-yellow-50 focus:text-yellow-700 dark:text-yellow-400 dark:focus:bg-yellow-950'
      default:
        return ''
    }
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="sm" className={cn('h-8 w-8 p-0', className)}>
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          {actions.map((action, index) => (
            <DropdownMenuItem
              key={index}
              disabled={action.disabled?.(row) || isLoading}
              onClick={() => handleActionClick(action)}
              className={action.color ? getDropdownColorClass(action.color) : ''}
            >
              {action.icon}
              {action.label}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
      
      {confirmAction && (
        <ConfirmDialog
          open={!!confirmAction}
          onOpenChange={(open) => !open && setConfirmAction(null)}
          title={confirmAction.confirmationTitle || 'Confirm Action'}
          desc={confirmAction.confirmationMessage || 'Are you sure you want to perform this action?'}
          destructive={confirmAction.variant === 'destructive'}
          isLoading={isLoading}
          handleConfirm={() => executeAction(confirmAction)}
        />
      )}
    </>
  )
}

function renderImageCell<T>(config: ImageColumnConfig<T>, value: any) {
  const size = config.size || 'md'
  const sizeClass = {
    sm: 'h-6 w-6',
    md: 'h-8 w-8',
    lg: 'h-10 w-10',
  }[size]

  return (
    <Avatar className={cn(sizeClass, config.className)}>
      <AvatarImage src={value} />
      <AvatarFallback>
        {config.fallback || '?'}
      </AvatarFallback>
    </Avatar>
  )
}

function renderIconCell<T>(config: IconColumnConfig<T>, value: any) {
  const icon = config.iconMap?.[value]
  
  if (!icon) return null
  
  const size = config.size || 'md'
  const sizeClass = {
    sm: 'h-4 w-4',
    md: 'h-5 w-5',
    lg: 'h-6 w-6',
  }[size]

  return (
    <span className={cn(sizeClass, config.className)}>
      {icon}
    </span>
  )
}

function renderBooleanCell<T>(config: BooleanColumnConfig<T>, value: any) {
  const isTrue = Boolean(value)
  
  if (config.showIcons) {
    return (
      <span className={cn('flex items-center', config.className)}>
        {isTrue ? (
          <Check className="h-4 w-4 text-green-500" />
        ) : (
          <X className="h-4 w-4 text-red-500" />
        )}
      </span>
    )
  }
  
  const text = isTrue 
    ? (config.trueLabel || 'Yes')
    : (config.falseLabel || 'No')
  
  return <span className={config.className}>{text}</span>
}

function renderNumberCell<T>(config: NumberColumnConfig<T>, value: any) {
  const num = Number(value)
  
  if (isNaN(num)) return null
  
  if (config.format) {
    return <span className={config.className}>{config.format(num)}</span>
  }
  
  if (config.currency) {
    return (
      <span className={config.className}>
        ${num.toLocaleString(undefined, { 
          minimumFractionDigits: config.precision || 2,
          maximumFractionDigits: config.precision || 2,
        })}
      </span>
    )
  }
  
  return (
    <span className={config.className}>
      {num.toLocaleString(undefined, {
        minimumFractionDigits: config.precision,
        maximumFractionDigits: config.precision,
      })}
    </span>
  )
}