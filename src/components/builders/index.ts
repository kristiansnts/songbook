// Form Builder exports
export * from '@/lib/builders/form-builder'
export { FormRenderer } from './form-renderer'

// Table Builder exports
export * from '@/lib/builders/table-builder'
export { TableRenderer } from './table-renderer'

// Re-export commonly used builder functions
export {
  FormBuilder,
  Text,
  Email,
  Password,
  Number,
  Select,
  Checkbox,
  Textarea,
  Date,
  Phone,
} from '@/lib/builders/form-builder'

export {
  TableBuilder,
  TextColumn,
  BadgeColumn,
  DateColumn,
  ActionsColumn,
  SelectColumn,
  ImageColumn,
  IconColumn,
  BooleanColumn,
  NumberColumn,
} from '@/lib/builders/table-builder'