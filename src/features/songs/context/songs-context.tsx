import React, { useState, useEffect } from 'react'
import { Song } from '../data/schema'
import { SongsService } from '../services/songs-service'

type SongsDialogType = 'create' | 'update' | 'delete'

interface SongsContextType {
  open: SongsDialogType | null
  setOpen: (str: SongsDialogType | null) => void
  currentRow: Song | null
  setCurrentRow: React.Dispatch<React.SetStateAction<Song | null>>
  openModal: (modal: SongsDialogType) => void
  closeModal: () => void
  viewDialogOpen: boolean
  setViewDialogOpen: (open: boolean) => void
  viewSong: Song | null
  setViewSong: React.Dispatch<React.SetStateAction<Song | null>>
  openViewDialog: (song: Song) => void
  songs: Song[]
  refreshSongs: () => void
  addSong: (songData: Omit<Song, 'id'>) => void
  updateSong: (id: string, songData: Partial<Song>) => void
  deleteSong: (id: string) => void
}

const SongsContext = React.createContext<SongsContextType | null>(null)

interface Props {
  children: React.ReactNode
}

export default function SongsProvider({ children }: Props) {
  const [open, setOpen] = useState<SongsDialogType | null>(null)
  const [currentRow, setCurrentRow] = useState<Song | null>(null)
  const [viewDialogOpen, setViewDialogOpen] = useState(false)
  const [viewSong, setViewSong] = useState<Song | null>(null)
  const [songs, setSongs] = useState<Song[]>([])

  // Load songs on mount
  useEffect(() => {
    refreshSongs()
  }, [])

  const refreshSongs = () => {
    const loadedSongs = SongsService.getSongs()
    setSongs(loadedSongs)
  }

  const addSong = (songData: Omit<Song, 'id'>) => {
    // TODO: Will implement add to database when backend is ready
    const newSong = SongsService.addSong(songData)
    refreshSongs()
    return newSong
  }

  const updateSong = (id: string, songData: Partial<Song>) => {
    // TODO: Will implement update to database when backend is ready
    const updatedSong = SongsService.updateSong(id, songData)
    if (updatedSong) {
      refreshSongs()
    }
    return updatedSong
  }

  const deleteSong = (id: string) => {
    // TODO: Will implement delete from database when backend is ready
    const success = SongsService.deleteSong(id)
    if (success) {
      refreshSongs()
    }
    return success
  }

  const openModal = (modal: SongsDialogType) => {
    setOpen(modal)
  }

  const closeModal = () => {
    setOpen(null)
  }

  const openViewDialog = (song: Song) => {
    setViewSong(song)
    setViewDialogOpen(true)
  }

  return (
    <SongsContext value={{ 
      open, 
      setOpen, 
      currentRow, 
      setCurrentRow,
      openModal,
      closeModal,
      viewDialogOpen,
      setViewDialogOpen,
      viewSong,
      setViewSong,
      openViewDialog,
      songs,
      refreshSongs,
      addSong,
      updateSong,
      deleteSong
    }}>
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
