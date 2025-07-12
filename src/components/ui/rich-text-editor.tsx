import * as React from 'react'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { Bold, Italic, Underline, List, ListOrdered } from 'lucide-react'
import { cn } from '@/lib/utils'

interface RichTextEditorProps {
  value?: string
  onChange?: (value: string) => void
  placeholder?: string
  className?: string
}

export function RichTextEditor({
  value = '',
  onChange,
  placeholder = 'Enter text...',
  className,
}: RichTextEditorProps) {
  const textareaRef = React.useRef<HTMLTextAreaElement>(null)

  const insertFormatting = (before: string, after: string = '') => {
    const textarea = textareaRef.current
    if (!textarea) return

    const start = textarea.selectionStart
    const end = textarea.selectionEnd
    const selectedText = value.substring(start, end)
    const newText = value.substring(0, start) + before + selectedText + after + value.substring(end)
    
    onChange?.(newText)
    
    // Restore cursor position
    setTimeout(() => {
      textarea.focus()
      textarea.setSelectionRange(start + before.length, end + before.length)
    }, 0)
  }

  const formatButtons = [
    { icon: Bold, action: () => insertFormatting('**', '**'), label: 'Bold' },
    { icon: Italic, action: () => insertFormatting('*', '*'), label: 'Italic' },
    { icon: Underline, action: () => insertFormatting('<u>', '</u>'), label: 'Underline' },
    { icon: List, action: () => insertFormatting('\n- ', ''), label: 'Bullet List' },
    { icon: ListOrdered, action: () => insertFormatting('\n1. ', ''), label: 'Numbered List' },
  ]

  return (
    <div className={cn('space-y-2', className)}>
      <div className="flex flex-wrap gap-1 border-b pb-2">
        {formatButtons.map(({ icon: Icon, action, label }) => (
          <Button
            key={label}
            type="button"
            variant="ghost"
            size="sm"
            onClick={action}
            className="h-8 w-8 p-0"
            title={label}
          >
            <Icon className="h-4 w-4" />
          </Button>
        ))}
      </div>
      <Textarea
        ref={textareaRef}
        value={value}
        onChange={(e) => onChange?.(e.target.value)}
        placeholder={placeholder}
        className="min-h-[120px] resize-none"
      />
    </div>
  )
}