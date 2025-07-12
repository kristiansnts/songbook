import { showSubmittedData } from '@/utils/show-submitted-data'
import { ConfirmDialog } from '@/components/confirm-dialog'
import { useSongs } from '../context/songs-context'
import { SongsMutateDialog } from './songs-mutate-drawer'
import { SongViewDialog } from './song-view-dialog'

export function SongsDialogs() {
  const { open, setOpen, currentRow, setCurrentRow, viewDialogOpen, setViewDialogOpen, viewSong } = useSongs()
  return (
    <>
      <SongsMutateDialog
        key='song-create'
        open={open === 'create'}
        onOpenChange={(isOpen) => setOpen(isOpen ? 'create' : null)}
      />

      <SongViewDialog
        open={viewDialogOpen}
        onOpenChange={setViewDialogOpen}
        song={viewSong}
      />

      {currentRow && (
        <>
          <SongsMutateDialog
            key={`song-update-${currentRow.id}`}
            open={open === 'update'}
            onOpenChange={(isOpen) => {
              setOpen(isOpen ? 'update' : null)
              if (!isOpen) {
                setTimeout(() => {
                  setCurrentRow(null)
                }, 500)
              }
            }}
            currentRow={currentRow}
          />

          <ConfirmDialog
            key='song-delete'
            destructive
            open={open === 'delete'}
            onOpenChange={(isOpen) => {
              setOpen(isOpen ? 'delete' : null)
              if (!isOpen) {
                setTimeout(() => {
                  setCurrentRow(null)
                }, 500)
              }
            }}
            handleConfirm={() => {
              setOpen(null)
              setTimeout(() => {
                setCurrentRow(null)
              }, 500)
              showSubmittedData(
                currentRow,
                'The following song has been deleted:'
              )
            }}
            className='max-w-md'
            title={`Delete this song: ${currentRow.id} ?`}
            desc={
              <>
                You are about to delete a song with the ID{' '}
                <strong>{currentRow.id}</strong>. <br />
                This action cannot be undone.
              </>
            }
            confirmText='Delete'
          />
        </>
      )}
    </>
  )
}
