

import Link from 'next/link';
import { LoginForm } from './login-form';

export default function Page() {
  return (
    <div className="flex h-screen w-screen flex-col items-center justify-center">
    <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
      <div className="flex flex-col space-y-2 text-center">
        <h1 className="text-2xl font-semibold tracking-tight">Sign in to your account</h1>
        <p className="text-sm text-muted-foreground">Enter your credentials to sign in to your account</p>
      </div>
      <LoginForm />
      <p className="px-8 text-center text-sm text-muted-foreground">
        Don&apos;t have an account?{" "}
        <Link href="/register" className="underline underline-offset-4 hover:text-primary">
          Register
        </Link>
        </p>
      </div>
    </div>
  );
}
