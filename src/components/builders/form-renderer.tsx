import React, { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { 
  Form, 
  FormControl, 
  FormDescription, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormMessage 
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Checkbox } from '@/components/ui/checkbox'
import { SelectDropdown } from '@/components/select-dropdown'
import { PasswordInput } from '@/components/password-input'
import { HtmlEditor } from '@/components/ui/html-editor'
import { ChordLexicalEditor } from '@/components/ui/chord-lexical-editor'
import { InputTags } from '@/components/ui/input-tags'
import { ConfirmDialog } from '@/components/confirm-dialog'
import { 
  FormBuilderConfig, 
  FieldConfig, 
  FormSection,
  TextFieldConfig,
  NumberFieldConfig,
  SelectFieldConfig,
  CheckboxFieldConfig,
  TextareaFieldConfig,
  RichtextFieldConfig,
  ChordTextFieldConfig,
  DateFieldConfig,
  TagsFieldConfig
} from '@/lib/builders/form-builder'
import { 
  Collapsible, 
  CollapsibleContent, 
  CollapsibleTrigger 
} from '@/components/ui/collapsible'
import { ChevronDown, ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'

interface FormRendererProps {
  config: FormBuilderConfig
  onSubmit?: (data: any) => void | Promise<void>
  onCancel?: () => void
  className?: string
}

export function FormRenderer({ 
  config, 
  onSubmit, 
  onCancel, 
  className 
}: FormRendererProps) {
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [pendingData, setPendingData] = useState<any>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isUserSubmission, setIsUserSubmission] = useState(false)
  
  const schema = generateZodSchema(config.sections)
  
  const form = useForm({
    resolver: zodResolver(schema),
    defaultValues: config.defaultValues || {},
    ...config.formOptions,
  })

  // Reset form when default values change (for edit mode)
  React.useEffect(() => {
    if (config.defaultValues && Object.keys(config.defaultValues).length > 0) {
      // Use setTimeout to ensure form is fully initialized
      setTimeout(() => {
        form.reset(config.defaultValues)
      }, 0)
    }
  }, [JSON.stringify(config.defaultValues), form])

  const handleSubmit = async (data: any) => {
    if (!isUserSubmission) {
      return
    }
    
    setPendingData(data)
    setConfirmOpen(true)
    setIsUserSubmission(false) // Reset flag
  }

  const handleConfirmSubmit = async () => {
    if (!pendingData) return
    
    setIsSubmitting(true)
    try {
      if (onSubmit) {
        await onSubmit(pendingData)
      } else if (config.onSubmit) {
        await config.onSubmit(pendingData)
      }
    } catch (error) {
      console.error('Form submission error:', error)
    } finally {
      setIsSubmitting(false)
      setConfirmOpen(false)
      setPendingData(null)
    }
  }

  const handleCancel = () => {
    if (onCancel) {
      onCancel()
    } else if (config.onCancel) {
      config.onCancel()
    }
  }

  return (
    <div className={cn('space-y-6', className)}>
      {config.title && (
        <div className="space-y-2">
          <h2 className="text-2xl font-bold">{config.title}</h2>
          {config.description && (
            <p className="text-muted-foreground">{config.description}</p>
          )}
        </div>
      )}

      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
          {config.sections.map((section, index) => (
            <FormSection
              key={`section-${index}`}
              section={section}
              form={form}
            />
          ))}

          <div className="flex gap-2 justify-end">
            {(onCancel || config.onCancel) && (
              <Button
                type="button"
                variant="outline"
                onClick={handleCancel}
              >
                {config.cancelButtonText || 'Cancel'}
              </Button>
            )}
            <Button 
              type="submit" 
              onClick={() => setIsUserSubmission(true)}
            >
              {config.submitButtonText || 'Submit'}
            </Button>
          </div>
        </form>
      </Form>

      <ConfirmDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        title="Confirm Submission"
        desc="Are you sure you want to submit this form? Please review your information before confirming."
        isLoading={isSubmitting}
        handleConfirm={handleConfirmSubmit}
      />
    </div>
  )
}

function FormSection({ section, form }: { section: FormSection; form: any }) {
  const [isOpen, setIsOpen] = React.useState(section.defaultOpen ?? true)

  const content = (
    <div className={cn(
      'grid gap-4',
      section.columns === 2 && 'grid-cols-1 md:grid-cols-2',
      section.columns === 3 && 'grid-cols-1 md:grid-cols-3',
      section.columns === 4 && 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4'
    )}>
      {section.fields.map((field) => (
        <FormFieldRenderer
          key={field.name}
          field={field}
          form={form}
        />
      ))}
    </div>
  )

  if (section.collapsible) {
    return (
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <div className="space-y-4">
          <CollapsibleTrigger asChild>
            <Button variant="ghost" className="w-full justify-between p-0 h-auto">
              <div className="text-left">
                {section.title && (
                  <h3 className="text-lg font-semibold">{section.title}</h3>
                )}
                {section.description && (
                  <p className="text-sm text-muted-foreground">{section.description}</p>
                )}
              </div>
              {isOpen ? (
                <ChevronDown className="h-4 w-4" />
              ) : (
                <ChevronRight className="h-4 w-4" />
              )}
            </Button>
          </CollapsibleTrigger>
          <CollapsibleContent className="space-y-4">
            {content}
          </CollapsibleContent>
        </div>
      </Collapsible>
    )
  }

  return (
    <div className="space-y-4">
      {(section.title || section.description) && (
        <div className="space-y-2">
          {section.title && (
            <h3 className="text-lg font-semibold">{section.title}</h3>
          )}
          {section.description && (
            <p className="text-sm text-muted-foreground">{section.description}</p>
          )}
        </div>
      )}
      {content}
    </div>
  )
}

function FormFieldRenderer({ field, form }: { field: FieldConfig; form: any }) {
  if (field.hidden) return null

  const colSpanClass = field.colSpan ? `col-span-${field.colSpan}` : ''

  return (
    <div className={cn(colSpanClass, field.className)}>
      <FormField
        control={form.control}
        name={field.name}
        render={({ field: formField }) => (
          <FormItem>
            <FormLabel>
              {field.label}
              {field.required && <span className="text-red-500 ml-1">*</span>}
            </FormLabel>
            <FormControl>
              <FieldInput field={field} formField={formField} />
            </FormControl>
            {field.helperText && (
              <FormDescription>{field.helperText}</FormDescription>
            )}
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  )
}

function FieldInput({ field, formField }: { field: FieldConfig; formField: any }) {
  switch (field.type) {
    case 'text':
    case 'email':
      return (
        <Input
          {...formField}
          type={field.type}
          placeholder={field.placeholder}
          disabled={field.disabled}
          maxLength={(field as TextFieldConfig).maxLength}
        />
      )
    
    case 'password':
      return (
        <PasswordInput
          {...formField}
          placeholder={field.placeholder}
          disabled={field.disabled}
        />
      )
    
    case 'phone':
      return (
        <Input
          {...formField}
          type="tel"
          placeholder={field.placeholder}
          disabled={field.disabled}
        />
      )
    
    case 'number':
      return (
        <Input
          {...formField}
          type="number"
          placeholder={field.placeholder}
          disabled={field.disabled}
          min={(field as NumberFieldConfig).min}
          max={(field as NumberFieldConfig).max}
          step={(field as NumberFieldConfig).step}
        />
      )
    
    case 'select':
      const selectField = field as SelectFieldConfig
      return (
        <SelectDropdown
          defaultValue={formField.value}
          onValueChange={formField.onChange}
          placeholder={field.placeholder}
          disabled={field.disabled}
          items={selectField.options}
          isControlled={true}
        />
      )
    
    case 'checkbox':
      const checkboxField = field as CheckboxFieldConfig
      return (
        <div className="flex items-top space-x-2">
          <Checkbox
            id={field.name}
            checked={formField.value}
            onCheckedChange={formField.onChange}
            disabled={field.disabled}
          />
          <div className="grid gap-1.5 leading-none">
            <label
              htmlFor={field.name}
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              {field.label}
            </label>
            {checkboxField.description && (
              <p className="text-xs text-muted-foreground">
                {checkboxField.description}
              </p>
            )}
          </div>
        </div>
      )
    
    case 'textarea':
      const textareaField = field as TextareaFieldConfig
      return (
        <Textarea
          {...formField}
          placeholder={field.placeholder}
          disabled={field.disabled}
          rows={textareaField.rows}
          maxLength={textareaField.maxLength}
        />
      )
    
    case 'richtext':
      const richtextField = field as RichtextFieldConfig
      return (
        <HtmlEditor
          value={formField.value}
          onChange={formField.onChange}
          placeholder={field.placeholder}
          className={richtextField.rows ? `min-h-[${richtextField.rows * 24}px]` : undefined}
        />
      )
    
    case 'chordtext':
      return (
        <ChordLexicalEditor
          content={formField.value || ''}
          onChange={formField.onChange}
          placeholder={field.placeholder}
        />
      )
    
    case 'tags':
      const tagsField = field as TagsFieldConfig
      return (
        <InputTags
          value={formField.value || []}
          onChange={formField.onChange}
          placeholder={field.placeholder}
          disabled={field.disabled}
          suggestions={tagsField.suggestions}
          autoAddOnKeys={tagsField.autoAddOnKeys}
        />
      )
    
    case 'date':
      return (
        <Input
          {...formField}
          type="date"
          disabled={field.disabled}
          min={(field as DateFieldConfig).minDate?.toISOString().split('T')[0]}
          max={(field as DateFieldConfig).maxDate?.toISOString().split('T')[0]}
        />
      )
    
    default:
      return (
        <Input
          {...formField}
          placeholder={field.placeholder}
          disabled={field.disabled}
        />
      )
  }
}

function generateZodSchema(sections: FormSection[]): z.ZodSchema<any> {
  const shape: Record<string, z.ZodSchema<any>> = {}

  sections.forEach(section => {
    section.fields.forEach(field => {
      let fieldSchema: z.ZodSchema<any>

      if (field.validation) {
        fieldSchema = field.validation
      } else {
        switch (field.type) {
          case 'text':
          case 'email':
          case 'password':
          case 'phone':
          case 'textarea':
          case 'richtext':
          case 'chordtext':
            fieldSchema = z.string()
            const textField = field as TextFieldConfig | TextareaFieldConfig | RichtextFieldConfig | ChordTextFieldConfig
            if ('minLength' in textField && textField.minLength) {
              fieldSchema = fieldSchema.min(textField.minLength)
            }
            if ('maxLength' in textField && textField.maxLength) {
              fieldSchema = fieldSchema.max(textField.maxLength)
            }
            if (field.type === 'email') {
              fieldSchema = fieldSchema.email()
            }
            break
          
          case 'number':
            fieldSchema = z.number()
            const numberField = field as NumberFieldConfig
            if (numberField.min !== undefined) {
              fieldSchema = fieldSchema.min(numberField.min)
            }
            if (numberField.max !== undefined) {
              fieldSchema = fieldSchema.max(numberField.max)
            }
            break
          
          case 'select':
            fieldSchema = z.string()
            break
          
          case 'checkbox':
            fieldSchema = z.boolean()
            break
          
          case 'date':
            fieldSchema = z.string()
            break
          
          case 'tags':
            fieldSchema = z.array(z.string())
            break
          
          default:
            fieldSchema = z.string()
        }
      }

      if (field.required) {
        if (field.type === 'tags') {
          fieldSchema = fieldSchema.min(1, `${field.label} is required`)
        } else if (fieldSchema instanceof z.ZodString) {
          fieldSchema = fieldSchema.min(1, `${field.label} is required`)
        }
      } else {
        fieldSchema = fieldSchema.optional()
      }

      shape[field.name] = fieldSchema
    })
  })

  return z.object(shape)
}