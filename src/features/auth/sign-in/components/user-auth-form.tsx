import { HTMLAttributes, useState } from 'react'
import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useNavigate } from '@tanstack/react-router'
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
import { PasswordInput } from '@/components/password-input'
import { useAuth } from '@/lib/auth'
import { toast } from 'sonner'

type UserAuthFormProps = HTMLAttributes<HTMLFormElement>

const formSchema = z.object({
  email: z
    .string()
    .min(1, { message: 'Please enter your email' })
    .email({ message: 'Invalid email address' }),
  password: z
    .string()
    .min(1, {
      message: 'Please enter your password',
    })
})

export function UserAuthForm({ className, ...props }: UserAuthFormProps) {
  const [isLoading, setIsLoading] = useState(false)
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
              onClick: () => toast.dismiss()
            }
          })
          navigate({ to: `/playlist/join/${savedShareToken}` })
        } else if (result.isApprovedMember) {
          // Redirect approved members to approve page
          toast.success('Welcome! You have been approved.', {
            action: {
              label: 'x',
              onClick: () => toast.dismiss()
            }
          })
          navigate({ to: '/approved' })
        } else {
          // Normal dashboard redirect
          toast.success('Login successful!', {
            action: {
              label: 'x',
              onClick: () => toast.dismiss()
            }
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
            onClick: () => toast.dismiss()
          }
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
        className={cn('grid gap-3', className)}
        {...props}
      >
        <FormField
          control={form.control}
          name='email'
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input placeholder='name@example.com' {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name='password'
          render={({ field }) => (
            <FormItem className='relative'>
              <FormLabel>Password</FormLabel>
              <FormControl>
                <PasswordInput placeholder='********' {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button className='mt-2' disabled={isLoading}>
          Login
        </Button>
      </form>
    </Form>
  )
}
