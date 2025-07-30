#!/usr/bin/env node

const fs = require('fs')
const path = require('path')
const { execSync } = require('child_process')

// Resource generator inspired by Filament's php artisan make:filament-resource
class ResourceGenerator {
  constructor(name, options = {}) {
    this.name = name
    this.options = {
      pluralName: options.pluralName || name + 's',
      routeName: options.routeName || name.toLowerCase() + 's',
      outputPath: options.outputPath || path.join('src', 'resources', name.toLowerCase() + 's'),
      fields: options.fields || [],
      ...options
    }
  }

  generate() {
    console.log(`🚀 Generating ${this.name}Resource...`)
    
    // Create directory structure
    this.createDirectoryStructure()
    
    // Generate files
    const files = this.generateFiles()
    
    // Write resource files
    Object.entries(files).forEach(([filename, content]) => {
      const filePath = path.join(this.options.outputPath, filename)
      this.writeFile(filePath, content)
      console.log(`✅ Created: ${filePath}`)
    })
    
    // Write route files separately with absolute paths
    this.writeRouteFiles(templateVars)
    
    console.log(`🎉 ${this.name}Resource generated successfully!`)
    console.log(`📁 Location: ${this.options.outputPath}`)
    console.log(`🔗 Route: /_authenticated/${this.options.routeName}`)
    console.log(`🚪 Routes created:`)
    console.log(`   • /_authenticated/${this.options.routeName}/ (list)`)
    console.log(`   • /_authenticated/${this.options.routeName}/create`)
    console.log(`   • /_authenticated/${this.options.routeName}/edit/$id`)
    console.log(`   • /_authenticated/${this.options.routeName}/view/$id`)
    console.log(`📡 Auto-registered in sidebar navigation`)
    
    return files
  }

  createDirectoryStructure() {
    const dirs = [
      this.options.outputPath,
      path.join(this.options.outputPath, 'pages'),
      path.join('src', 'routes', '_authenticated', this.options.routeName),
      path.join('src', 'routes', '_authenticated', this.options.routeName, 'edit'),
      path.join('src', 'routes', '_authenticated', this.options.routeName, 'view'),
    ]
    
    dirs.forEach(dir => {
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true })
      }
    })
  }

  generateFiles() {
    const templateVars = this.getTemplateVariables()
    
    // Resource files
    const resourceFiles = {
      [`${this.name}Resource.ts`]: this.replaceTemplateVariables(this.getResourceTemplate(), templateVars),
      [`${this.name.toLowerCase()}-schema.ts`]: this.replaceTemplateVariables(this.getSchemaTemplate(), templateVars),
      'pages/list.tsx': this.replaceTemplateVariables(this.getListPageTemplate(), templateVars),
      'pages/create.tsx': this.replaceTemplateVariables(this.getCreatePageTemplate(), templateVars),
      'pages/edit.tsx': this.replaceTemplateVariables(this.getEditPageTemplate(), templateVars),
      'pages/view.tsx': this.replaceTemplateVariables(this.getViewPageTemplate(), templateVars),
      'index.ts': this.replaceTemplateVariables(this.getIndexTemplate(), templateVars),
    }

    // Route files (use absolute paths from project root)
    const routeFiles = {}
    
    // We'll write these separately with absolute paths

    return { ...resourceFiles, ...routeFiles }
  }

  getTemplateVariables() {
    return {
      MODEL_NAME: this.name,
      MODEL_NAME_LOWER: this.name.toLowerCase(),
      RESOURCE_NAME: `${this.name}Resource`,
      ROUTE_NAME: this.options.routeName,
      LABEL: this.name,
      LABEL_LOWER: this.name.toLowerCase(),
      PLURAL_LABEL: this.options.pluralName,
      PLURAL_LABEL_LOWER: this.options.pluralName.toLowerCase(),
      FORM_FIELDS: this.generateFormFields(),
      TABLE_COLUMNS: this.generateTableColumns(),
      SCHEMA_FIELDS: this.generateSchemaFields(),
    }
  }

  generateFormFields() {
    if (this.options.fields.length === 0) {
      return `          .field('title', field => 
            field
              .label('Title')
              .type('text')
              .placeholder('Enter title')
              .required()
          )
          .field('description', field => 
            field
              .label('Description')
              .type('textarea')
              .placeholder('Enter description')
              .rows(4)
          )`
    }

    return this.options.fields
      .map(field => {
        return `          .field('${field.name}', field => 
            field
              .label('${field.label || this.capitalizeFirst(field.name)}')
              .type('${field.type}')
              .placeholder('Enter ${field.label || field.name}')
              ${field.required ? '.required()' : ''}
              ${field.validation ? `.validation(${field.validation})` : ''}
              ${field.options ? `.options(${JSON.stringify(field.options)})` : ''}
          )`
      })
      .join('\n')
  }

  generateTableColumns() {
    if (this.options.fields.length === 0) {
      return `      .column('title', col => 
        col
          .label('Title')
          .type('text')
          .accessor('title')
          .searchable()
          .sortable()
      )
      .column('description', col => 
        col
          .label('Description')
          .type('text')
          .accessor('description')
          .truncate()
          .maxLength(50)
      )`
    }

    return this.options.fields
      .map(field => {
        const columnType = this.getColumnType(field.type)
        return `      .column('${field.name}', col => 
        col
          .label('${field.label || this.capitalizeFirst(field.name)}')
          .type('${columnType}')
          .accessor('${field.name}')
          .searchable()
          .sortable()
      )`
      })
      .join('\n')
  }

  generateSchemaFields() {
    if (this.options.fields.length === 0) {
      return `  title: z.string(),
  description: z.string().optional(),`
    }

    return this.options.fields
      .map(field => {
        const zodType = this.getZodType(field)
        return `  ${field.name}: ${zodType},`
      })
      .join('\n')
  }

  getColumnType(fieldType) {
    const mapping = {
      text: 'text',
      email: 'text',
      password: 'text',
      number: 'number',
      select: 'text',
      checkbox: 'boolean',
      textarea: 'text',
      date: 'date',
    }
    return mapping[fieldType] || 'text'
  }

  getZodType(field) {
    const baseType = (() => {
      switch (field.type) {
        case 'text':
        case 'email':
        case 'password':
        case 'textarea':
        case 'select':
          return 'z.string()'
        case 'number':
          return 'z.number()'
        case 'checkbox':
          return 'z.boolean()'
        case 'date':
          return 'z.string()'
        default:
          return 'z.string()'
      }
    })()

    return field.required ? baseType : `${baseType}.optional()`
  }

  capitalizeFirst(str) {
    return str.charAt(0).toUpperCase() + str.slice(1)
  }

  replaceTemplateVariables(template, variables) {
    let result = template
    Object.entries(variables).forEach(([key, value]) => {
      result = result.replace(new RegExp(`{{${key}}}`, 'g'), value)
    })
    return result
  }

  writeFile(filePath, content) {
    const dir = path.dirname(filePath)
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true })
    }
    fs.writeFileSync(filePath, content)
  }

  writeRouteFiles(templateVars) {
    const routeFiles = [
      {
        path: path.join('src', 'routes', '_authenticated', this.options.routeName, 'index.tsx'),
        content: this.replaceTemplateVariables(this.getRouteIndexTemplate(), templateVars)
      },
      {
        path: path.join('src', 'routes', '_authenticated', this.options.routeName, 'create.tsx'),
        content: this.replaceTemplateVariables(this.getRouteCreateTemplate(), templateVars)
      },
      {
        path: path.join('src', 'routes', '_authenticated', this.options.routeName, 'edit', '$id.tsx'),
        content: this.replaceTemplateVariables(this.getRouteEditTemplate(), templateVars)
      },
      {
        path: path.join('src', 'routes', '_authenticated', this.options.routeName, 'view', '$id.tsx'),
        content: this.replaceTemplateVariables(this.getRouteViewTemplate(), templateVars)
      }
    ]

    routeFiles.forEach(({ path: routePath, content }) => {
      this.writeFile(routePath, content)
      console.log(`✅ Created: ${routePath}`)
    })
  }

  getResourceTemplate() {
    return `import { Resource } from '@/lib/resources/types'
import { FormBuilder, TableBuilder } from '@/components/builders'
import { FormBuilderConfig } from '@/lib/builders/form-builder'
import { TableBuilderConfig } from '@/lib/builders/table-builder'
import { {{MODEL_NAME}} } from './{{MODEL_NAME_LOWER}}-schema'
import { IconFileText } from '@tabler/icons-react' // Replace with appropriate icon

export class {{RESOURCE_NAME}} extends Resource<{{MODEL_NAME}}> {
  constructor() {
    super({
      name: '{{RESOURCE_NAME}}',
      model: '{{MODEL_NAME}}',
      route: '/{{ROUTE_NAME}}',
      navigationIcon: IconFileText, // Replace with appropriate icon from @tabler/icons-react
      navigationSort: 50, // Adjust sort order as needed
      navigationGroup: 'General', // Set navigation group
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
              onClick: async (row) => { await this.deleteRecord(row.original.id); },
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
  }

  getSchemaTemplate() {
    return `import { z } from 'zod'

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
  }

  getListPageTemplate() {
    return `import React from 'react'
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
  }

  getCreatePageTemplate() {
    return `import React from 'react'
import { CreatePage } from '@/lib/resources/pages'
import { {{RESOURCE_NAME}} } from '../{{RESOURCE_NAME}}'

const resource = new {{RESOURCE_NAME}}()

export default function {{MODEL_NAME}}CreatePage() {
  return (
    <CreatePage resource={resource} />
  )
}
`
  }

  getEditPageTemplate() {
    return `import React from 'react'
import { EditPage } from '@/lib/resources/pages'
import { {{RESOURCE_NAME}} } from '../{{RESOURCE_NAME}}'
import { useParams } from '@tanstack/react-router'

const resource = new {{RESOURCE_NAME}}()

export default function {{MODEL_NAME}}EditPage() {
  const { id } = useParams({ from: '/_authenticated/{{ROUTE_NAME}}/edit/$id' })

  if (!id) {
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
  }

  getViewPageTemplate() {
    return `import React from 'react'
import { ViewPage } from '@/lib/resources/pages'
import { {{RESOURCE_NAME}} } from '../{{RESOURCE_NAME}}'
import { useParams } from '@tanstack/react-router'

const resource = new {{RESOURCE_NAME}}()

export default function {{MODEL_NAME}}ViewPage() {
  const { id } = useParams({ from: '/_authenticated/{{ROUTE_NAME}}/view/$id' })

  if (!id) {
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
  }

  getIndexTemplate() {
    return `// {{RESOURCE_NAME}} exports - Auto-discoverable by resource registry
export { {{RESOURCE_NAME}} } from './{{RESOURCE_NAME}}'
export { {{MODEL_NAME_LOWER}}Schema, type {{MODEL_NAME}}, type Create{{MODEL_NAME}} } from './{{MODEL_NAME_LOWER}}-schema'

// Page components
export { default as {{MODEL_NAME}}ListPage } from './pages/list'
export { default as {{MODEL_NAME}}CreatePage } from './pages/create'
export { default as {{MODEL_NAME}}EditPage } from './pages/edit'
export { default as {{MODEL_NAME}}ViewPage } from './pages/view'
`
  }

  // Route templates
  getRouteIndexTemplate() {
    return `import { createFileRoute } from '@tanstack/react-router'
import { {{MODEL_NAME}}ListPage } from '@/resources/{{ROUTE_NAME}}'

export const Route = createFileRoute('/_authenticated/{{ROUTE_NAME}}/')({
  component: {{MODEL_NAME}}ListPage,
})
`
  }

  getRouteCreateTemplate() {
    return `import { createFileRoute } from '@tanstack/react-router'
import { {{MODEL_NAME}}CreatePage } from '@/resources/{{ROUTE_NAME}}'

export const Route = createFileRoute('/_authenticated/{{ROUTE_NAME}}/create')({
  component: {{MODEL_NAME}}CreatePage,
})
`
  }

  getRouteEditTemplate() {
    return `import { createFileRoute } from '@tanstack/react-router'
import { {{MODEL_NAME}}EditPage } from '@/resources/{{ROUTE_NAME}}'

export const Route = createFileRoute('/_authenticated/{{ROUTE_NAME}}/edit/$id')({
  component: {{MODEL_NAME}}EditPage,
})
`
  }

  getRouteViewTemplate() {
    return `import { createFileRoute } from '@tanstack/react-router'
import { {{MODEL_NAME}}ViewPage } from '@/resources/{{ROUTE_NAME}}'

export const Route = createFileRoute('/_authenticated/{{ROUTE_NAME}}/view/$id')({
  component: {{MODEL_NAME}}ViewPage,
})
`
  }
}

// CLI Interface
function main() {
  const args = process.argv.slice(2)
  
  if (args.length === 0) {
    console.log('Usage: npm run generate:resource <ResourceName>')
    console.log('Example: npm run generate:resource Note')
    process.exit(1)
  }
  
  const resourceName = args[0]
  
  if (!resourceName) {
    console.error('❌ Resource name is required')
    process.exit(1)
  }
  
  // Parse additional options
  const options = {}
  for (let i = 1; i < args.length; i++) {
    const arg = args[i]
    if (arg.startsWith('--plural=')) {
      options.pluralName = arg.split('=')[1]
    } else if (arg.startsWith('--route=')) {
      options.routeName = arg.split('=')[1]
    } else if (arg.startsWith('--path=')) {
      options.outputPath = arg.split('=')[1]
    }
  }
  
  try {
    const generator = new ResourceGenerator(resourceName, options)
    generator.generate()
  } catch (error) {
    console.error('❌ Error generating resource:', error.message)
    process.exit(1)
  }
}

if (require.main === module) {
  main()
}

module.exports = { ResourceGenerator }