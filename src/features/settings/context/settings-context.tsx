import { createContext, useContext, useState, ReactNode } from 'react'

type SettingsModalType = 'profile' | 'account' | 'appearance' | 'notifications' | 'display' | null

interface SettingsContextType {
  open: SettingsModalType
  setOpen: (modal: SettingsModalType) => void
  openModal: (modal: NonNullable<SettingsModalType>) => void
  closeModal: () => void
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined)

interface SettingsProviderProps {
  children: ReactNode
}

export function SettingsProvider({ children }: SettingsProviderProps) {
  const [open, setOpen] = useState<SettingsModalType>(null)

  const openModal = (modal: NonNullable<SettingsModalType>) => {
    setOpen(modal)
  }

  const closeModal = () => {
    setOpen(null)
  }

  return (
    <SettingsContext.Provider 
      value={{ 
        open, 
        setOpen,
        openModal,
        closeModal
      }}
    >
      {children}
    </SettingsContext.Provider>
  )
}

export function useSettings() {
  const context = useContext(SettingsContext)
  if (context === undefined) {
    throw new Error('useSettings must be used within a SettingsProvider')
  }
  return context
}