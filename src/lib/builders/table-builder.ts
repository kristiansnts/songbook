import { ColumnDef, Row } from '@tanstack/react-table'
import { ReactNode } from 'react'

export type ColumnType = 'text' | 'badge' | 'date' | 'actions' | 'select' | 'image' | 'icon' | 'boolean' | 'number'

export interface BaseColumnConfig<T = any> {
  name: string
  label: string
  type: ColumnType
  sortable?: boolean
  searchable?: boolean
  filterable?: boolean
  hidden?: boolean
  width?: number | string
  align?: 'left' | 'center' | 'right'
  className?: string
  accessor?: keyof T | string
}

export interface TextColumnConfig<T = any> extends BaseColumnConfig<T> {
  type: 'text'
  truncate?: boolean
  maxLength?: number
  format?: (value: any) => string
}

export interface BadgeColumnConfig<T = any> extends BaseColumnConfig<T> {
  type: 'badge'
  colors?: Record<string, string>
  variant?: 'default' | 'secondary' | 'destructive' | 'outline'
}

export interface DateColumnConfig<T = any> extends BaseColumnConfig<T> {
  type: 'date'
  format?: string
  relative?: boolean
}

export interface ActionsColumnConfig<T = any> extends BaseColumnConfig<T> {
  type: 'actions'
  actions: ActionConfig<T>[]
}

export interface SelectColumnConfig<T = any> extends BaseColumnConfig<T> {
  type: 'select'
  enableSelectAll?: boolean
}

export interface ImageColumnConfig<T = any> extends BaseColumnConfig<T> {
  type: 'image'
  size?: 'sm' | 'md' | 'lg'
  shape?: 'square' | 'circle'
  fallback?: string
}

export interface IconColumnConfig<T = any> extends BaseColumnConfig<T> {
  type: 'icon'
  iconMap?: Record<string, ReactNode>
  size?: 'sm' | 'md' | 'lg'
}

export interface BooleanColumnConfig<T = any> extends BaseColumnConfig<T> {
  type: 'boolean'
  trueLabel?: string
  falseLabel?: string
  showIcons?: boolean
}

export interface NumberColumnConfig<T = any> extends BaseColumnConfig<T> {
  type: 'number'
  format?: (value: number) => string
  currency?: boolean
  precision?: number
}

export type ColumnConfig<T = any> = 
  | TextColumnConfig<T>
  | BadgeColumnConfig<T>
  | DateColumnConfig<T>
  | ActionsColumnConfig<T>
  | SelectColumnConfig<T>
  | ImageColumnConfig<T>
  | IconColumnConfig<T>
  | BooleanColumnConfig<T>
  | NumberColumnConfig<T>

export interface ActionConfig<T = any> {
  label: string
  icon?: ReactNode
  onClick: (row: Row<T>) => void
  variant?: 'default' | 'secondary' | 'destructive' | 'outline' | 'ghost' | 'link'
  size?: 'sm' | 'md' | 'lg'
  hidden?: (row: Row<T>) => boolean
  disabled?: (row: Row<T>) => boolean
  color?: string
  requiresConfirmation?: boolean
  confirmationTitle?: string
  confirmationMessage?: string
}

export interface BulkActionConfig<T = any> {
  label: string
  icon?: ReactNode
  onClick: (rows: Row<T>[]) => void
  variant?: 'default' | 'secondary' | 'destructive' | 'outline'
  requiresConfirmation?: boolean
  confirmationTitle?: string
  confirmationMessage?: string
}

export interface FilterConfig {
  name: string
  label: string
  type: 'text' | 'select' | 'date' | 'dateRange'
  options?: { label: string; value: string }[]
  placeholder?: string
  group?: string
  fromLabel?: string
  toLabel?: string
}

export interface FilterGroupConfig {
  name: string
  label: string
  filters: FilterConfig[]
}

export interface TableBuilderConfig<T = any> {
  columns: ColumnConfig<T>[]
  data: T[]
  searchable?: boolean
  searchPlaceholder?: string
  searchColumnId?: string
  filterable?: boolean
  filters?: FilterConfig[]
  filterGroups?: FilterGroupConfig[]
  groupedFilters?: boolean
  selectable?: boolean
  bulkActions?: BulkActionConfig<T>[]
  pagination?: boolean
  pageSize?: number
  pageSizeOptions?: number[]
  defaultSort?: {
    column: string
    direction: 'asc' | 'desc'
  }
  emptyState?: {
    title: string
    description?: string
    icon?: ReactNode
  }
  loading?: boolean
  onRowClick?: (row: Row<T>) => void
  onRefresh?: () => void
  className?: string
}

export class TableBuilder<T = any> {
  private config: TableBuilderConfig<T> = {
    columns: [],
    data: [],
    searchable: true,
    filterable: true,
    selectable: true,
    pagination: true,
    pageSize: 10,
    pageSizeOptions: [5, 10, 20, 50, 100],
  }

  static create<T = any>(): TableBuilder<T> {
    return new TableBuilder<T>()
  }

  data(data: T[]): TableBuilder<T> {
    this.config.data = data
    return this
  }

  column(name: string, callback: (column: ColumnBuilder<T>) => void): TableBuilder<T> {
    const columnBuilder = new ColumnBuilder<T>(name)
    callback(columnBuilder)
    this.config.columns.push(columnBuilder.build())
    return this
  }

  columns(columns: ColumnConfig<T>[] | ColumnBuilder<T>[]): TableBuilder<T> {
    if (columns.length > 0 && columns[0] instanceof ColumnBuilder) {
      this.config.columns = (columns as ColumnBuilder<T>[]).map(builder => builder.build())
    } else {
      this.config.columns = columns as ColumnConfig<T>[]
    }
    return this
  }

  searchable(searchable: boolean = true): TableBuilder<T> {
    this.config.searchable = searchable
    return this
  }

  searchPlaceholder(placeholder: string): TableBuilder<T> {
    this.config.searchPlaceholder = placeholder
    return this
  }

  searchColumnId(columnId: string): TableBuilder<T> {
    this.config.searchColumnId = columnId
    return this
  }

  filterable(filterable: boolean = true): TableBuilder<T> {
    this.config.filterable = filterable
    return this
  }

  filters(filters: (FilterConfig | FilterBuilder)[]): TableBuilder<T> {
    this.config.filters = filters.map(filter => 
      filter instanceof FilterBuilder ? filter.build() : filter
    )
    return this
  }

  filterGroups(groups: FilterGroupConfig[]): TableBuilder<T> {
    this.config.filterGroups = groups
    return this
  }

  groupedFilters(grouped: boolean = true): TableBuilder<T> {
    this.config.groupedFilters = grouped
    return this
  }

  selectable(selectable: boolean = true): TableBuilder<T> {
    this.config.selectable = selectable
    return this
  }

  bulkActions(actions: BulkActionConfig<T>[]): TableBuilder<T> {
    this.config.bulkActions = actions
    return this
  }

  pagination(enabled: boolean = true): TableBuilder<T> {
    this.config.pagination = enabled
    return this
  }

  pageSize(size: number): TableBuilder<T> {
    this.config.pageSize = size
    return this
  }

  pageSizeOptions(options: number[]): TableBuilder<T> {
    this.config.pageSizeOptions = options
    return this
  }

  emptyState(title: string, description?: string, icon?: ReactNode): TableBuilder<T> {
    this.config.emptyState = { title, description, icon }
    return this
  }

  loading(loading: boolean = true): TableBuilder<T> {
    this.config.loading = loading
    return this
  }

  onRowClick(handler: (row: Row<T>) => void): TableBuilder<T> {
    this.config.onRowClick = handler
    return this
  }

  className(className: string): TableBuilder<T> {
    this.config.className = className
    return this
  }

  defaultSort(column: string, direction: 'asc' | 'desc' = 'asc'): TableBuilder<T> {
    this.config.defaultSort = { column, direction }
    return this
  }

  build(): TableBuilderConfig<T> {
    return this.config
  }
}

export class ColumnBuilder<T = any> {
  private column: Partial<ColumnConfig<T>>

  constructor(name: string) {
    this.column = { name }
  }

  label(label: string): ColumnBuilder<T> {
    this.column.label = label
    return this
  }

  type(type: ColumnType): ColumnBuilder<T> {
    this.column.type = type
    return this
  }

  accessor(accessor: keyof T | string): ColumnBuilder<T> {
    this.column.accessor = accessor
    return this
  }

  sortable(sortable: boolean = true): ColumnBuilder<T> {
    this.column.sortable = sortable
    return this
  }

  searchable(searchable: boolean = true): ColumnBuilder<T> {
    this.column.searchable = searchable
    return this
  }

  filterable(filterable: boolean = true): ColumnBuilder<T> {
    this.column.filterable = filterable
    return this
  }

  hidden(hidden: boolean = true): ColumnBuilder<T> {
    this.column.hidden = hidden
    return this
  }

  width(width: number | string): ColumnBuilder<T> {
    this.column.width = width
    return this
  }

  align(align: 'left' | 'center' | 'right'): ColumnBuilder<T> {
    this.column.align = align
    return this
  }

  className(className: string): ColumnBuilder<T> {
    this.column.className = className
    return this
  }

  format(formatter: (value: any) => string): ColumnBuilder<T> {
    if (this.column.type === 'text') {
      (this.column as TextColumnConfig<T>).format = formatter
    } else if (this.column.type === 'number') {
      (this.column as NumberColumnConfig<T>).format = formatter
    }
    return this
  }

  truncate(truncate: boolean = true): ColumnBuilder<T> {
    if (this.column.type === 'text') {
      (this.column as TextColumnConfig<T>).truncate = truncate
    }
    return this
  }

  maxLength(length: number): ColumnBuilder<T> {
    if (this.column.type === 'text') {
      (this.column as TextColumnConfig<T>).maxLength = length
    }
    return this
  }

  colors(colors: Record<string, string>): ColumnBuilder<T> {
    if (this.column.type === 'badge') {
      (this.column as BadgeColumnConfig<T>).colors = colors
    }
    return this
  }

  variant(variant: 'default' | 'secondary' | 'destructive' | 'outline'): ColumnBuilder<T> {
    if (this.column.type === 'badge') {
      (this.column as BadgeColumnConfig<T>).variant = variant
    }
    return this
  }

  dateFormat(format: string): ColumnBuilder<T> {
    if (this.column.type === 'date') {
      (this.column as DateColumnConfig<T>).format = format
    }
    return this
  }

  relative(relative: boolean = true): ColumnBuilder<T> {
    if (this.column.type === 'date') {
      (this.column as DateColumnConfig<T>).relative = relative
    }
    return this
  }

  actions(actions: ActionConfig<T>[]): ColumnBuilder<T> {
    if (this.column.type === 'actions') {
      (this.column as ActionsColumnConfig<T>).actions = actions
    }
    return this
  }

  enableSelectAll(enabled: boolean = true): ColumnBuilder<T> {
    if (this.column.type === 'select') {
      (this.column as SelectColumnConfig<T>).enableSelectAll = enabled
    }
    return this
  }

  imageSize(size: 'sm' | 'md' | 'lg'): ColumnBuilder<T> {
    if (this.column.type === 'image') {
      (this.column as ImageColumnConfig<T>).size = size
    }
    return this
  }

  imageShape(shape: 'square' | 'circle'): ColumnBuilder<T> {
    if (this.column.type === 'image') {
      (this.column as ImageColumnConfig<T>).shape = shape
    }
    return this
  }

  imageFallback(fallback: string): ColumnBuilder<T> {
    if (this.column.type === 'image') {
      (this.column as ImageColumnConfig<T>).fallback = fallback
    }
    return this
  }

  iconMap(iconMap: Record<string, ReactNode>): ColumnBuilder<T> {
    if (this.column.type === 'icon') {
      (this.column as IconColumnConfig<T>).iconMap = iconMap
    }
    return this
  }

  iconSize(size: 'sm' | 'md' | 'lg'): ColumnBuilder<T> {
    if (this.column.type === 'icon') {
      (this.column as IconColumnConfig<T>).size = size
    }
    return this
  }

  trueLabel(label: string): ColumnBuilder<T> {
    if (this.column.type === 'boolean') {
      (this.column as BooleanColumnConfig<T>).trueLabel = label
    }
    return this
  }

  falseLabel(label: string): ColumnBuilder<T> {
    if (this.column.type === 'boolean') {
      (this.column as BooleanColumnConfig<T>).falseLabel = label
    }
    return this
  }

  showIcons(show: boolean = true): ColumnBuilder<T> {
    if (this.column.type === 'boolean') {
      (this.column as BooleanColumnConfig<T>).showIcons = show
    }
    return this
  }

  currency(currency: boolean = true): ColumnBuilder<T> {
    if (this.column.type === 'number') {
      (this.column as NumberColumnConfig<T>).currency = currency
    }
    return this
  }

  precision(precision: number): ColumnBuilder<T> {
    if (this.column.type === 'number') {
      (this.column as NumberColumnConfig<T>).precision = precision
    }
    return this
  }

  // FilamentPHP-style method aliases
  make(accessor: keyof T | string): ColumnBuilder<T> {
    this.column.accessor = accessor
    return this
  }

  boolean(): ColumnBuilder<T> {
    this.column.type = 'boolean'
    return this
  }

  dateTime(): ColumnBuilder<T> {
    this.column.type = 'date'
    return this
  }

  badge(): ColumnBuilder<T> {
    this.column.type = 'badge'
    return this
  }

  build(): ColumnConfig<T> {
    if (!this.column.type) {
      throw new Error(`Column type is required for column: ${this.column.name}`)
    }
    if (!this.column.label) {
      throw new Error(`Column label is required for column: ${this.column.name}`)
    }
    return this.column as ColumnConfig<T>
  }
}

// FilamentPHP-style column builders
export class TextColumn {
  static make<T = any>(accessor: keyof T | string): ColumnBuilder<T> {
    return new ColumnBuilder<T>(accessor as string).type('text').make(accessor)
  }
}

export class BadgeColumn {
  static make<T = any>(accessor: keyof T | string): ColumnBuilder<T> {
    return new ColumnBuilder<T>(accessor as string).type('badge').make(accessor)
  }
}

export class DateColumn {
  static make<T = any>(accessor: keyof T | string): ColumnBuilder<T> {
    return new ColumnBuilder<T>(accessor as string).type('date').make(accessor)
  }
}

export class IconColumn {
  static make<T = any>(accessor: keyof T | string): ColumnBuilder<T> {
    return new ColumnBuilder<T>(accessor as string).type('icon').make(accessor)
  }
}

export class BooleanColumn {
  static make<T = any>(accessor: keyof T | string): ColumnBuilder<T> {
    return new ColumnBuilder<T>(accessor as string).type('boolean').make(accessor)
  }
}

export class NumberColumn {
  static make<T = any>(accessor: keyof T | string): ColumnBuilder<T> {
    return new ColumnBuilder<T>(accessor as string).type('number').make(accessor)
  }
}

export class ActionsColumn {
  static make<T = any>(accessor: keyof T | string): ColumnBuilder<T> {
    return new ColumnBuilder<T>(accessor as string).type('actions').make(accessor)
  }
}

// Filter builders
export class SelectFilter {
  static make(name: string): FilterBuilder {
    return new FilterBuilder(name).type('select')
  }
}

export class Filter {
  static make(name: string): FilterBuilder {
    return new FilterBuilder(name)
  }
}

export class FilterBuilder {
  private filter: Partial<FilterConfig> = {}

  constructor(name: string) {
    this.filter.name = name
    this.filter.type = 'text' // Default type
  }

  type(type: 'text' | 'select' | 'date' | 'dateRange'): FilterBuilder {
    this.filter.type = type
    return this
  }

  label(label: string): FilterBuilder {
    this.filter.label = label
    return this
  }

  options(options: { [key: string]: string } | { label: string; value: string }[]): FilterBuilder {
    if (Array.isArray(options)) {
      this.filter.options = options
    } else {
      this.filter.options = Object.entries(options).map(([value, label]) => ({ label, value }))
    }
    return this
  }

  multiple(): FilterBuilder {
    return this
  }

  default(_value: any): FilterBuilder {
    return this
  }

  form(_components: any[]): FilterBuilder {
    this.filter.type = 'dateRange'
    this.filter.fromLabel = 'From Date'
    this.filter.toLabel = 'To Date'
    return this
  }

  query(_queryFn: Function): FilterBuilder {
    return this
  }

  build(): FilterConfig {
    if (!this.filter.name) {
      throw new Error('Filter name is required')
    }
    if (!this.filter.type) {
      throw new Error('Filter type is required')
    }
    if (!this.filter.label) {
      throw new Error('Filter label is required')
    }
    return this.filter as FilterConfig
  }
}

// Legacy exports for backward compatibility
export const TextColumnLegacy = <T = any>(name: string) => new ColumnBuilder<T>(name).type('text')
export const BadgeColumnLegacy = <T = any>(name: string) => new ColumnBuilder<T>(name).type('badge')
export const DateColumnLegacy = <T = any>(name: string) => new ColumnBuilder<T>(name).type('date')
export const ActionsColumnLegacy = <T = any>(name: string) => new ColumnBuilder<T>(name).type('actions')
export const SelectColumnLegacy = <T = any>(name: string) => new ColumnBuilder<T>(name).type('select')
export const ImageColumnLegacy = <T = any>(name: string) => new ColumnBuilder<T>(name).type('image')
export const IconColumnLegacy = <T = any>(name: string) => new ColumnBuilder<T>(name).type('icon')
export const BooleanColumnLegacy = <T = any>(name: string) => new ColumnBuilder<T>(name).type('boolean')
export const NumberColumnLegacy = <T = any>(name: string) => new ColumnBuilder<T>(name).type('number')