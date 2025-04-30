import { getUser } from "@/lib/db/queries";
import { compare } from "bcrypt-ts";
import NextAuth, {
  type NextAuthOptions,
  type Session,
  type SessionStrategy,
} from "next-auth";
import type { JWT } from "next-auth/jwt";
import CredentialProvider from "next-auth/providers/credentials";

const MAX_AGE = 30 * 24 * 60 * 60;

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      email?: string | null;
      name?: string | null;
    };
  }
}

export const authOptions: NextAuthOptions = {
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
      async authorize({ email, password }: any) {
        if (!email || !password) {
          return null;
        }
        const users = await getUser(email);

        const [user] = users;
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
    async session({ session, token }: { session: Session; token: JWT }) {
      if (session.user) {
        session.user.id = token.id as string;
      }

      return session;
    },
  },
};

export default NextAuth(authOptions);
