import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { parseLyricsAndChords, richTextToPlainText, getAvailableChords } from '@/utils/lyrics-parser'
import { useSongs } from '../context/songs-context'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { TagsInput } from '@/components/ui/tags-input'
import { HtmlEditor } from '@/components/ui/html-editor'
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Song } from '../data/schema'

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
  currentRow?: Song
}

const formSchema = z.object({
  title: z.string().min(1, 'Title is required.'),
  artist: z.string().optional(),
  tags: z.array(z.string()).optional(),
  baseChord: z.string().optional(),
  lyricAndChords: z.string().optional(),
})
type SongsForm = z.infer<typeof formSchema>

export function SongsMutateDialog({ open, onOpenChange, currentRow }: Props) {
  const isUpdate = !!currentRow
  const { addSong, updateSong } = useSongs()

  const form = useForm<SongsForm>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: currentRow?.title ?? '',
      artist: currentRow?.artist ?? '',
      tags: currentRow?.tags ?? [],
      baseChord: currentRow?.baseChord ?? '',
      lyricAndChords: currentRow?.lyricAndChords ?? '',
    },
  })


  const onSubmit = (data: SongsForm) => {
    
    // Parse lyrics and chords if provided
    const lyricsAndChordsHtml = data.lyricAndChords || '' // Keep HTML from rich editor
    
    // Convert HTML to plain text for parsing
    const plainText = richTextToPlainText(lyricsAndChordsHtml)
    
    const parsed = parseLyricsAndChords(plainText)
    
    // Create the processed data structure
    const processedData = {
      title: data.title,
      artist: data.artist,
      tags: data.tags || [],
      status: 'todo', // Default status for new songs
      label: 'song', // Default label
      lyric: parsed.lyrics,
      chords: parsed.chords.join(','), // Convert array to comma-separated string
      lyricAndChords: lyricsAndChordsHtml,
      baseChord: data.baseChord || (parsed.chords.length > 0 ? parsed.chords[0] : undefined)
    }

    try {
      if (isUpdate && currentRow) {
        // TODO: Will implement update to database when backend is ready
        updateSong(currentRow.id, processedData)
      } else {
        // TODO: Will implement add to database when backend is ready
        addSong(processedData)
      }
      
      onOpenChange(false)
      form.reset()
    } catch (_error) {
      // Handle error - could show a toast notification in the future
      // For now, silently fail and close the dialog
    }
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        onOpenChange(v)
        form.reset()
      }}
    >
      <DialogContent className="w-[98vw] sm:w-[95vw] sm:max-w-[600px] max-h-[90vh] sm:max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isUpdate ? 'Update' : 'Create'} Song</DialogTitle>
          <DialogDescription>
            {isUpdate
              ? 'Update the song by providing necessary info.'
              : 'Add a new song by providing necessary info.'}
            Click save when you&apos;re done.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form
            id='songs-form'
            onSubmit={form.handleSubmit(onSubmit)}
            className='space-y-4'
          >
            <FormField
              control={form.control}
              name='title'
              render={({ field }) => (
                <FormItem className='space-y-1'>
                  <FormLabel>Song title</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder='Enter a song title' />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
             <FormField
              control={form.control}
              name='artist'
              render={({ field }) => (
                <FormItem className='space-y-1'>
                  <FormLabel>Artist</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder='Enter a Artist of the song' />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="tags"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tags</FormLabel>
                  <FormControl>
                    <TagsInput
                      value={field.value ?? []}
                      onValueChange={field.onChange}
                      placeholder="Enter tags (e.g., rock, pop)"
                    />
                  </FormControl>
                  
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="baseChord"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Base Chord</FormLabel>
                  <FormControl>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select base chord (optional)" />
                      </SelectTrigger>
                      <SelectContent>
                        {getAvailableChords().map((chord) => (
                          <SelectItem key={chord.value} value={chord.value}>
                            {chord.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name='lyricAndChords'
              render={({ field }) => (
                <FormItem className='space-y-2'>
                  <FormLabel>Lyrics and Chords</FormLabel>
                  <FormControl>
                    <HtmlEditor
                      value={field.value}
                      onChange={field.onChange}
                      placeholder="Enter song lyrics and chords..."
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </form>
        </Form>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant='outline'>Cancel</Button>
          </DialogClose>
          <Button form='songs-form' type='submit'>
            Save changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
