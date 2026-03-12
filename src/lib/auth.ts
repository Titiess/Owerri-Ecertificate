import type { NextAuthOptions, Session, User } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import bcrypt from 'bcryptjs';
import prisma from '@/lib/db';
import type { JWT } from 'next-auth/jwt';

// Extend NextAuth types
declare module 'next-auth' {
  interface Session {
    user: {
      id: string;
      email?: string | null;
      username?: string;
      name?: string | null;
      role: 'APPLICANT' | 'ADMIN' | 'CHAIRMAN';
    };
  }

  interface User {
    id: string;
    email?: string | null;
    username?: string;
    name?: string | null;
    role: 'APPLICANT' | 'ADMIN' | 'CHAIRMAN';
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id: string;
    email?: string | null;
    username?: string;
    name?: string | null;
    role: 'APPLICANT' | 'ADMIN' | 'CHAIRMAN';
  }
}

export const authOptions: NextAuthOptions = {
  providers: [
    // Applicant login (email + password)
    CredentialsProvider({
      id: 'applicant-login',
      name: 'Applicant Login',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials): Promise<User | null> {
        if (!credentials?.email || !credentials?.password) return null;

        const applicant = await prisma.applicant.findUnique({
          where: { email: credentials.email.toLowerCase().trim() },
        });

        if (!applicant || !applicant.isActive) return null;

        const isValid = await bcrypt.compare(credentials.password, applicant.passwordHash);
        if (!isValid) return null;

        return {
          id: applicant.id,
          email: applicant.email,
          name: applicant.fullName,
          role: 'APPLICANT',
        };
      },
    }),

    // Admin login (username + password)
    CredentialsProvider({
      id: 'admin-login',
      name: 'Admin Login',
      credentials: {
        username: { label: 'Username', type: 'text' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials): Promise<User | null> {
        if (!credentials?.username || !credentials?.password) return null;

        const admin = await prisma.adminUser.findUnique({
          where: { username: credentials.username.toLowerCase().trim() },
        });

        if (!admin || !admin.isActive) return null;

        const isValid = await bcrypt.compare(credentials.password, admin.passwordHash);
        if (!isValid) return null;

        return {
          id: admin.id,
          username: admin.username,
          name: admin.name,
          role: admin.role as 'ADMIN' | 'CHAIRMAN',
        };
      },
    }),
  ],

  session: {
    strategy: 'jwt',
    maxAge: 24 * 60 * 60, // 24 hours
  },

  callbacks: {
    async jwt({ token, user }: { token: JWT; user?: User }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
        token.email = user.email;
        token.username = user.username;
        token.name = user.name;
      }
      return token;
    },

    async session({ session, token }: { session: Session; token: JWT }) {
      session.user = {
        id: token.id,
        role: token.role,
        email: token.email,
        username: token.username,
        name: token.name,
      };
      return session;
    },
  },

  pages: {
    signIn: '/login',
    error: '/login',
  },

  secret: process.env.NEXTAUTH_SECRET,
};
