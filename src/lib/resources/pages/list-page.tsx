import React from 'react'
import { Resource } from '@/lib/resources/types'
import { TableRenderer } from '@/components/builders'
import { BasePage } from './base-page'

interface ListPageProps<T = any> {
  resource: Resource<T>
  data: T[]
  loading?: boolean
  onRefresh?: () => void
  className?: string
}

export function ListPage<T = any>({
  resource,
  data,
  loading = false,
  onRefresh,
  className,
}: ListPageProps<T>) {
  const pageConfig = resource.getListPageConfig()
  const tableConfig = resource.getTableSchema()

  // Merge resource data with table config
  const enhancedTableConfig = {
    ...tableConfig,
    data,
    loading,
    onRefresh,
    bulkActions: [
      ...(tableConfig.bulkActions || []),
      ...resource.getBulkActions().map((action) => ({
        label: action.label,
        icon: action.icon,
        onClick: async (rows: any) => {
          await action.action(rows)
          onRefresh?.()
        },
        variant: (action.color ? 'default' : 'outline') as
          | 'default'
          | 'secondary'
          | 'destructive'
          | 'outline',
        requiresConfirmation: action.requiresConfirmation,
        confirmationTitle: action.confirmationTitle,
        confirmationMessage: action.confirmationMessage,
      })),
    ],
  }

  // Add default actions to table columns if not already present
  const hasActionsColumn = tableConfig.columns?.some(
    (col) => col.type === 'actions'
  )
  if (!hasActionsColumn) {
    const defaultActions = [
      {
        label: 'Edit',
        onClick: (row: any) => resource.navigateToEdit?.(row.original.id),
      },
      {
        label: 'Delete',
        onClick: async (row: any) => {
          if (resource.beforeDelete) {
            const canDelete = await resource.beforeDelete(row.original)
            if (!canDelete) return
          }

          await resource.deleteRecord(row.original.id)

          if (resource.afterDelete) {
            await resource.afterDelete(row.original)
          }

          onRefresh?.()
        },
        variant: 'destructive' as const,
        requiresConfirmation: true,
        confirmationTitle: `Delete ${resource.getLabel()}`,
        confirmationMessage: `Are you sure you want to delete this ${resource.getLabel().toLowerCase()}?`,
      },
    ]

    enhancedTableConfig.columns = [
      ...(enhancedTableConfig.columns || []),
      {
        name: 'actions',
        label: 'Actions',
        type: 'actions' as const,
        actions: defaultActions,
        width: '10%',
      },
    ]
  }

  return (
    <BasePage resource={resource} config={pageConfig} className={className}>
      <div className='space-y-4'>
        <TableRenderer config={enhancedTableConfig} />
      </div>
    </BasePage>
  )
}

// Hook for managing list page state
export function useListPage<T>(resource: Resource<T>) {
  const [data, setData] = React.useState<T[]>([])
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)

  const loadData = React.useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const records = await resource.getRecords()
      setData(records)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load data')
    } finally {
      setLoading(false)
    }
  }, [resource])

  React.useEffect(() => {
    loadData()
  }, [loadData])

  const refresh = React.useCallback(() => {
    loadData()
  }, [loadData])

  return {
    data,
    loading,
    error,
    refresh,
  }
}
