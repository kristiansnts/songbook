import { useState } from 'react'
import { createFileRoute } from '@tanstack/react-router'
import { toast } from 'sonner'
import { BulkPlaylistDialog } from '@/components/bulk-playlist-dialog'
import { columns } from '@/features/songs/components/columns'
import { DataTable } from '@/features/songs/components/data-table'
import { Song } from '@/features/songs/data/schema'
import { songs as mockSongs } from '@/features/songs/data/songs'

function SongsTablePage() {
  const [showBulkPlaylistDialog, setShowBulkPlaylistDialog] = useState(false)
  const [selectedSongs, setSelectedSongs] = useState<Song[]>([])

  const handleBulkAddToPlaylist = (songs: Song[]) => {
    setSelectedSongs(songs)
    setShowBulkPlaylistDialog(true)
  }

  const handleBulkPlaylistComplete = (
    playlistIds: string[],
    newPlaylistName?: string
  ) => {
    setSelectedSongs([])
    setShowBulkPlaylistDialog(false)

    toast.success(
      `${selectedSongs.length} songs successfully added to ${playlistIds.length} playlist(s)${newPlaylistName ? ` including "${newPlaylistName}"` : ''}`,
      {
        action: {
          label: 'x',
          onClick: () => toast.dismiss(),
        },
      }
    )
  }

  return (
    <div className='container mx-auto py-8'>
      <div className='space-y-6'>
        <div>
          <h1 className='text-2xl font-bold'>Songs Management</h1>
          <p className='text-muted-foreground'>
            Manage your songs and add multiple songs to playlists at once.
          </p>
        </div>

        <DataTable
          columns={columns}
          data={mockSongs}
          onBulkAddToPlaylist={handleBulkAddToPlaylist}
        />
      </div>

      {/* Bulk Playlist Dialog */}
      <BulkPlaylistDialog
        open={showBulkPlaylistDialog}
        onOpenChange={setShowBulkPlaylistDialog}
        songs={selectedSongs.map((song) => ({
          id: parseInt(song.id.replace('SONG-', ''), 10),
          title: song.title,
          artist: song.artist || 'Unknown Artist',
          base_chord: song.baseChord || 'C',
          lyrics_and_chords: song.lyricAndChords || '',
          tag_names: song.tags || [],
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        }))}
        onAddToPlaylist={handleBulkPlaylistComplete}
      />
    </div>
  )
}

export const Route = createFileRoute('/_authenticated/songs-table')({
  component: SongsTablePage,
})
