import React from 'react'
import { FormRenderer } from '@/components/builders'
import { Resource } from '@/lib/resources/types'
import { BasePage } from './base-page'
import { useNavigate } from '@tanstack/react-router'

interface EditPageProps<T = any> {
  resource: Resource<T>
  recordId: string
  onSuccess?: (record: T) => void
  onCancel?: () => void
  className?: string
}

export function EditPage<T = any>({ 
  resource, 
  recordId,
  onSuccess,
  onCancel,
  className 
}: EditPageProps<T>) {
  const navigate = useNavigate()
  const [record, setRecord] = React.useState<T | null>(null)
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)

  const pageConfig = resource.getEditPageConfig()
  const formConfig = resource.getFormSchema()

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

  const handleSubmit = async (data: any) => {
    try {
      // Apply beforeSave hook if available
      let processedData = data
      if (resource.beforeSave) {
        processedData = await resource.beforeSave(data)
      }

      // Update the record
      const updatedRecord = await resource.updateRecord(recordId, processedData)

      // Apply afterSave hook if available
      if (resource.afterSave) {
        await resource.afterSave(updatedRecord)
      }

      // Handle success
      if (onSuccess) {
        onSuccess(updatedRecord)
      } else {
        // Navigate back to list page
        navigate({ to: resource.getRoute() })
      }
    } catch (error) {
      console.error('Failed to update record:', error)
      // Handle error (show toast, etc.)
    }
  }

  const handleCancel = () => {
    if (onCancel) {
      onCancel()
    } else {
      // Navigate back to list page
      navigate({ to: resource.getRoute() })
    }
  }

  if (loading) {
    return (
      <BasePage 
        resource={resource} 
        config={pageConfig} 
        className={className}
      >
        <div className="flex items-center justify-center p-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </BasePage>
    )
  }

  if (error) {
    return (
      <BasePage 
        resource={resource} 
        config={pageConfig} 
        className={className}
      >
        <div className="text-center p-8">
          <p className="text-red-600">{error}</p>
        </div>
      </BasePage>
    )
  }

  if (!record) {
    return (
      <BasePage 
        resource={resource} 
        config={pageConfig} 
        className={className}
      >
        <div className="text-center p-8">
          <p className="text-muted-foreground">Record not found</p>
        </div>
      </BasePage>
    )
  }

  // Enhance form config with handlers and record data
  const enhancedFormConfig = {
    ...formConfig,
    defaultValues: {
      ...formConfig.defaultValues,
      ...record,
    },
    onSubmit: handleSubmit,
    onCancel: handleCancel,
  }

  return (
    <BasePage 
      resource={resource} 
      config={pageConfig} 
      className={className}
    >
      <div className="max-w-4xl">
        <FormRenderer key={recordId} config={enhancedFormConfig} />
      </div>
    </BasePage>
  )
}

// Hook for managing edit page state
export function useEditPage<T>(resource: Resource<T>, recordId: string) {
  const [record, setRecord] = React.useState<T | null>(null)
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)
  const [saving, setSaving] = React.useState(false)

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

  const update = React.useCallback(async (data: Partial<T>) => {
    try {
      setSaving(true)
      setError(null)
      
      // Apply beforeSave hook if available
      let processedData = data
      if (resource.beforeSave) {
        processedData = await resource.beforeSave(data)
      }

      // Update the record
      const updatedRecord = await resource.updateRecord(recordId, processedData)

      // Apply afterSave hook if available
      if (resource.afterSave) {
        await resource.afterSave(updatedRecord)
      }

      setRecord(updatedRecord)
      return updatedRecord
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update record'
      setError(errorMessage)
      throw err
    } finally {
      setSaving(false)
    }
  }, [resource, recordId])

  return {
    record,
    loading,
    error,
    saving,
    update,
    refresh: loadRecord,
  }
}