import { IconPlanet } from '@tabler/icons-react'

export default function ComingSoon() {
  return (
    <div className='h-svh'>
      <div className='m-auto flex h-full w-full flex-col items-center justify-center gap-2'>
        <IconPlanet size={72} />
        <h1 className='text-4xl leading-tight font-bold'>Developer Contact</h1>
        <p className='text-muted-foreground text-center'>
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
  )
}
