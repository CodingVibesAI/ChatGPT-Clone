'use client'

import * as React from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import * as z from 'zod'
import { Button } from '@/components/ui/button'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { createSupabaseClient } from '@/lib/supabase/client'

const formSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  fullName: z.string().min(2, 'Full name must be at least 2 characters'),
})

export function SignUpForm() {
  const [isLoading, setIsLoading] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)
  const [success, setSuccess] = React.useState(false)

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: '',
      password: '',
      fullName: '',
    },
  })

  const supabaseRef = React.useRef(createSupabaseClient())
  const supabase = supabaseRef.current

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      setIsLoading(true)
      setError(null)
      
      const { error: signUpError } = await supabase.auth.signUp({
        email: values.email,
        password: values.password,
        options: {
          data: {
            full_name: values.fullName,
          },
        },
      })

      if (signUpError) {
        throw signUpError
      }

      // Remove manual insert into users table
      // Success state only
      setSuccess(true)
    } catch (error) {
      setError(error instanceof Error ? error.message : 'An error occurred')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Form {...form}>
      {success ? (
        <div className="text-center text-green-500 text-base py-8">
          Account created! Please check your email to confirm your account before signing in.
        </div>
      ) : (
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="fullName"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-muted-foreground">Full Name</FormLabel>
                <FormControl>
                  <Input placeholder="John Doe" {...field} className="bg-input text-foreground border border-border focus:border-ring" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-muted-foreground">Email</FormLabel>
                <FormControl>
                  <Input placeholder="you@example.com" type="email" {...field} className="bg-input text-foreground border border-border focus:border-ring" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-muted-foreground">Password</FormLabel>
                <FormControl>
                  <Input placeholder="••••••••" type="password" {...field} className="bg-input text-foreground border border-border focus:border-ring" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          {error && (
            <div className="text-sm text-destructive">
              {error}
            </div>
          )}
          <Button type="submit" className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold" disabled={isLoading}>
            {isLoading ? 'Creating account...' : 'Create account'}
          </Button>
        </form>
      )}
    </Form>
  )
} 