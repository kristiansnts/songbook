import React from 'react'
import { useNavigate } from '@tanstack/react-router'
import { Resource } from '@/lib/resources/types'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { BasePage } from './base-page'

interface ViewPageProps<T = any> {
  resource: Resource<T>
  recordId: string
  onEdit?: (record: T) => void
  onDelete?: (record: T) => void
  className?: string
}

export function ViewPage<T = any>({
  resource,
  recordId,
  onEdit,
  onDelete,
  className,
}: ViewPageProps<T>) {
  const navigate = useNavigate()
  const [record, setRecord] = React.useState<T | null>(null)
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)

  const pageConfig = resource.getViewPageConfig()

  // Load the record
  React.useEffect(() => {
    const loadRecord = async () => {
      try {
        setLoading(true)
        setError(null)
        const data = await resource.getRecord(recordId)
        if (!data) {
          throw new Error('Record not found')
        }
        setRecord(data)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load record')
      } finally {
        setLoading(false)
      }
    }

    loadRecord()
  }, [resource, recordId])

  const handleEdit = () => {
    if (onEdit && record) {
      onEdit(record)
    } else {
      navigate({ to: `${resource.getRoute()}/edit/${recordId}` })
    }
  }

  const handleDelete = async () => {
    if (!record) return

    try {
      if (resource.beforeDelete) {
        const canDelete = await resource.beforeDelete(record)
        if (!canDelete) return
      }

      await resource.deleteRecord(recordId)

      if (resource.afterDelete) {
        await resource.afterDelete(record)
      }

      if (onDelete) {
        onDelete(record)
      } else {
        navigate({ to: resource.getRoute() })
      }
    } catch (error) {
      console.error('Failed to delete record:', error)
    }
  }

  // Add action buttons to page config
  const enhancedPageConfig = {
    ...pageConfig,
    actions: [
      ...(pageConfig.actions || []),
      {
        name: 'edit',
        label: 'Edit',
        action: handleEdit,
      },
      {
        name: 'delete',
        label: 'Delete',
        action: handleDelete,
        color: 'red',
      },
    ],
  }

  if (loading) {
    return (
      <BasePage
        resource={resource}
        config={enhancedPageConfig}
        className={className}
      >
        <div className='flex items-center justify-center p-8'>
          <div className='border-primary h-8 w-8 animate-spin rounded-full border-b-2'></div>
        </div>
      </BasePage>
    )
  }

  if (error) {
    return (
      <BasePage
        resource={resource}
        config={enhancedPageConfig}
        className={className}
      >
        <div className='p-8 text-center'>
          <p className='text-red-600'>{error}</p>
        </div>
      </BasePage>
    )
  }

  if (!record) {
    return (
      <BasePage
        resource={resource}
        config={enhancedPageConfig}
        className={className}
      >
        <div className='p-8 text-center'>
          <p className='text-muted-foreground'>Record not found</p>
        </div>
      </BasePage>
    )
  }

  return (
    <BasePage
      resource={resource}
      config={enhancedPageConfig}
      className={className}
    >
      <div className='max-w-4xl'>
        <RecordViewer record={record} />
      </div>
    </BasePage>
  )
}

// Generic record viewer component
function RecordViewer<T extends Record<string, any>>({
  record,
}: {
  record: T
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Record Details</CardTitle>
      </CardHeader>
      <CardContent>
        <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
          {Object.entries(record).map(([key, value]) => (
            <div key={key} className='space-y-1'>
              <label className='text-muted-foreground text-sm font-medium capitalize'>
                {key.replace(/([A-Z])/g, ' $1').trim()}
              </label>
              <div className='text-sm'>{formatValue(value)}</div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

// Helper function to format values for display
function formatValue(value: any): string {
  if (value === null || value === undefined) {
    return '-'
  }

  if (typeof value === 'boolean') {
    return value ? 'Yes' : 'No'
  }

  if (typeof value === 'object') {
    if (value instanceof Date) {
      return value.toLocaleDateString()
    }
    return JSON.stringify(value, null, 2)
  }

  return String(value)
}

// Hook for managing view page state
export function useViewPage<T>(resource: Resource<T>, recordId: string) {
  const [record, setRecord] = React.useState<T | null>(null)
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)

  const loadRecord = React.useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await resource.getRecord(recordId)
      if (!data) {
        throw new Error('Record not found')
      }
      setRecord(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load record')
    } finally {
      setLoading(false)
    }
  }, [resource, recordId])

  React.useEffect(() => {
    loadRecord()
  }, [loadRecord])

  const deleteRecord = React.useCallback(async () => {
    if (!record) return

    try {
      if (resource.beforeDelete) {
        const canDelete = await resource.beforeDelete(record)
        if (!canDelete) return
      }

      await resource.deleteRecord(recordId)

      if (resource.afterDelete) {
        await resource.afterDelete(record)
      }

      return true
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete record')
      return false
    }
  }, [resource, record, recordId])

  return {
    record,
    loading,
    error,
    deleteRecord,
    refresh: loadRecord,
  }
}
