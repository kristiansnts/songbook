import React, { useEffect } from 'react'
import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import {
  Bold,
  Italic,
  List,
  ListOrdered,
  Quote,
  Undo,
  Redo,
  Heading1,
  Heading2,
  Heading3,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'

interface ChordTiptapEditorProps {
  content: string
  onChange: (content: string) => void
  placeholder?: string
  className?: string
}

// Parse content back to plain text for editing (simplified for original format)
function parseContentForEditing(html: string): string {
  if (!html || html.trim() === '') {
    return ''
  }

  // Create a temporary DOM element to parse HTML
  const tempDiv = document.createElement('div')
  tempDiv.innerHTML = html

  // Remove chord styling but keep the text
  const chordElements = tempDiv.querySelectorAll('[data-chord="true"]')
  chordElements.forEach((element) => {
    if (element.textContent) {
      element.replaceWith(document.createTextNode(element.textContent))
    }
  })

  // Return the cleaned text content
  return tempDiv.textContent || tempDiv.innerText || ''
}

export function ChordTiptapEditor({
  content,
  onChange,
  placeholder = 'Enter lyrics and chords...',
  className,
}: ChordTiptapEditorProps) {
  // Parse existing content back to plain text for editing
  const initialContent = parseContentForEditing(content)

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        bulletList: {
          keepMarks: true,
          keepAttributes: false,
        },
        orderedList: {
          keepMarks: true,
          keepAttributes: false,
        },
      }),
    ],
    content: initialContent,
    editorProps: {
      attributes: {
        class:
          'prose prose-sm sm:prose-base max-w-none focus:outline-none min-h-[200px] p-3 sm:p-4 border-0 text-sm sm:text-base leading-relaxed whitespace-pre-wrap',
      },
    },
    onUpdate: ({ editor }) => {
      let html = editor.getHTML()

      // Detect and style chords in the content (original format)
      html = html.replace(
        /\b([A-G][#b]?(m|maj|min|dim|aug|sus[24]?|add\d+|[0-9])*(?:\/[A-G][#b]?)?)\b/g,
        '<strong style="color: rgb(59 130 246); font-weight: bold;" data-chord="true">$1</strong>'
      )

      onChange(html)
    },
  })

  // Update editor content when external content changes
  useEffect(() => {
    if (editor && content !== editor.getHTML()) {
      const parsedContent = parseContentForEditing(content)
      if (parsedContent !== editor.getText()) {
        editor.commands.setContent(parsedContent, false)
      }
    }
  }, [editor, content])

  if (!editor) {
    return null
  }

  return (
    <div
      className={cn(
        'overflow-hidden rounded-lg border border-gray-200',
        className
      )}
    >
      {/* Toolbar */}
      <div className='flex flex-wrap items-center gap-1 border-b border-gray-200 bg-gray-50 p-2 sm:gap-2'>
        {/* Formatting Buttons */}
        <Button
          variant='ghost'
          size='sm'
          onClick={() => editor.chain().focus().toggleBold().run()}
          className={cn(
            'h-8 w-8 p-0',
            editor.isActive('bold') && 'bg-gray-200'
          )}
        >
          <Bold className='h-4 w-4' />
        </Button>

        <Button
          variant='ghost'
          size='sm'
          onClick={() => editor.chain().focus().toggleItalic().run()}
          className={cn(
            'h-8 w-8 p-0',
            editor.isActive('italic') && 'bg-gray-200'
          )}
        >
          <Italic className='h-4 w-4' />
        </Button>

        <div className='mx-1 h-6 w-px bg-gray-300' />

        <Button
          variant='ghost'
          size='sm'
          onClick={() =>
            editor.chain().focus().toggleHeading({ level: 1 }).run()
          }
          className={cn(
            'h-8 w-8 p-0',
            editor.isActive('heading', { level: 1 }) && 'bg-gray-200'
          )}
        >
          <Heading1 className='h-4 w-4' />
        </Button>

        <Button
          variant='ghost'
          size='sm'
          onClick={() =>
            editor.chain().focus().toggleHeading({ level: 2 }).run()
          }
          className={cn(
            'h-8 w-8 p-0',
            editor.isActive('heading', { level: 2 }) && 'bg-gray-200'
          )}
        >
          <Heading2 className='h-4 w-4' />
        </Button>

        <Button
          variant='ghost'
          size='sm'
          onClick={() =>
            editor.chain().focus().toggleHeading({ level: 3 }).run()
          }
          className={cn(
            'h-8 w-8 p-0',
            editor.isActive('heading', { level: 3 }) && 'bg-gray-200'
          )}
        >
          <Heading3 className='h-4 w-4' />
        </Button>

        <div className='mx-1 h-6 w-px bg-gray-300' />

        <Button
          variant='ghost'
          size='sm'
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          className={cn(
            'h-8 w-8 p-0',
            editor.isActive('bulletList') && 'bg-gray-200'
          )}
        >
          <List className='h-4 w-4' />
        </Button>

        <Button
          variant='ghost'
          size='sm'
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          className={cn(
            'h-8 w-8 p-0',
            editor.isActive('orderedList') && 'bg-gray-200'
          )}
        >
          <ListOrdered className='h-4 w-4' />
        </Button>

        <Button
          variant='ghost'
          size='sm'
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          className={cn(
            'h-8 w-8 p-0',
            editor.isActive('blockquote') && 'bg-gray-200'
          )}
        >
          <Quote className='h-4 w-4' />
        </Button>

        <div className='mx-1 h-6 w-px bg-gray-300' />

        <Button
          variant='ghost'
          size='sm'
          onClick={() => editor.chain().focus().undo().run()}
          disabled={!editor.can().undo()}
          className='h-8 w-8 p-0'
        >
          <Undo className='h-4 w-4' />
        </Button>

        <Button
          variant='ghost'
          size='sm'
          onClick={() => editor.chain().focus().redo().run()}
          disabled={!editor.can().redo()}
          className='h-8 w-8 p-0'
        >
          <Redo className='h-4 w-4' />
        </Button>
      </div>

      {/* Editor Content */}
      <div className='bg-white'>
        <EditorContent editor={editor} placeholder={placeholder} />
      </div>
    </div>
  )
}
