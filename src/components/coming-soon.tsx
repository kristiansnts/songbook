import { IconPlanet } from '@tabler/icons-react'

export default function ComingSoon() {
  return (
    <div className='h-svh'>
      <div className='m-auto flex h-full w-full flex-col items-center justify-center gap-2'>
        <IconPlanet size={72} />
        <h1 className='text-4xl leading-tight font-bold'>Contact Information</h1>
        <div className='text-muted-foreground text-center space-y-4'>
          <div>
            <h2 className='text-lg font-semibold text-foreground mb-2'>Admin Contact</h2>
            <p>
              <strong>Charis Henoch</strong> <br />
              Email: <a href='mailto:tianfidi@gmail.com' className='text-primary underline'>tianfidi@gmail.com</a> <br />
              WhatsApp: <a href='https://wa.me/6282228041784' className='text-primary underline' target='_blank' rel='noopener noreferrer'>082228041784</a>
            </p>
          </div>
          <div>
            <h2 className='text-lg font-semibold text-foreground mb-2'>Developer Contact</h2>
            <p>
              Please contact epafroditus.kristian@gmail.com for consultation. <br />
              or visit{' '}
              <a
                href='https://kristiansnts.dev'
                className='text-primary underline'
                target='_blank'
                rel='noopener noreferrer'
              >kristiansnts.dev</a>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
