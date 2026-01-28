interface Props {
  children: React.ReactNode
}

export default function AuthLayout({ children }: Props) {
  return (
    <div className='flex min-h-screen items-center justify-center bg-gray-100 p-4'>
      <div className='w-full max-w-xl'>
        <div className='flex justify-center'>
          <div className='w-full max-w-sm lg:max-w-lg'>
            <div className='overflow-hidden rounded-lg bg-white shadow-xl'>
              <div className='flex flex-col md:flex-row'>
                {/* Image Section */}
                <div
                  className='min-h-[200px] w-full bg-cover bg-center bg-no-repeat md:min-h-[200px] md:w-1/2'
                  style={{
                    backgroundImage: 'url(/images/logoutama.png)',
                    backgroundColor: '#960001',
                    backgroundSize: '80% auto',
                    backgroundRepeat: 'no-repeat',
                  }}
                />
                {/* Form Section */}
                <div className='w-full p-6 md:w-1/2 md:p-8'>{children}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
