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
  pages: {
    signIn: '/auth/signin',
  },
})

export { handler as GET, handler as POST } 