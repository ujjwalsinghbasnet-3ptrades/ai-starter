import { compare } from 'bcrypt-ts';
import NextAuth, { type User, type Session, NextAuthOptions, SessionStrategy } from 'next-auth';
import CredentialProvider from 'next-auth/providers/credentials';
import { getUser } from '@/lib/db/queries';
import { JWT } from 'next-auth/jwt';

const MAX_AGE = 30 * 24 * 60 * 60;

declare module 'next-auth' {
  interface Session {
    user: {
      id: string;
      email?: string | null;
      name?: string | null;
    }
  }
}

export const authOptions:NextAuthOptions = {
  session: {
    strategy: "jwt" as SessionStrategy,
    maxAge: MAX_AGE,
  },
  pages: {
    signIn: "/login",
  },
  secret: process.env.NEXTAUTH_SECRET,
  providers: [
    CredentialProvider({
      credentials: {},
      async authorize({email, password}: any) {
        if (!email || !password) {
          return null
        }
        const users = await getUser(email);

        const [user] = users;
        console.log(user);
        if (!user.password) {
          return null;
        }

        const passwordsMatch = await compare(password, user.password);
        if (!passwordsMatch) return null;
        return user as any;
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
      }

      return token;
    },
    async session({
      session,
      token,
    }: {
      session: Session;
      token: JWT;
    }) {
      if (session.user) {
        session.user.id = token.id as string;
      }

      return session;
    },
  },
}

export default NextAuth(authOptions);
