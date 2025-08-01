import { Resource } from '@/lib/resources/types'
import { FormBuilder, TableBuilder } from '@/components/builders'
import { FormBuilderConfig } from '@/lib/builders/form-builder'
import { TableBuilderConfig } from '@/lib/builders/table-builder'
import { Tag } from './tag-schema'
import { IconTag } from '@tabler/icons-react'

export class TagResource extends Resource<Tag> {
  constructor() {
    super({
      name: 'TagResource',
      model: 'Tag',
      route: '/tags',
      navigationIcon: IconTag,
      navigationSort: 30,
      navigationGroup: 'General',
    })
  }

  getModel(): string {
    return 'Tag'
  }

  getRoute(): string {
    return '/tags'
  }

  getLabel(): string {
    return 'Tag'
  }

  hideMenu(): boolean {
    return true
  }

  getPluralLabel(): string {
    return 'Tags'
  }

  getFormSchema(): FormBuilderConfig {
    return FormBuilder.create()
      .section(section => 
        section
          .title('Tag Details')
          .columns(2)
          .field('title', field => 
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
          )
      )
      .submitButtonText('Save Tag')
      .build()
  }

  getTableSchema(): TableBuilderConfig<Tag> {
    return TableBuilder.create<Tag>()
      .searchPlaceholder('Search tags...')
      .column('title', col => 
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
      )
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
              confirmationTitle: 'Delete Tag',
              confirmationMessage: 'Are you sure you want to delete this tag?',
            },
          ])
      )
      .build()
  }

  // Data operations - implement these with your data layer
  async getRecords(): Promise<Tag[]> {
    // TODO: Implement with your data fetching logic
    return []
  }

  async getRecord(id: string): Promise<Tag | null> {
    // TODO: Implement with your data fetching logic
    return null
  }

  async createRecord(data: Partial<Tag>): Promise<Tag> {
    // TODO: Implement with your data creation logic
    throw new Error('Not implemented')
  }

  async updateRecord(id: string, data: Partial<Tag>): Promise<Tag> {
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
  async beforeSave(data: Partial<Tag>): Promise<Partial<Tag>> {
    // Add any pre-save processing here
    return data
  }

  async afterSave(record: Tag): Promise<void> {
    // Add any post-save processing here
  }

  async beforeDelete(record: Tag): Promise<boolean> {
    // Add any pre-delete validation here
    return true
  }

  async afterDelete(record: Tag): Promise<void> {
    // Add any post-delete cleanup here
  }
}
