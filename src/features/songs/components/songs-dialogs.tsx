import { showSubmittedData } from '@/utils/show-submitted-data'
import { ConfirmDialog } from '@/components/confirm-dialog'
import { useSongs } from '../context/songs-context'
import { SongsImportDialog } from './songs-import-dialog'
import { SongsMutateDrawer } from './songs-mutate-drawer'

export function SongsDialogs() {
  const { open, setOpen, currentRow, setCurrentRow } = useSongs()
  return (
    <>
      <SongsMutateDrawer
        key='song-create'
        open={open === 'create'}
        onOpenChange={() => setOpen('create')}
      />

      <SongsImportDialog
        key='songs-import'
        open={open === 'import'}
        onOpenChange={() => setOpen('import')}
      />

      {currentRow && (
        <>
          <SongsMutateDrawer
            key={`song-update-${currentRow.id}`}
            open={open === 'update'}
            onOpenChange={() => {
              setOpen('update')
              setTimeout(() => {
                setCurrentRow(null)
              }, 500)
            }}
            currentRow={currentRow}
          />

          <ConfirmDialog
            key='song-delete'
            destructive
            open={open === 'delete'}
            onOpenChange={() => {
              setOpen('delete')
              setTimeout(() => {
                setCurrentRow(null)
              }, 500)
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
