export const resourceTemplate = `import { Resource } from '@/lib/resources/types'
import { FormBuilder, TableBuilder, Text, TextColumn, ActionsColumn } from '@/components/builders'
import { FormBuilderConfig } from '@/lib/builders/form-builder'
import { TableBuilderConfig } from '@/lib/builders/table-builder'
import { {{MODEL_NAME}} } from './{{MODEL_NAME_LOWER}}-schema'

export class {{RESOURCE_NAME}} extends Resource<{{MODEL_NAME}}> {
  constructor() {
    super({
      name: '{{RESOURCE_NAME}}',
      model: '{{MODEL_NAME}}',
      route: '/{{ROUTE_NAME}}',
      navigationIcon: undefined, // Add your icon here
      navigationSort: 0,
      navigationGroup: undefined, // Add navigation group if needed
    })
  }

  getModel(): string {
    return '{{MODEL_NAME}}'
  }

  getRoute(): string {
    return '/{{ROUTE_NAME}}'
  }

  getLabel(): string {
    return '{{LABEL}}'
  }

  getPluralLabel(): string {
    return '{{PLURAL_LABEL}}'
  }

  getFormSchema(): FormBuilderConfig {
    return FormBuilder.create()
      .title(\`Create {{LABEL}}\`)
      .section(section => 
        section
          .title('{{LABEL}} Details')
          .columns(2)
          {{FORM_FIELDS}}
      )
      .submitButtonText('Save {{LABEL}}')
      .build()
  }

  getTableSchema(): TableBuilderConfig<{{MODEL_NAME}}> {
    return TableBuilder.create<{{MODEL_NAME}}>()
      .searchPlaceholder('Search {{PLURAL_LABEL_LOWER}}...')
      {{TABLE_COLUMNS}}
      .column('actions', col => 
        col
          .label('Actions')
          .type('actions')
          .actions([
            {
              label: 'Edit',
              onClick: (row) => this.navigateToEdit(row.original.id),
            },
            {
              label: 'Delete',
              onClick: (row) => this.deleteRecord(row.original.id),
              variant: 'destructive',
              requiresConfirmation: true,
              confirmationTitle: 'Delete {{LABEL}}',
              confirmationMessage: 'Are you sure you want to delete this {{LABEL_LOWER}}?',
            },
          ])
      )
      .build()
  }

  // Data operations - implement these with your data layer
  async getRecords(): Promise<{{MODEL_NAME}}[]> {
    // TODO: Implement with your data fetching logic
    return []
  }

  async getRecord(id: string): Promise<{{MODEL_NAME}} | null> {
    // TODO: Implement with your data fetching logic
    return null
  }

  async createRecord(data: Partial<{{MODEL_NAME}}>): Promise<{{MODEL_NAME}}> {
    // TODO: Implement with your data creation logic
    throw new Error('Not implemented')
  }

  async updateRecord(id: string, data: Partial<{{MODEL_NAME}}>): Promise<{{MODEL_NAME}}> {
    // TODO: Implement with your data update logic
    throw new Error('Not implemented')
  }

  async deleteRecord(id: string): Promise<boolean> {
    // TODO: Implement with your data deletion logic
    throw new Error('Not implemented')
  }

  async deleteRecords(ids: string[]): Promise<boolean> {
    // TODO: Implement with your bulk deletion logic
    throw new Error('Not implemented')
  }

  // Lifecycle hooks (optional)
  async beforeSave(data: Partial<{{MODEL_NAME}}>): Promise<Partial<{{MODEL_NAME}}>> {
    // Add any pre-save processing here
    return data
  }

  async afterSave(record: {{MODEL_NAME}}): Promise<void> {
    // Add any post-save processing here
  }

  async beforeDelete(record: {{MODEL_NAME}}): Promise<boolean> {
    // Add any pre-delete validation here
    return true
  }

  async afterDelete(record: {{MODEL_NAME}}): Promise<void> {
    // Add any post-delete cleanup here
  }
}
`

export const schemaTemplate = `import { z } from 'zod'

export const {{MODEL_NAME_LOWER}}Schema = z.object({
  id: z.string(),
  {{SCHEMA_FIELDS}}
  createdAt: z.string().optional(),
  updatedAt: z.string().optional(),
})

export type {{MODEL_NAME}} = z.infer<typeof {{MODEL_NAME_LOWER}}Schema>

export const create{{MODEL_NAME}}Schema = {{MODEL_NAME_LOWER}}Schema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
})

export type Create{{MODEL_NAME}} = z.infer<typeof create{{MODEL_NAME}}Schema>
`

export const listPageTemplate = `import React from 'react'
import { ListPage, useListPage } from '@/lib/resources/pages'
import { {{RESOURCE_NAME}} } from '../{{RESOURCE_NAME}}'

const resource = new {{RESOURCE_NAME}}()

export default function {{MODEL_NAME}}ListPage() {
  const { data, loading, error, refresh } = useListPage(resource)

  if (error) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center">
          <p className="text-red-600">Error: {error}</p>
        </div>
      </div>
    )
  }

  return (
    <ListPage
      resource={resource}
      data={data}
      loading={loading}
      onRefresh={refresh}
    />
  )
}
`

export const createPageTemplate = `import React from 'react'
import { CreatePage } from '@/lib/resources/pages'
import { {{RESOURCE_NAME}} } from '../{{RESOURCE_NAME}}'

const resource = new {{RESOURCE_NAME}}()

export default function {{MODEL_NAME}}CreatePage() {
  return (
    <CreatePage resource={resource} />
  )
}
`

export const editPageTemplate = `import React from 'react'
import { EditPage } from '@/lib/resources/pages'
import { {{RESOURCE_NAME}} } from '../{{RESOURCE_NAME}}'
import { useRouter } from 'next/router'

const resource = new {{RESOURCE_NAME}}()

export default function {{MODEL_NAME}}EditPage() {
  const router = useRouter()
  const { id } = router.query

  if (!id || typeof id !== 'string') {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center">
          <p className="text-red-600">Invalid record ID</p>
        </div>
      </div>
    )
  }

  return (
    <EditPage resource={resource} recordId={id} />
  )
}
`

export const viewPageTemplate = `import React from 'react'
import { ViewPage } from '@/lib/resources/pages'
import { {{RESOURCE_NAME}} } from '../{{RESOURCE_NAME}}'
import { useRouter } from 'next/router'

const resource = new {{RESOURCE_NAME}}()

export default function {{MODEL_NAME}}ViewPage() {
  const router = useRouter()
  const { id } = router.query

  if (!id || typeof id !== 'string') {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center">
          <p className="text-red-600">Invalid record ID</p>
        </div>
      </div>
    )
  }

  return (
    <ViewPage resource={resource} recordId={id} />
  )
}
`

export const indexTemplate = `// {{RESOURCE_NAME}} exports
export { {{RESOURCE_NAME}} } from './{{RESOURCE_NAME}}'
export { {{MODEL_NAME_LOWER}}Schema, type {{MODEL_NAME}}, type Create{{MODEL_NAME}} } from './{{MODEL_NAME_LOWER}}-schema'

// Page components
export { default as {{MODEL_NAME}}ListPage } from './pages/list'
export { default as {{MODEL_NAME}}CreatePage } from './pages/create'
export { default as {{MODEL_NAME}}EditPage } from './pages/edit'
export { default as {{MODEL_NAME}}ViewPage } from './pages/view'
`
