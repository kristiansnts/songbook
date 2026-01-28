import { resourceRegistry } from './registry'

// Auto-discover and register all resources
const modules = import.meta.glob('../../panels/admin/resources/*/index.ts', {
  eager: true,
})

Object.entries(modules).forEach(([path, module]: [string, any]) => {
  // Extract resource name from path (e.g., '../../panels/admin/resources/songs/index.ts' -> 'songs')
  const resourceName = path.split('/').slice(-2)[0]

  // Look for exported resource classes (e.g., SongResource, NoteResource, etc.)
  Object.entries(module).forEach(([exportName, exportValue]: [string, any]) => {
    if (exportName.endsWith('Resource') && typeof exportValue === 'function') {
      try {
        const resourceInstance = new exportValue()
        resourceRegistry.register(resourceInstance)
        console.log(`🔗 Auto-registered resource: ${exportName}`)
      } catch (error) {
        console.warn(
          `⚠️ Failed to auto-register resource ${exportName}:`,
          error
        )
      }
    }
  })
})

export const autoLoader = {
  isLoaded: true,
}
