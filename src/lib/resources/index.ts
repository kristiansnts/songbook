// Core resource system
export * from './types'
export * from './pages'

// Resource generator
export * from './generator'

// Re-export commonly used items
export { Resource } from './types'
export {
  ListPage,
  CreatePage,
  EditPage,
  ViewPage,
  useListPage,
  useCreatePage,
  useEditPage,
  useViewPage,
} from './pages'
export { generateResource, ResourceGenerator } from './generator'
