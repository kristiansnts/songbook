import { ProfileFormModal } from '../profile/profile-form-modal'
import { AccountFormModal } from '../account/account-form-modal'
import { AppearanceFormModal } from '../appearance/appearance-form-modal'
import { NotificationsFormModal } from '../notifications/notifications-form-modal'
import { DisplayFormModal } from '../display/display-form-modal'
import { useSettings } from '../context/settings-context'

export function SettingsDialogs() {
  const { open, setOpen } = useSettings()

  return (
    <>
      <ProfileFormModal
        open={open === 'profile'}
        onOpenChange={(isOpen) => setOpen(isOpen ? 'profile' : null)}
      />
      
      <AccountFormModal
        open={open === 'account'}
        onOpenChange={(isOpen) => setOpen(isOpen ? 'account' : null)}
      />
      
      <AppearanceFormModal
        open={open === 'appearance'}
        onOpenChange={(isOpen) => setOpen(isOpen ? 'appearance' : null)}
      />
      
      <NotificationsFormModal
        open={open === 'notifications'}
        onOpenChange={(isOpen) => setOpen(isOpen ? 'notifications' : null)}
      />
      
      <DisplayFormModal
        open={open === 'display'}
        onOpenChange={(isOpen) => setOpen(isOpen ? 'display' : null)}
      />
    </>
  )
}