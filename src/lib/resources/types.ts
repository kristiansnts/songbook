import { FormBuilderConfig } from '@/lib/builders/form-builder'
import { TableBuilderConfig } from '@/lib/builders/table-builder'
import { ReactNode } from 'react'

export interface ResourceConfig<T = any> {
  name: string
  model: string
  route: string
  navigationIcon?: React.ElementType | ReactNode
  navigationSort?: number
  navigationGroup?: string
  navigationLabel?: string
  navigationVisible?: boolean
  pages?: {
    list?: string
    create?: string
    edit?: string
    view?: string
  }
}

export interface ResourceAction<T = any> {
  name: string
  label: string
  icon?: ReactNode
  color?: string
  action: (record: T) => void | Promise<void>
  requiresConfirmation?: boolean
  confirmationTitle?: string
  confirmationMessage?: string
  visible?: (record: T) => boolean
  disabled?: (record: T) => boolean
}

export interface ResourceBulkAction<T = any> {
  name: string
  label: string
  icon?: ReactNode
  color?: string
  action: (records: T[]) => void | Promise<void>
  requiresConfirmation?: boolean
  confirmationTitle?: string
  confirmationMessage?: string
  visible?: (records: T[]) => boolean
  disabled?: (records: T[]) => boolean
}

export interface ResourcePageConfig {
  title?: string
  subtitle?: string
  actions?: {
    name: string
    label: string
    icon?: ReactNode
    color?: string
    action: () => void | Promise<void>
  }[]
  breadcrumbs?: { label: string; href?: string }[]
}

export abstract class Resource<T = any> {
  protected config: ResourceConfig<T>

  constructor(config: ResourceConfig<T>) {
    this.config = config
  }

  // Core configuration
  abstract getModel(): string
  abstract getRoute(): string
  abstract getLabel(): string
  abstract getPluralLabel(): string

  // Navigation
  getNavigationIcon(): React.ElementType | ReactNode | undefined {
    return this.config.navigationIcon
  }

  getNavigationSort(): number {
    return this.config.navigationSort || 0
  }

  getNavigationGroup(): string | undefined {
    return this.config.navigationGroup
  }

  getNavigationLabel(): string {
    return this.config.navigationLabel || this.getPluralLabel()
  }

  getNavigationVisible(): boolean {
    return this.config.navigationVisible !== false
  }

  getNavigationUrl(): string {
    return this.getRoute()
  }

  // Form configuration
  abstract getFormSchema(): FormBuilderConfig

  // Table configuration
  abstract getTableSchema(refreshCallback?: () => void): TableBuilderConfig<T>

  // Actions
  getActions(): ResourceAction<T>[] {
    return []
  }

  getBulkActions(): ResourceBulkAction<T>[] {
    return []
  }

  // Page configurations
  getListPageConfig(): ResourcePageConfig {
    return {
      title: this.getPluralLabel(),
      actions: [
        {
          name: 'create',
          label: `Create ${this.getLabel()}`,
          action: () => this.navigateToCreate(),
        },
      ],
    }
  }

  getCreatePageConfig(): ResourcePageConfig {
    return {
      title: `Create ${this.getLabel()}`,
      breadcrumbs: [
        { label: this.getPluralLabel(), href: this.getRoute() },
        { label: 'Create' },
      ],
    }
  }

  getEditPageConfig(): ResourcePageConfig {
    return {
      title: `Edit ${this.getLabel()}`,
      breadcrumbs: [
        { label: this.getPluralLabel(), href: this.getRoute() },
        { label: 'Edit' },
      ],
    }
  }

  getViewPageConfig(): ResourcePageConfig {
    return {
      title: `View ${this.getLabel()}`,
      breadcrumbs: [
        { label: this.getPluralLabel(), href: this.getRoute() },
        { label: 'View' },
      ],
    }
  }

  // Navigation helpers
  navigateToCreate() {
    if (typeof window !== 'undefined') {
      window.location.href = `${this.getRoute()}/create`
    }
  }

  navigateToEdit(id: string) {
    if (typeof window !== 'undefined') {
      window.location.href = `${this.getRoute()}/edit/${id}`
    }
  }

  navigateToView(id: string) {
    if (typeof window !== 'undefined') {
      window.location.href = `${this.getRoute()}/view/${id}`
    }
  }

  navigateToList() {
    if (typeof window !== 'undefined') {
      window.location.href = this.getRoute()
    }
  }

  // Lifecycle hooks
  beforeSave?(data: Partial<T>): Partial<T> | Promise<Partial<T>>
  afterSave?(data: T): void | Promise<void>
  beforeDelete?(record: T): boolean | Promise<boolean>
  afterDelete?(record: T): void | Promise<void>

  // Data operations (override these with your data layer)
  async getRecords(): Promise<T[]> {
    throw new Error('getRecords must be implemented by resource')
  }

  async getRecord(id: string): Promise<T | null> {
    throw new Error('getRecord must be implemented by resource')
  }

  async createRecord(data: Partial<T>): Promise<T> {
    throw new Error('createRecord must be implemented by resource')
  }

  async updateRecord(id: string, data: Partial<T>): Promise<T> {
    throw new Error('updateRecord must be implemented by resource')
  }

  async deleteRecord(id: string): Promise<boolean> {
    throw new Error('deleteRecord must be implemented by resource')
  }

  async deleteRecords(ids: string[]): Promise<boolean> {
    throw new Error('deleteRecords must be implemented by resource')
  }
}