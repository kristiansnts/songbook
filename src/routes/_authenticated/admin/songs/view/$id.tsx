import { createFileRoute, useParams } from '@tanstack/react-router'
import { SongResource } from '@/panels/admin/resources/songs/songResource'
import { SongViewer } from '@/components/song-viewer'
import { BasePage } from '@/lib/resources/pages/base-page'
import { useState, useEffect } from 'react'
import { Song } from '@/types/song'

const songResource = new SongResource()

function SongViewPage() {
  const { id } = useParams({ from: '/_authenticated/admin/songs/view/$id' })
  const [song, setSong] = useState<Song | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const loadSong = async () => {
      try {
        setLoading(true)
        const songData = await songResource.getRecord(id)
        if (songData) {
          setSong(songData)
        } else {
          setError('Song not found')
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load song')
      } finally {
        setLoading(false)
      }
    }

    loadSong()
  }, [id])

  if (loading) {
    return (
      <BasePage
        resource={songResource}
        config={{
          title: 'Loading Song...',
          actions: [
            {
              name: 'back',
              label: 'Back to Songs',
              action: () => songResource.navigateToList(),
            },
          ],
        }}
      >
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </BasePage>
    )
  }

  if (error || !song) {
    return (
      <BasePage
        resource={songResource}
        config={{
          title: 'Song Not Found',
          actions: [
            {
              name: 'back',
              label: 'Back to Songs',
              action: () => songResource.navigateToList(),
            },
          ],
        }}
      >
        <div className="text-center py-12">
          <p className="text-gray-500 mb-4">{error || 'Song not found'}</p>
        </div>
      </BasePage>
    )
  }

  return (
    <BasePage
      resource={songResource}
      config={{
        title: '',
        actions: [
          {
            name: 'back',
            label: 'Back to Songs',
            action: () => songResource.navigateToList(),
          },
        ],
      }}
    >
      <SongViewer song={song} />
    </BasePage>
  )
}

export const Route = createFileRoute('/_authenticated/admin/songs/view/$id')({
  component: SongViewPage,
})