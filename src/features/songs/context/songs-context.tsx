import React, { useState } from 'react'
import useDialogState from '@/hooks/use-dialog-state'
import { Song } from '../data/schema'

type SongsDialogType = 'create' | 'update' | 'delete' | 'import'

interface SongsContextType {
  open: SongsDialogType | null
  setOpen: (str: SongsDialogType | null) => void
  currentRow: Song | null
  setCurrentRow: React.Dispatch<React.SetStateAction<Song | null>>
}

const SongsContext = React.createContext<SongsContextType | null>(null)

interface Props {
  children: React.ReactNode
}

export default function SongsProvider({ children }: Props) {
  const [open, setOpen] = useDialogState<SongsDialogType>(null)
  const [currentRow, setCurrentRow] = useState<Song | null>(null)
  return (
    <SongsContext value={{ open, setOpen, currentRow, setCurrentRow }}>
      {children}
    </SongsContext>
  )
}

// eslint-disable-next-line react-refresh/only-export-components
export const useSongs = () => {
  const songsContext = React.useContext(SongsContext)

  if (!songsContext) {
    throw new Error('useSongs has to be used within <SongsContext>')
  }

  return songsContext
}
