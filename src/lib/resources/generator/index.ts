import { 
  resourceTemplate, 
  schemaTemplate, 
  listPageTemplate, 
  createPageTemplate, 
  editPageTemplate, 
  viewPageTemplate,
  indexTemplate 
} from './templates'

export interface FieldDefinition {
  name: string
  type: 'text' | 'email' | 'password' | 'number' | 'select' | 'checkbox' | 'textarea' | 'date'
  label?: string
  required?: boolean
  validation?: string
  options?: { label: string; value: string }[]
}

export interface ResourceGeneratorConfig {
  name: string // e.g., "Note"
  pluralName?: string // e.g., "Notes"
  routeName?: string // e.g., "notes"
  outputPath?: string // e.g., "src/resources/notes"
  fields: FieldDefinition[]
}

export class ResourceGenerator {
  private config: ResourceGeneratorConfig

  constructor(config: ResourceGeneratorConfig) {
    this.config = {
      pluralName: config.name + 's',
      routeName: config.name.toLowerCase() + 's',
      outputPath: `src/resources/${config.name.toLowerCase()}s`,
      ...config,
    }
  }

  generate(): GeneratedFiles {
    const templateVars = this.getTemplateVariables()
    
    return {
      resource: {
        path: `${this.config.outputPath}/${this.config.name}Resource.ts`,
        content: this.replaceTemplateVariables(resourceTemplate, templateVars),
      },
      schema: {
        path: `${this.config.outputPath}/${this.config.name.toLowerCase()}-schema.ts`,
        content: this.replaceTemplateVariables(schemaTemplate, templateVars),
      },
      listPage: {
        path: `${this.config.outputPath}/pages/list.tsx`,
        content: this.replaceTemplateVariables(listPageTemplate, templateVars),
      },
      createPage: {
        path: `${this.config.outputPath}/pages/create.tsx`,
        content: this.replaceTemplateVariables(createPageTemplate, templateVars),
      },
      editPage: {
        path: `${this.config.outputPath}/pages/edit.tsx`,
        content: this.replaceTemplateVariables(editPageTemplate, templateVars),
      },
      viewPage: {
        path: `${this.config.outputPath}/pages/view.tsx`,
        content: this.replaceTemplateVariables(viewPageTemplate, templateVars),
      },
      index: {
        path: `${this.config.outputPath}/index.ts`,
        content: this.replaceTemplateVariables(indexTemplate, templateVars),
      },
    }
  }

  private getTemplateVariables(): Record<string, string> {
    return {
      MODEL_NAME: this.config.name,
      MODEL_NAME_LOWER: this.config.name.toLowerCase(),
      RESOURCE_NAME: `${this.config.name}Resource`,
      ROUTE_NAME: this.config.routeName!,
      LABEL: this.config.name,
      LABEL_LOWER: this.config.name.toLowerCase(),
      PLURAL_LABEL: this.config.pluralName!,
      PLURAL_LABEL_LOWER: this.config.pluralName!.toLowerCase(),
      FORM_FIELDS: this.generateFormFields(),
      TABLE_COLUMNS: this.generateTableColumns(),
      SCHEMA_FIELDS: this.generateSchemaFields(),
    }
  }

  private generateFormFields(): string {
    return this.config.fields
      .map(field => {
        const fieldBuilder = this.getFieldBuilder(field)
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

  private generateTableColumns(): string {
    return this.config.fields
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

  private generateSchemaFields(): string {
    return this.config.fields
      .map(field => {
        const zodType = this.getZodType(field)
        return `  ${field.name}: ${zodType},`
      })
      .join('\n')
  }

  private getFieldBuilder(field: FieldDefinition): string {
    return `${this.capitalizeFirst(field.type)}('${field.name}')`
  }

  private getColumnType(fieldType: string): string {
    const mapping: Record<string, string> = {
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

  private getZodType(field: FieldDefinition): string {
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

  private capitalizeFirst(str: string): string {
    return str.charAt(0).toUpperCase() + str.slice(1)
  }

  private replaceTemplateVariables(template: string, variables: Record<string, string>): string {
    let result = template
    Object.entries(variables).forEach(([key, value]) => {
      result = result.replace(new RegExp(`{{${key}}}`, 'g'), value)
    })
    return result
  }
}

export interface GeneratedFile {
  path: string
  content: string
}

export interface GeneratedFiles {
  resource: GeneratedFile
  schema: GeneratedFile
  listPage: GeneratedFile
  createPage: GeneratedFile
  editPage: GeneratedFile
  viewPage: GeneratedFile
  index: GeneratedFile
}

// Helper function to generate a resource
export function generateResource(config: ResourceGeneratorConfig): GeneratedFiles {
  const generator = new ResourceGenerator(config)
  return generator.generate()
}

// Common field definitions for easy reuse
export const commonFields = {
  id: (): FieldDefinition => ({ name: 'id', type: 'text', label: 'ID', required: true }),
  title: (): FieldDefinition => ({ name: 'title', type: 'text', label: 'Title', required: true }),
  name: (): FieldDefinition => ({ name: 'name', type: 'text', label: 'Name', required: true }),
  description: (): FieldDefinition => ({ name: 'description', type: 'textarea', label: 'Description' }),
  email: (): FieldDefinition => ({ name: 'email', type: 'email', label: 'Email', required: true }),
  createdAt: (): FieldDefinition => ({ name: 'createdAt', type: 'date', label: 'Created At' }),
  updatedAt: (): FieldDefinition => ({ name: 'updatedAt', type: 'date', label: 'Updated At' }),
}