import { Metadata } from 'next'
import Link from 'next/link'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { SignUpForm } from './sign-up-form'

export const metadata: Metadata = {
  title: 'Sign Up',
  description: 'Create a new account',
}

export default function SignUpPage() {
  return (
    <Card className="bg-[#23272f] text-[#ececf1] border-none shadow-2xl">
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl text-[#ececf1]">Create an account</CardTitle>
        <CardDescription className="text-[#b4bcd0]">
          Enter your email and password to create your account
        </CardDescription>
      </CardHeader>
      <CardContent className="grid gap-4">
        <SignUpForm />
      </CardContent>
      <CardFooter>
        <p className="text-sm text-[#b4bcd0]">
          Already have an account?{' '}
          <Link href="/sign-in" className="underline underline-offset-4 hover:text-[#19c37d]">
            Sign in
          </Link>
        </p>
      </CardFooter>
    </Card>
  )
} 