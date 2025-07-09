import { NextRequest, NextResponse } from 'next/server'

// TEMPORALMENTE DESHABILITADO NEXTAUTH PARA EVITAR CONFLICTOS
// NextAuth está causando redirects automáticos a /login que interfieren 
// con nuestro sistema de autenticación personalizado

/*
import NextAuth from 'next-auth'
import GoogleProvider from 'next-auth/providers/google'
import { Session } from 'next-auth'

interface ExtendedSession extends Session {
  user: {
    id?: string
    name?: string | null
    email?: string | null
    image?: string | null
  }
}

const handler = NextAuth({
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  callbacks: {
    async session({ session, token }) {
      const extendedSession = session as ExtendedSession
      if (extendedSession.user) {
        extendedSession.user.id = token.sub
        extendedSession.user.name = token.name
        extendedSession.user.email = token.email
        extendedSession.user.image = token.picture
      }
      return extendedSession
    },
  },
  // Comentamos temporalmente para evitar conflictos con nuestro sistema de auth
  // pages: {
  //   signIn: '/auth/signin',
  // },
})

export { handler as GET, handler as POST } 
*/

// Respuesta temporal para desactivar NextAuth
const disabledHandler = (request: NextRequest) => {
  return NextResponse.json({ 
    error: 'NextAuth temporalmente deshabilitado' 
  }, { status: 404 })
}

export { disabledHandler as GET, disabledHandler as POST } 