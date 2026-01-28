import React from 'react'
import { Bold, Italic, Underline, List, ListOrdered } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'

interface HtmlEditorProps {
  value?: string
  onChange?: (value: string) => void
  placeholder?: string
  className?: string
}

export function HtmlEditor({
  value = '',
  onChange,
  placeholder = 'Enter text...',
  className,
}: HtmlEditorProps) {
  const editorRef = React.useRef<HTMLDivElement>(null)
  const [isInitialized, setIsInitialized] = React.useState(false)

  // Initialize content
  React.useEffect(() => {
    if (editorRef.current && !isInitialized) {
      editorRef.current.innerHTML = value
      setIsInitialized(true)
    }
  }, [value, isInitialized])

  const executeCommand = (command: string, value?: string) => {
    document.execCommand(command, false, value)
    editorRef.current?.focus()
    handleContentChange()
  }

  const cleanHtml = (html: string): string => {
    return (
      html
        // Normalize div to p tags
        .replace(/<div><br><\/div>/g, '<p><br></p>')
        .replace(/<div>/g, '<p>')
        .replace(/<\/div>/g, '</p>')
        // Remove all style attributes and color formatting
        .replace(/\s*style="[^"]*"/g, '')
        .replace(/\s*color="[^"]*"/g, '')
        .replace(/\s*bgcolor="[^"]*"/g, '')
        .replace(/\s*face="[^"]*"/g, '')
        .replace(/\s*size="[^"]*"/g, '')
        // Remove font tags completely
        .replace(/<font[^>]*>/g, '')
        .replace(/<\/font>/g, '')
        // Clean up span tags with styling
        .replace(/<span[^>]*color[^>]*>/g, '<span>')
        .replace(/<span[^>]*style[^>]*>/g, '<span>')
        .replace(/<span[^>]*background[^>]*>/g, '<span>')
        .replace(/<span>\s*<\/span>/g, '')
        .replace(/<span><\/span>/g, '')
        // Remove any remaining empty tags
        .replace(/<([^>]+)>\s*<\/\1>/g, '')
    )
  }

  const handleContentChange = () => {
    if (editorRef.current) {
      const html = editorRef.current.innerHTML
      const cleanedHtml = cleanHtml(html)
      onChange?.(cleanedHtml)
    }
  }

  const handleInput = () => {
    handleContentChange()
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    // Handle keyboard shortcuts
    if (e.ctrlKey || e.metaKey) {
      switch (e.key) {
        case 'b':
          e.preventDefault()
          executeCommand('bold')
          break
        case 'i':
          e.preventDefault()
          executeCommand('italic')
          break
        case 'u':
          e.preventDefault()
          executeCommand('underline')
          break
      }
    }
  }

  const formatButtons = [
    {
      icon: Bold,
      command: 'bold',
      label: 'Bold',
      isActive: () => document.queryCommandState('bold'),
    },
    {
      icon: Italic,
      command: 'italic',
      label: 'Italic',
      isActive: () => document.queryCommandState('italic'),
    },
    {
      icon: Underline,
      command: 'underline',
      label: 'Underline',
      isActive: () => document.queryCommandState('underline'),
    },
    {
      icon: List,
      command: 'insertUnorderedList',
      label: 'Bullet List',
      isActive: () => document.queryCommandState('insertUnorderedList'),
    },
    {
      icon: ListOrdered,
      command: 'insertOrderedList',
      label: 'Numbered List',
      isActive: () => document.queryCommandState('insertOrderedList'),
    },
  ]

  return (
    <div
      className={cn(
        'border-input bg-background w-full rounded-md border',
        className
      )}
    >
      {/* Toolbar */}
      <div className='border-border bg-muted/30 flex flex-wrap gap-1 border-b p-2'>
        {formatButtons.map(({ icon: Icon, command, label, isActive }) => (
          <Button
            key={label}
            type='button'
            variant={isActive() ? 'default' : 'ghost'}
            size='sm'
            onClick={() => executeCommand(command)}
            className='h-8 w-8 p-0'
            title={label}
          >
            <Icon className='h-4 w-4' />
          </Button>
        ))}
      </div>

      {/* Editor Content */}
      <div
        ref={editorRef}
        contentEditable
        onInput={handleInput}
        onKeyDown={handleKeyDown}
        className={cn(
          'min-h-[120px] w-full p-3 text-sm focus:outline-none',
          'prose prose-sm max-w-none',
          '[&_em]:italic [&_strong]:font-bold [&_u]:underline',
          '[&_ol]:list-decimal [&_ol]:pl-6 [&_ul]:list-disc [&_ul]:pl-6',
          '[&_li]:my-1 [&_p]:my-2'
        )}
        data-placeholder={placeholder}
        style={{
          // Custom styles for better editor experience
          lineHeight: '1.6',
        }}
        suppressContentEditableWarning={true}
      />

      {/* Placeholder styling */}
      <style>{`
        [contenteditable]:empty:before {
          content: attr(data-placeholder);
          color: hsl(var(--muted-foreground));
          pointer-events: none;
        }
      `}</style>
    </div>
  )
}

export default HtmlEditor
