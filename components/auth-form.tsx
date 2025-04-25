'use client'
import { signIn } from 'next-auth/react'
import { Input } from './ui/input';
import { Label } from '@radix-ui/react-label';

export function AuthForm({
  onSubmit,
  children,
  defaultEmail = '',
}: {
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => Promise<void>;
  children: React.ReactNode;
  defaultEmail?: string;
}) {
  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-4 px-4 sm:px-16">
      <div className="flex flex-col gap-2">
        <Label
          htmlFor="email"
          className="text-zinc-600 font-normal dark:text-zinc-400"
        >
          Email Address
        </Label>

        <Input
          id="email"
          name="email"
          className="bg-muted text-md md:text-sm"
          type="email"
          placeholder="user@acme.com"
          autoComplete="email"
          required
          autoFocus
          defaultValue={defaultEmail}
        />
      </div>

      <div className="flex flex-col gap-2">
        <Label
          htmlFor="password"
          className="text-zinc-600 font-normal dark:text-zinc-400"
        >
          Password
        </Label>

        <Input
          id="password"
          name="password"
          className="bg-muted text-md md:text-sm"
          type="password"
          required
        />
      </div>

      {children}
    </form>
  );
}