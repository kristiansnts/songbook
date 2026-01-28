import AuthLayout from '../auth-layout'
import { UserAuthForm } from './components/user-auth-form'

export default function SignIn() {
  return (
    <AuthLayout>
      <div className='w-full'>
        <h3 className='mb-6 text-2xl font-medium text-gray-800'>Masuk</h3>
        <UserAuthForm />
      </div>
    </AuthLayout>
  )
}
