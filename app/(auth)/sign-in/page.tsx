import { Metadata } from 'next'
import Link from 'next/link'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { SignInForm } from './sign-in-form'

export const metadata: Metadata = {
  title: 'Sign In',
  description: 'Sign in to your account',
}

export default function SignInPage() {
  return (
    <Card className="bg-[#23272f] text-[#ececf1] border-none shadow-2xl">
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl text-[#ececf1]">Sign in</CardTitle>
        <CardDescription className="text-[#b4bcd0]">
          Choose your preferred sign in method
        </CardDescription>
      </CardHeader>
      <CardContent className="grid gap-4">
        <SignInForm />
      </CardContent>
      <CardFooter>
        <p className="text-sm text-[#b4bcd0]">
          Don&apos;t have an account?{' '}
          <Link href="/sign-up" className="underline underline-offset-4 hover:text-[#19c37d]">
            Sign up
          </Link>
        </p>
      </CardFooter>
    </Card>
  )
} 