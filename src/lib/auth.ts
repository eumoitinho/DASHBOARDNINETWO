/**
 * NextAuth Configuration for NINETWODASH
 * Handles authentication for admin users and client portal access
 */

import type { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import bcrypt from 'bcryptjs';

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      id: 'credentials',
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Senha', type: 'password' }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error('Email e senha são obrigatórios');
        }

        // Mock authentication for development
        const validCredentials = [
          { email: 'admin@catalisti.com', password: 'admin123', name: 'Admin Catalisti' },
          { email: 'admin@ninetwodash.com', password: 'admin123', name: 'Admin NineTwoDash' },
          { email: 'admin', password: 'admin', name: 'Admin' },
        ];

        const user = validCredentials.find(
          cred => cred.email === credentials.email && cred.password === credentials.password
        );

        if (user) {
          return {
            id: '1',
            email: user.email,
            name: user.name,
            role: 'admin',
            clientId: null,
            clientSlug: null,
            avatar: null,
          };
        }

        throw new Error('Credenciais inválidas');
      }
    })
  ],
  
  session: {
    strategy: 'jwt' as const,
    maxAge: 24 * 60 * 60, // 24 hours
  },
  
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        // Fazendo type assertion para acessar propriedades customizadas
        const customUser = user as { role?: string; clientId?: string; clientSlug?: string; avatar?: string };
        token.role = customUser.role;
        token.clientId = customUser.clientId;
        token.clientSlug = customUser.clientSlug;
        token.avatar = customUser.avatar;
      }
      return token;
    },
    
    async session({ session, token }) {
      if (token) {
        (session.user as any).id = token.sub;
        (session.user as any).role = token.role;
        (session.user as any).clientId = token.clientId;
        (session.user as any).clientSlug = token.clientSlug;
        (session.user as any).avatar = token.avatar;
      }
      return session;
    },
  },
  
  pages: {
    signIn: '/login',
    error: '/login',
  },
  
  secret: process.env.NEXTAUTH_SECRET || 'your-secret-key-here',
  debug: process.env.NODE_ENV === 'development',
};

/**
 * Check if user can access specific client data
 */
export function canAccessClient(userRole: string, userClientId: string, targetClientId: string): boolean {
  if (userRole === 'admin') {
    return true; // Admins can access all clients
  }
  
  if (userRole === 'client') {
    return userClientId === targetClientId; // Clients can only access their own data
  }
  
  return false;
}

/**
 * Generate random password
 */
export function generateRandomPassword(length: number = 12): string {
  const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*';
  let password = '';
  
  for (let i = 0; i < length; i++) {
    password += charset.charAt(Math.floor(Math.random() * charset.length));
  }
  
  return password;
}

/**
 * Hash password using bcryptjs
 */
export async function hashPassword(password: string): Promise<string> {
  const saltRounds = 12;
  return await bcrypt.hash(password, saltRounds);
}

/**
 * Verify password using bcryptjs
 */
export async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
  return await bcrypt.compare(password, hashedPassword);
}