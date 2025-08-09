import React from 'react'
import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import { cn } from '@/lib/utils'

interface MinimalTiptapProps {
  content: string
  editable?: boolean
  className?: string
}

export function MinimalTiptap({ content, editable = false, className }: MinimalTiptapProps) {
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
    content,
    editable,
    editorProps: {
      attributes: {
        class: cn(
          'prose prose-sm sm:prose-base max-w-none focus:outline-none',
          'prose-p:my-1 prose-headings:my-2',
          className
        ),
      },
    },
  })

  if (!editor) {
    return null
  }

  return (
    <div className={cn('w-full', className)}>
      <EditorContent editor={editor} />
    </div>
  )
}