import { Button } from '@/components/ui/button'
import { useSettings } from '../context/settings-context'

export function SettingsModalButtons() {
  const { openModal } = useSettings()

  return (
    <div className='space-y-4'>
      <div className='grid gap-4'>
        <Button
          onClick={() => openModal('profile')}
          variant='outline'
          className='justify-start'
        >
          Edit Profile
        </Button>
        
        <Button
          onClick={() => openModal('account')}
          variant='outline'
          className='justify-start'
        >
          Update Account
        </Button>
        
        <Button
          onClick={() => openModal('appearance')}
          variant='outline'
          className='justify-start'
        >
          Customize Appearance
        </Button>
        
        <Button
          onClick={() => openModal('notifications')}
          variant='outline'
          className='justify-start'
        >
          Notification Settings
        </Button>
        
        <Button
          onClick={() => openModal('display')}
          variant='outline'
          className='justify-start'
        >
          Display Settings
        </Button>
      </div>
    </div>
  )
}