import React from 'react'
import { FormRenderer } from '@/components/builders'
import { Resource } from '@/lib/resources/types'
import { BasePage } from './base-page'
import { useNavigate } from '@tanstack/react-router'

interface CreatePageProps<T = any> {
  resource: Resource<T>
  onSuccess?: (record: T) => void
  onCancel?: () => void
  initialData?: Partial<T>
  className?: string
}

export function CreatePage<T = any>({ 
  resource, 
  onSuccess,
  onCancel,
  initialData,
  className 
}: CreatePageProps<T>) {
  const navigate = useNavigate()
  const pageConfig = resource.getCreatePageConfig()
  const formConfig = resource.getFormSchema()

  const handleSubmit = async (data: any) => {
    try {
      // Apply beforeSave hook if available
      let processedData = data
      if (resource.beforeSave) {
        processedData = await resource.beforeSave(data)
      }

      // Create the record
      const record = await resource.createRecord(processedData)

      // Apply afterSave hook if available
      if (resource.afterSave) {
        await resource.afterSave(record)
      }

      // Handle success
      if (onSuccess) {
        onSuccess(record)
      } else {
        // Navigate back to list page
        navigate({ to: resource.getRoute() })
      }
    } catch (error) {
      console.error('Failed to create record:', error)
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

  // Enhance form config with handlers and initial data
  const enhancedFormConfig = {
    ...formConfig,
    defaultValues: {
      ...formConfig.defaultValues,
      ...initialData,
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
        <FormRenderer config={enhancedFormConfig} />
      </div>
    </BasePage>
  )
}

// Hook for managing create page state
export function useCreatePage<T>(resource: Resource<T>) {
  const [loading, setLoading] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)

  const create = React.useCallback(async (data: Partial<T>) => {
    try {
      setLoading(true)
      setError(null)
      
      // Apply beforeSave hook if available
      let processedData = data
      if (resource.beforeSave) {
        processedData = await resource.beforeSave(data)
      }

      // Create the record
      const record = await resource.createRecord(processedData)

      // Apply afterSave hook if available
      if (resource.afterSave) {
        await resource.afterSave(record)
      }

      return record
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create record'
      setError(errorMessage)
      throw err
    } finally {
      setLoading(false)
    }
  }, [resource])

  return {
    create,
    loading,
    error,
  }
}