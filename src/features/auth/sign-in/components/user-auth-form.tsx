import { HTMLAttributes, useState } from 'react'
import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useNavigate } from '@tanstack/react-router'
import { IconEye, IconEyeOff } from '@tabler/icons-react'
import { toast } from 'sonner'
import { useAuth } from '@/lib/auth'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'

type UserAuthFormProps = HTMLAttributes<HTMLFormElement>

const formSchema = z.object({
  email: z
    .string()
    .min(1, { message: 'Please enter your email' })
    .email({ message: 'Invalid email address' }),
  password: z.string().min(1, {
    message: 'Please enter your password',
  }),
})

export function UserAuthForm({ className, ...props }: UserAuthFormProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const { login } = useAuth()
  const navigate = useNavigate()

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  })

  async function onSubmit(data: z.infer<typeof formSchema>) {
    setIsLoading(true)

    try {
      const result = await login(data.email, data.password)
      if (result.success) {
        // Check if there's a saved playlist sharetoken
        const savedShareToken = localStorage.getItem('pending_playlist_join')

        if (savedShareToken) {
          // Redirect to the playlist join page
          toast.success('Login successful! Redirecting to playlist...', {
            action: {
              label: 'x',
              onClick: () => toast.dismiss(),
            },
          })
          navigate({ to: `/playlist/join/${savedShareToken}` })
        } else if (result.isApprovedMember) {
          // Redirect approved members to approve page
          toast.success('Welcome! You have been approved.', {
            action: {
              label: 'x',
              onClick: () => toast.dismiss(),
            },
          })
          navigate({ to: '/approved' })
        } else {
          // Normal dashboard redirect
          toast.success('Login successful!', {
            action: {
              label: 'x',
              onClick: () => toast.dismiss(),
            },
          })
          navigate({ to: '/dashboard' })
        }
      } else if (result.isPendingGuest) {
        // Don't show error toast for pending guest users - modal will handle it
        // User stays on sign-in page with modal showing
      } else if (result.isRequestReview) {
        // Don't show error toast for request review users - modal will handle it
        // User stays on sign-in page with modal showing
      } else {
        toast.error('Invalid credentials. Please contact administrator.', {
          action: {
            label: 'x',
            onClick: () => toast.dismiss(),
          },
        })
      }
    } catch {
      toast.error('Login failed')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className={cn('space-y-4', className)}
        {...props}
      >
        <FormField
          control={form.control}
          name='email'
          render={({ field }) => (
            <FormItem className='mt-3'>
              <FormLabel
                htmlFor='username'
                className='text-sm font-medium text-gray-700'
              >
                Email
              </FormLabel>
              <FormControl>
                <Input
                  id='username'
                  placeholder='Masukkan Email'
                  className='w-full rounded-md border border-gray-300 px-3 py-2 text-black focus:border-red-500 focus:ring-2 focus:ring-red-500 focus:outline-none'
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name='password'
          render={({ field }) => (
            <FormItem>
              <FormLabel
                htmlFor='password-field'
                className='text-sm font-medium text-gray-700'
              >
                Password
              </FormLabel>
              <FormControl>
                <div className='relative'>
                  <Input
                    type={showPassword ? 'text' : 'password'}
                    id='password-field'
                    placeholder='Masukkan Password'
                    className='w-full rounded-md border border-gray-300 px-3 py-2 pr-10 text-black focus:border-red-500 focus:ring-2 focus:ring-red-500 focus:outline-none'
                    {...field}
                  />
                  <button
                    type='button'
                    className='absolute top-1/2 right-3 -translate-y-1/2 text-gray-400 transition-colors hover:text-gray-600'
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <IconEyeOff size={20} />
                    ) : (
                      <IconEye size={20} />
                    )}
                  </button>
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button
          type='submit'
          className='mt-4 w-full rounded-md px-4 py-3 font-medium text-white focus:ring-2 focus:ring-red-500 focus:outline-none'
          style={{ backgroundColor: '#960001' }}
          disabled={isLoading}
        >
          {isLoading ? 'Sedang Masuk ...' : 'Masuk'}
        </Button>
      </form>
    </Form>
  )
}
