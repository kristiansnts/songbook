import { IconSparkles, IconCheck } from '@tabler/icons-react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'

interface UpgradeModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  title?: string
  message?: string
  reason?: 'playlist-limit' | 'song-limit'
}

export function UpgradeModal({
  open,
  onOpenChange,
  title = 'Upgrade Diperlukan',
  message,
  reason,
}: UpgradeModalProps) {
  const getDefaultMessage = () => {
    if (message) return message

    if (reason === 'playlist-limit') {
      return 'Silahkan hubungi LevelUp kota Kalian untuk menjadi Squad agar mendapatkan benefit 25 playlist terbuka, dan menjadi Core untuk menerima seluruh manfaat SongBank.'
    }

    if (reason === 'song-limit') {
      return 'Tidak ada batasan lagu per playlist. Silahkan hubungi LevelUp jika ada masalah.'
    }

    return 'Silahkan hubungi LevelUp kota Kalian untuk mendapatkan akses penuh.'
  }

  const getPlanFeatures = () => {
    if (reason === 'playlist-limit') {
      return [
        'Squad: 25 playlist terbuka',
        'Core: Unlimited playlist',
        'Core: Unlimited lagu per playlist',
        'Akses fitur kolaborasi tim',
      ]
    }

    if (reason === 'song-limit') {
      return [
        'Semua plan: Unlimited lagu per playlist',
        'Squad: 25 playlist terbuka',
        'Core: Unlimited playlist',
        'Hubungi LevelUp untuk info lebih lanjut',
      ]
    }

    return [
      'Squad: 25 playlist terbuka',
      'Core: Unlimited playlist & lagu',
      'Fitur kolaborasi tim',
      'Seluruh manfaat SongBank',
    ]
  }

  const handleContact = () => {
    // Close the modal when user clicks contact
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='sm:max-w-md'>
        <DialogHeader>
          <DialogTitle className='flex items-center gap-2'>
            <IconSparkles className='h-5 w-5 text-yellow-500' />
            {title}
          </DialogTitle>
          <DialogDescription>{getDefaultMessage()}</DialogDescription>
        </DialogHeader>

        <div className='py-4'>
          <div className='rounded-lg border border-blue-200 bg-gradient-to-br from-blue-50 to-indigo-50 p-4 dark:border-blue-800 dark:from-blue-950/30 dark:to-indigo-950/30'>
            <h3 className='text-foreground mb-3 font-semibold'>
              Manfaat Upgrade:
            </h3>
            <ul className='space-y-2'>
              {getPlanFeatures().map((feature, index) => (
                <li key={index} className='flex items-start gap-2 text-sm'>
                  <IconCheck className='mt-0.5 h-4 w-4 flex-shrink-0 text-green-500' />
                  <span className='text-foreground'>{feature}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <DialogFooter className='gap-2 sm:gap-0'>
          <Button variant='outline' onClick={() => onOpenChange(false)}>
            Nanti Saja
          </Button>
          <Button
            onClick={handleContact}
            className='bg-gradient-to-r from-blue-500 to-indigo-500 text-white hover:from-blue-600 hover:to-indigo-600'
          >
            <IconSparkles className='mr-2 h-4 w-4' />
            Hubungi LevelUp
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
