import React, { useEffect, useState, useCallback, useRef } from 'react'
import { $getRoot, $getSelection, UNDO_COMMAND, REDO_COMMAND, CAN_UNDO_COMMAND, CAN_REDO_COMMAND, $createParagraphNode, $createTextNode } from 'lexical'
import { LexicalComposer } from '@lexical/react/LexicalComposer'
import { PlainTextPlugin } from '@lexical/react/LexicalPlainTextPlugin'
import { ContentEditable } from '@lexical/react/LexicalContentEditable'
import { HistoryPlugin } from '@lexical/react/LexicalHistoryPlugin'
import { OnChangePlugin } from '@lexical/react/LexicalOnChangePlugin'
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext'
import { LexicalErrorBoundary } from '@lexical/react/LexicalErrorBoundary'
import { mergeRegister } from '@lexical/utils'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { 
  Undo,
  Redo
} from 'lucide-react'

interface ChordLexicalEditorProps {
  content: string
  onChange: (content: string) => void
  placeholder?: string
  className?: string
}

// Parse content back to plain text for editing
function parseContentForEditing(html: string): string {
  if (!html || html.trim() === '') {
    return ''
  }
  
  // Create a temporary DOM element to parse HTML
  const tempDiv = document.createElement('div')
  tempDiv.innerHTML = html
  
  // Remove chord styling but keep the text - handle both old and new formats
  const chordElements = tempDiv.querySelectorAll('[data-chord="true"], span.c, span.on')
  chordElements.forEach(element => {
    if (element.textContent) {
      element.replaceWith(document.createTextNode(element.textContent))
    }
  })
  
  // Remove pre and div wrappers, get the content
  const preElement = tempDiv.querySelector('pre')
  if (preElement) {
    // For new format with pre tag, get the text content and preserve newlines
    return preElement.textContent || preElement.innerText || ''
  }
  
  // For legacy format, return the cleaned text content
  return tempDiv.textContent || tempDiv.innerText || ''
}

// Optimized chord detection with compiled regex and caching
const CHORD_REGEX = /\b([A-G][#b]?(m|maj|min|dim|aug|sus[24]?|add\d+|[0-9])*(?:\/[A-G][#b]?)?)\b/g

// Cache for processed text to avoid redundant processing
const textCache = new Map<string, string>()

// Clear cache when format changes
textCache.clear()

// Convert plain text to final styled HTML format for database storage
function convertTextToChordHtml(text: string): string {
  if (!text || text.trim() === '') {
    return ''
  }
  
  // Check cache first
  if (textCache.has(text)) {
    return textCache.get(text)!
  }
  
  // Detect and style chords in the content with final format
  let html = text.replace(CHORD_REGEX, (match, chord) => {
    // Handle slash chords (e.g., "D/F#" -> "<span class="c">D</span><span class="on">/</span><span class="c">F#</span>")
    if (chord.includes('/')) {
      const [mainChord, bassNote] = chord.split('/')
      return `<span class="c" title="">${mainChord}</span><span class="on" title="">/</span><span class="c" title="">${bassNote}</span>`
    } else {
      // Regular chord
      return `<span class="c" title="">${chord}</span>`
    }
  })
  
  // Wrap in the final format with pre tag
  const result = `<div>\n<pre data-key="C">${html}</pre>\n</div>`
  
  // Cache the result if text is reasonably sized (avoid memory issues)
  if (text.length < 10000) {
    textCache.set(text, result)
    
    // Limit cache size
    if (textCache.size > 100) {
      const firstKey = textCache.keys().next().value
      textCache.delete(firstKey)
    }
  }
  
  return result
}

// Toolbar component
function ToolbarPlugin() {
  const [editor] = useLexicalComposerContext()
  const [canUndo, setCanUndo] = useState(false)
  const [canRedo, setCanRedo] = useState(false)
  
  useEffect(() => {
    return mergeRegister(
      editor.registerCommand(
        CAN_UNDO_COMMAND,
        (payload) => {
          setCanUndo(payload)
          return false
        },
        1
      ),
      editor.registerCommand(
        CAN_REDO_COMMAND,
        (payload) => {
          setCanRedo(payload)
          return false
        },
        1
      )
    )
  }, [editor])
  
  const undo = () => {
    editor.dispatchCommand(UNDO_COMMAND, undefined)
  }
  
  const redo = () => {
    editor.dispatchCommand(REDO_COMMAND, undefined)
  }

  return (
    <div className="border-b border-gray-200 bg-gray-50 p-2 flex flex-wrap items-center gap-1 sm:gap-2">
      <Button
        variant="ghost"
        size="sm"
        onClick={undo}
        disabled={!canUndo}
        className="h-8 w-8 p-0"
      >
        <Undo className="h-4 w-4" />
      </Button>

      <Button
        variant="ghost"
        size="sm"
        onClick={redo}
        disabled={!canRedo}
        className="h-8 w-8 p-0"
      >
        <Redo className="h-4 w-4" />
      </Button>
    </div>
  )
}

export function ChordLexicalEditor({ 
  content, 
  onChange, 
  placeholder = "Enter lyrics and chords...",
  className
}: ChordLexicalEditorProps) {
  // Parse existing content back to plain text for editing
  const initialContent = parseContentForEditing(content)
  const debounceTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const lastProcessedTextRef = useRef<string>('')
  const isInitializingRef = useRef<boolean>(false)
  
  // Initialize Lexical configuration
  const initialConfig = {
    namespace: 'ChordEditor',
    onError: (error: Error) => {
      console.error('Lexical error:', error)
    },
    editorState: null // Let Lexical handle initial state
  }

  // Debounced change handler to improve performance
  const debouncedOnChange = useCallback((textContent: string) => {
    // Skip during initialization to prevent infinite loops
    if (isInitializingRef.current) {
      return
    }
    
    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current)
    }
    
    debounceTimeoutRef.current = setTimeout(() => {
      // Skip processing if text hasn't changed
      if (lastProcessedTextRef.current === textContent) {
        return
      }
      
      lastProcessedTextRef.current = textContent
      
      if (!textContent || textContent.trim() === '') {
        onChange('')
        return
      }
      
      // Convert plain text to HTML with chord styling
      const html = convertTextToChordHtml(textContent)
      onChange(html)
    }, 150) // 150ms debounce delay
  }, [onChange])

  const handleChange = useCallback((editorState: any) => {
    editorState.read(() => {
      const root = $getRoot()
      const textContent = root.getTextContent()
      debouncedOnChange(textContent)
    })
  }, [debouncedOnChange])

  // Set initialization flag when content loads
  useEffect(() => {
    if (initialContent) {
      isInitializingRef.current = true
      // Clear flag after initialization
      const timer = setTimeout(() => {
        isInitializingRef.current = false
      }, 300)
      return () => clearTimeout(timer)
    }
  }, [initialContent])

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current)
      }
    }
  }, [])

  return (
    <div className={cn('border border-gray-200 rounded-lg overflow-hidden', className)}>
      <LexicalComposer initialConfig={initialConfig}>
        <ToolbarPlugin />
        <div className="bg-white min-h-[200px] relative">
          <PlainTextPlugin
            contentEditable={
              <ContentEditable 
                className="prose prose-sm sm:prose-base max-w-none focus:outline-none p-3 sm:p-4 text-sm sm:text-base leading-relaxed whitespace-pre-wrap resize-none"
                style={{ minHeight: '200px' }}
              />
            }
            placeholder={
              <div className="absolute top-3 left-3 sm:top-4 sm:left-4 text-gray-400 pointer-events-none text-sm sm:text-base select-none">
                {placeholder}
              </div>
            }
            ErrorBoundary={LexicalErrorBoundary}
          />
        </div>
        <HistoryPlugin />
        <OnChangePlugin onChange={handleChange} />
        {initialContent && initialContent.trim() !== '' && (
          <InitialContentPlugin content={initialContent} />
        )}
      </LexicalComposer>
    </div>
  )
}

// Plugin to set initial content (fixed infinite update issue)
function InitialContentPlugin({ content }: { content: string }) {
  const [editor] = useLexicalComposerContext()
  const [initialized, setInitialized] = useState(false)
  
  useEffect(() => {
    if (!content || content.trim() === '' || initialized) {
      return
    }
    
    editor.update(() => {
      const root = $getRoot()
      // Clear existing content first
      root.clear()
      
      if (content.trim()) {
        const paragraph = $createParagraphNode()
        paragraph.append($createTextNode(content))
        root.append(paragraph)
      }
      
      setInitialized(true)
    })
  }, [content, editor, initialized])
  
  return null
}