import { z } from 'zod'
import { FieldValues, UseFormProps } from 'react-hook-form'

export type FieldType = 'text' | 'email' | 'password' | 'number' | 'select' | 'searchable-select' | 'checkbox' | 'textarea' | 'richtext' | 'chordtext' | 'date' | 'phone' | 'tags'

export interface SelectOption {
  label: string
  value: string | number
}

export interface BaseFieldConfig {
  name: string
  label: string
  type: FieldType
  placeholder?: string
  required?: boolean
  disabled?: boolean
  hidden?: boolean
  className?: string
  colSpan?: number
  validation?: z.ZodSchema<any>
  helperText?: string
}

export interface TextFieldConfig extends BaseFieldConfig {
  type: 'text' | 'email' | 'password' | 'phone'
  minLength?: number
  maxLength?: number
}

export interface NumberFieldConfig extends BaseFieldConfig {
  type: 'number'
  min?: number
  max?: number
  step?: number
}

export interface SelectFieldConfig extends BaseFieldConfig {
  type: 'select'
  options: SelectOption[]
  multiple?: boolean
}

export interface SearchableSelectFieldConfig extends BaseFieldConfig {
  type: 'searchable-select'
  options: SelectOption[]
  searchPlaceholder?: string
  emptyMessage?: string
}

export interface CheckboxFieldConfig extends BaseFieldConfig {
  type: 'checkbox'
  description?: string
}

export interface TextareaFieldConfig extends BaseFieldConfig {
  type: 'textarea'
  rows?: number
  minLength?: number
  maxLength?: number
}

export interface RichtextFieldConfig extends BaseFieldConfig {
  type: 'richtext'
  rows?: number
  minLength?: number
  maxLength?: number
}

export interface ChordTextFieldConfig extends BaseFieldConfig {
  type: 'chordtext'
  rows?: number
}

export interface DateFieldConfig extends BaseFieldConfig {
  type: 'date'
  minDate?: Date
  maxDate?: Date
}

export interface TagsFieldConfig extends BaseFieldConfig {
  type: 'tags'
  suggestions?: string[] | (() => Promise<string[]>)
  autoAddOnKeys?: boolean // Control whether space and comma trigger auto-add
}

export type FieldConfig = 
  | TextFieldConfig 
  | NumberFieldConfig 
  | SelectFieldConfig 
  | SearchableSelectFieldConfig
  | CheckboxFieldConfig 
  | TextareaFieldConfig 
  | RichtextFieldConfig
  | ChordTextFieldConfig
  | DateFieldConfig
  | TagsFieldConfig

export interface FormSection {
  title?: string
  description?: string
  fields: FieldConfig[]
  columns?: number
  collapsible?: boolean
  defaultOpen?: boolean
}

export interface FormBuilderConfig {
  title?: string
  description?: string
  sections: FormSection[]
  submitButtonText?: string
  cancelButtonText?: string
  onSubmit?: (data: any) => void | Promise<void>
  onCancel?: () => void
  defaultValues?: Record<string, any>
  formOptions?: UseFormProps<any>
}

export class FormBuilder {
  private config: FormBuilderConfig = {
    sections: [],
    submitButtonText: 'Submit',
    cancelButtonText: 'Cancel',
  }

  static create(): FormBuilder {
    return new FormBuilder()
  }

  title(title: string): FormBuilder {
    this.config.title = title
    return this
  }

  description(description: string): FormBuilder {
    this.config.description = description
    return this
  }

  section(callback: (section: SectionBuilder) => void): FormBuilder {
    const sectionBuilder = new SectionBuilder()
    callback(sectionBuilder)
    this.config.sections.push(sectionBuilder.build())
    return this
  }

  schema(fields: FieldConfig[]): FormBuilder {
    this.config.sections.push({
      fields,
      columns: 1,
    })
    return this
  }

  submitButtonText(text: string): FormBuilder {
    this.config.submitButtonText = text
    return this
  }

  cancelButtonText(text: string): FormBuilder {
    this.config.cancelButtonText = text
    return this
  }

  onSubmit(handler: (data: any) => void | Promise<void>): FormBuilder {
    this.config.onSubmit = handler
    return this
  }

  onCancel(handler: () => void): FormBuilder {
    this.config.onCancel = handler
    return this
  }

  defaultValues(values: Record<string, any>): FormBuilder {
    this.config.defaultValues = values
    return this
  }

  formOptions(options: UseFormProps<any>): FormBuilder {
    this.config.formOptions = options
    return this
  }

  build(): FormBuilderConfig {
    return this.config
  }
}

export class SectionBuilder {
  private section: FormSection = {
    fields: [],
    columns: 1,
  }

  title(title: string): SectionBuilder {
    this.section.title = title
    return this
  }

  description(description: string): SectionBuilder {
    this.section.description = description
    return this
  }

  columns(columns: number): SectionBuilder {
    this.section.columns = columns
    return this
  }

  collapsible(defaultOpen: boolean = false): SectionBuilder {
    this.section.collapsible = true
    this.section.defaultOpen = defaultOpen
    return this
  }

  field(name: string, callback: (field: FieldBuilder) => void): SectionBuilder {
    const fieldBuilder = new FieldBuilder(name)
    callback(fieldBuilder)
    this.section.fields.push(fieldBuilder.build())
    return this
  }

  build(): FormSection {
    return this.section
  }
}

export class FieldBuilder {
  private field: Partial<FieldConfig>

  constructor(name: string) {
    this.field = { name }
  }

  label(label: string): FieldBuilder {
    this.field.label = label
    return this
  }

  type(type: FieldType): FieldBuilder {
    this.field.type = type
    return this
  }

  placeholder(placeholder: string): FieldBuilder {
    this.field.placeholder = placeholder
    return this
  }

  required(required: boolean = true): FieldBuilder {
    this.field.required = required
    return this
  }

  disabled(disabled: boolean = true): FieldBuilder {
    this.field.disabled = disabled
    return this
  }

  hidden(hidden: boolean = true): FieldBuilder {
    this.field.hidden = hidden
    return this
  }

  className(className: string): FieldBuilder {
    this.field.className = className
    return this
  }

  colSpan(span: number): FieldBuilder {
    this.field.colSpan = span
    return this
  }

  validation(schema: z.ZodSchema<any>): FieldBuilder {
    this.field.validation = schema
    return this
  }

  helperText(text: string): FieldBuilder {
    this.field.helperText = text
    return this
  }

  options(options: SelectOption[]): FieldBuilder {
    if (this.field.type === 'select') {
      (this.field as SelectFieldConfig).options = options
    } else if (this.field.type === 'searchable-select') {
      (this.field as SearchableSelectFieldConfig).options = options
    }
    return this
  }

  multiple(multiple: boolean = true): FieldBuilder {
    if (this.field.type === 'select') {
      (this.field as SelectFieldConfig).multiple = multiple
    }
    return this
  }

  searchPlaceholder(placeholder: string): FieldBuilder {
    if (this.field.type === 'searchable-select') {
      (this.field as SearchableSelectFieldConfig).searchPlaceholder = placeholder
    }
    return this
  }

  emptyMessage(message: string): FieldBuilder {
    if (this.field.type === 'searchable-select') {
      (this.field as SearchableSelectFieldConfig).emptyMessage = message
    }
    return this
  }

  minLength(min: number): FieldBuilder {
    if (this.field.type === 'text' || this.field.type === 'textarea' || this.field.type === 'richtext') {
      (this.field as TextFieldConfig | TextareaFieldConfig | RichtextFieldConfig).minLength = min
    }
    return this
  }

  maxLength(max: number): FieldBuilder {
    if (this.field.type === 'text' || this.field.type === 'textarea' || this.field.type === 'richtext') {
      (this.field as TextFieldConfig | TextareaFieldConfig | RichtextFieldConfig).maxLength = max
    }
    return this
  }

  min(min: number): FieldBuilder {
    if (this.field.type === 'number') {
      (this.field as NumberFieldConfig).min = min
    }
    return this
  }

  max(max: number): FieldBuilder {
    if (this.field.type === 'number') {
      (this.field as NumberFieldConfig).max = max
    }
    return this
  }

  step(step: number): FieldBuilder {
    if (this.field.type === 'number') {
      (this.field as NumberFieldConfig).step = step
    }
    return this
  }

  rows(rows: number): FieldBuilder {
    if (this.field.type === 'textarea' || this.field.type === 'richtext' || this.field.type === 'chordtext') {
      (this.field as TextareaFieldConfig | RichtextFieldConfig | ChordTextFieldConfig).rows = rows
    }
    return this
  }


  description(description: string): FieldBuilder {
    if (this.field.type === 'checkbox') {
      (this.field as CheckboxFieldConfig).description = description
    }
    return this
  }

  minDate(date: Date): FieldBuilder {
    if (this.field.type === 'date') {
      (this.field as DateFieldConfig).minDate = date
    }
    return this
  }

  maxDate(date: Date): FieldBuilder {
    if (this.field.type === 'date') {
      (this.field as DateFieldConfig).maxDate = date
    }
    return this
  }

  suggestions(suggestions: string[] | (() => Promise<string[]>)): FieldBuilder {
    if (this.field.type === 'tags') {
      (this.field as TagsFieldConfig).suggestions = suggestions
    }
    return this
  }

  autoAddOnKeys(enabled: boolean = true): FieldBuilder {
    if (this.field.type === 'tags') {
      (this.field as TagsFieldConfig).autoAddOnKeys = enabled
    }
    return this
  }

  build(): FieldConfig {
    if (!this.field.type) {
      throw new Error(`Field type is required for field: ${this.field.name}`)
    }
    if (!this.field.label) {
      throw new Error(`Field label is required for field: ${this.field.name}`)
    }
    return this.field as FieldConfig
  }
}

export const Text = (name: string) => new FieldBuilder(name).type('text')
export const Email = (name: string) => new FieldBuilder(name).type('email')
export const Password = (name: string) => new FieldBuilder(name).type('password')
export const Number = (name: string) => new FieldBuilder(name).type('number')
export const Select = (name: string) => new FieldBuilder(name).type('select')
export const Checkbox = (name: string) => new FieldBuilder(name).type('checkbox')
export const Textarea = (name: string) => new FieldBuilder(name).type('textarea')
export const Richtext = (name: string) => new FieldBuilder(name).type('richtext')
export const Date = (name: string) => new FieldBuilder(name).type('date')
export const Phone = (name: string) => new FieldBuilder(name).type('phone')
export const Tags = (name: string) => new FieldBuilder(name).type('tags')