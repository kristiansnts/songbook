import React from 'react'
import { Table } from '@tanstack/react-table'
import { BasePage } from '@/lib/resources/pages/base-page'
import { TableRenderer } from '@/components/builders'
import { UserResource } from '../userResource'

const resource = new UserResource()

// Custom hook for server-side search with built-in table search
function useUserListPage() {
  const [data, setData] = React.useState<any[]>([])
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)
  const [currentApiSearch, setCurrentApiSearch] = React.useState('')

  const loadData = React.useCallback(async (search?: string) => {
    try {
      setLoading(true)
      setError(null)
      const records = await resource.getRecords(search)
      setData(records)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load data')
    } finally {
      setLoading(false)
    }
  }, [])

  // Load initial data on mount
  React.useEffect(() => {
    loadData()
  }, [loadData])

  const refresh = React.useCallback(() => {
    loadData(currentApiSearch)
  }, [loadData, currentApiSearch])

  const performApiSearch = React.useCallback(
    (query: string) => {
      setCurrentApiSearch(query)
      loadData(query)
    },
    [loadData]
  )

  return {
    data,
    loading,
    error,
    refresh,
    performApiSearch,
    currentApiSearch,
  }
}

export default function UserListPage() {
  try {
    const {
      data,
      loading,
      error,
      refresh,
      performApiSearch,
      currentApiSearch,
    } = useUserListPage()
    const [lastApiQuery, setLastApiQuery] = React.useState('')

    if (error) {
      return (
        <div className='container mx-auto p-6'>
          <div className='text-center'>
            <p className='text-red-600'>Error: {error}</p>
          </div>
        </div>
      )
    }

    const pageConfig = resource.getListPageConfig()
    const tableConfig = resource.getTableSchema()

    // Custom search handler for onBlur API calls
    const handleSearchBlur = React.useCallback(
      (query: string) => {
        // Only hit API if the query is different from the last API query
        if (query.trim() !== lastApiQuery) {
          setLastApiQuery(query.trim())
          performApiSearch(query.trim())
        }
      },
      [lastApiQuery, performApiSearch]
    )

    // Enhanced table configuration with built-in search enabled
    const enhancedTableConfig = {
      ...tableConfig,
      data,
      loading,
      onRefresh: refresh,
      searchable: true, // Enable built-in search
      onSearchBlur: handleSearchBlur, // Custom handler for blur events
    }

    return (
      <BasePage config={pageConfig} resource={resource}>
        <TableRenderer config={enhancedTableConfig} />
      </BasePage>
    )
  } catch (err) {
    console.error('Error in UserListPage:', err)
    return (
      <div className='container mx-auto p-6'>
        <div className='text-center'>
          <p className='text-red-600'>
            Component Error:{' '}
            {err instanceof Error ? err.message : 'Unknown error'}
          </p>
        </div>
      </div>
    )
  }
}
