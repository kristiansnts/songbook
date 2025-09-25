interface Props {
  children: React.ReactNode
}

export default function AuthLayout({ children }: Props) {
  return (
    <div className='min-h-screen bg-gray-100 flex items-center justify-center p-4'>
      <div className='w-full max-w-xl'>
        <div className='flex justify-center'>
          <div className='w-full max-w-sm lg:max-w-lg'>
            <div className='bg-white rounded-lg shadow-xl overflow-hidden'>
              <div className='flex flex-col md:flex-row'>
                {/* Image Section */}
                <div
                  className='w-full md:w-1/2 bg-cover bg-center bg-no-repeat min-h-[200px] md:min-h-[200px]'
                  style={{
                    backgroundImage: 'url(/images/logoutama.png)',
                    backgroundColor: '#960001',
                    backgroundSize: '80% auto',
                    backgroundRepeat: 'no-repeat'
                  }}
                />
                {/* Form Section */}
                <div className='w-full md:w-1/2 p-6 md:p-8'>
                  {children}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
