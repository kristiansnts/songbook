import { createFileRoute } from '@tanstack/react-router'
import { SongResource } from '@/panels/admin/resources/songs/songResource'
import { TableRenderer } from '@/components/builders'
import { BasePage } from '@/lib/resources/pages/base-page'
import { useState, useEffect, useCallback } from 'react'
import { TableBuilderConfig } from '@/lib/builders/table-builder'
import { Song, SongFilters } from '@/types/song'
import { TagService } from '@/services/tagService'

const songResource = new SongResource()

function SongListPage() {
  const [data, setData] = useState<Song[]>([])
  const [loading, setLoading] = useState(true)
  const [tableConfig, setTableConfig] = useState<TableBuilderConfig<Song> | null>(null)
  const [configLoading, setConfigLoading] = useState(true)
  const [tagNameToIdMap, setTagNameToIdMap] = useState<Record<string, number>>({})
  const [currentFilters, setCurrentFilters] = useState<SongFilters>({})

  // Load tag name to ID mapping
  useEffect(() => {
    const loadTagMapping = async () => {
      try {
        const tags = await TagService.getAllTags()
        const mapping = tags.reduce((acc, tag) => {
          acc[tag.name] = parseInt(tag.id)
          return acc
        }, {} as Record<string, number>)
        setTagNameToIdMap(mapping)
      } catch (error) {
        console.error('Error loading tag mapping:', error)
      }
    }
    
    loadTagMapping()
  }, [])

  // Load songs data with filters
  const loadData = useCallback(async (filters: SongFilters = {}) => {
    try {
      setLoading(true)
      const songs = await songResource.getRecords(filters)
      setData(songs)
    } catch (error) {
      console.error('Error loading songs:', error)
      setData([])
    } finally {
      setLoading(false)
    }
  }, [])

  // Initial data load
  useEffect(() => {
    loadData(currentFilters)
  }, [loadData, currentFilters])

  // Handle filter changes from table
  const handleFilterChange = useCallback((filters: Record<string, any>) => {
    const newFilters: SongFilters = {}
    
    // Handle search filter
    if (filters.title) {
      newFilters.search = filters.title
    }
    
    // Handle base chord filter
    if (filters.base_chord) {
      newFilters.base_chord = filters.base_chord
    }
    
    // Handle tag filter - convert tag name to tag ID
    if (filters.tag_names) {
      const tagName = filters.tag_names
      const tagId = tagNameToIdMap[tagName]
      if (tagId) {
        newFilters.tag_ids = tagId.toString()
      }
    }
    
    setCurrentFilters(newFilters)
  }, [tagNameToIdMap])

  // Load table config
  useEffect(() => {
    const loadTableConfig = async () => {
      try {
        const config = await songResource.getTableSchemaAsync()
        setTableConfig(config)
      } catch (error) {
        console.error('Error loading table config:', error)
        // Fallback to sync version
        setTableConfig(songResource.getTableSchema())
      } finally {
        setConfigLoading(false)
      }
    }

    loadTableConfig()
  }, [])

  // Move all hooks before any conditional returns
  const pageConfig = songResource.getListPageConfig()

  const refresh = useCallback(() => {
    loadData(currentFilters)
  }, [loadData, currentFilters])

  // Conditional rendering after all hooks
  if (configLoading || !tableConfig) {
    return (
      <BasePage
        resource={songResource}
        config={{
          title: songResource.getPluralLabel(),
          actions: [
            {
              name: 'create',
              label: `Create ${songResource.getLabel()}`,
              action: () => songResource.navigateToCreate(),
            },
          ],
        }}
      >
        <div className="flex items-center justify-center h-32">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </BasePage>
    )
  }

  // Merge resource data with table config
  const enhancedTableConfig = {
    ...tableConfig,
    data,
    loading,
    onRefresh: refresh,
    onFilterChange: handleFilterChange, // Add filter change handler
    bulkActions: [
      ...(tableConfig.bulkActions || []),
      ...songResource.getBulkActions().map(action => ({
        label: action.label,
        icon: action.icon,
        onClick: async (rows: any) => {
          await action.action(rows)
          refresh?.()
        },
        variant: (action.color ? 'default' : 'outline') as 'default' | 'secondary' | 'destructive' | 'outline',
        requiresConfirmation: action.requiresConfirmation,
        confirmationTitle: action.confirmationTitle,
        confirmationMessage: action.confirmationMessage,
      }))
    ]
  }

  // Add default actions to table columns if not already present
  const hasActionsColumn = tableConfig.columns?.some(col => col.type === 'actions')
  if (!hasActionsColumn) {
    const defaultActions = [
      {
        label: 'View',
        onClick: async (row: any) => songResource.navigateToView(row.original.id),
      },
      {
        label: 'Edit',
        onClick: async (row: any) => songResource.navigateToEdit(row.original.id),
      },
      {
        label: 'Delete',
        onClick: async (row: any) => {
          await songResource.deleteRecord(row.original.id)
          refresh?.()
        },
        requiresConfirmation: true,
        confirmationTitle: `Delete ${songResource.getLabel()}`,
        confirmationMessage: `Are you sure you want to delete this ${songResource.getLabel().toLowerCase()}? This action cannot be undone.`,
      },
    ]

    enhancedTableConfig.columns = [
      ...(enhancedTableConfig.columns || []),
      {
        name: 'actions',
        label: 'Actions',
        type: 'actions' as const,
        actions: defaultActions,
        sortable: false,
        searchable: false,
        filterable: false,
        width: 100,
        align: 'right' as const,
      }
    ]
  }

  return (
    <BasePage
      resource={songResource}
      config={{
        title: pageConfig.title,
        actions: pageConfig.actions || [],
      }}
    >
      <TableRenderer config={enhancedTableConfig} />
    </BasePage>
  )
}

export const Route = createFileRoute('/_authenticated/admin/songs/')({
  component: SongListPage,
})