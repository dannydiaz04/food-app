import { NextAuthOptions } from "next-auth"
import Google from "next-auth/providers/google"
import { GoogleSpreadsheet } from "google-spreadsheet"
import { JWT } from "next-auth/jwt"

// Define types for better TypeScript support
interface User {
  id?: string
  name?: string | null
  email?: string | null
  image?: string | null
}

interface Session {
  user: User
  expires: string
}

export const authOptions: NextAuthOptions = {
  secret: process.env.NEXTAUTH_SECRET,
  
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      authorization: {
        params: {
          prompt: "consent",
          access_type: "offline",
          response_type: "code"
        }
      }
    }),
  ],

  callbacks: {
    async signIn({ user, account, profile }: { user: User; account: any; profile: any }) {
      if (account?.provider === "google") {
        try {
          // Initialize the Google Sheet
          const doc = new GoogleSpreadsheet(process.env.GOOGLE_SHEET_ID!)

          // Authenticate with the Google Sheet
          await doc.useServiceAccountAuth({
            client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL!,
            private_key: process.env.GOOGLE_PRIVATE_KEY!.replace(/\\n/g, '\n'),
          })

          // Load the sheet
          await doc.loadInfo()
          const usersSheet = doc.sheetsByTitle[process.env.GOOGLE_USERS_SHEET_NAME!] // Get Users sheet

          // Get all rows
          const rows = await usersSheet.getRows()
          
          // Check if user already exists
          const existingUser = rows.find(row => row.get('email') === user.email)

          // If user doesn't exist, add them to the sheet
          if (!existingUser) {
            await usersSheet.addRow({
              email: user.email,
              name: user.name,
              created_at: new Date().toISOString(),
              last_login: new Date().toISOString(),
            })
          } else {
            // Update last login time for existing user
            const rowIndex = rows.findIndex(row => row.get('email') === user.email)
            if (rowIndex !== -1) {
              rows[rowIndex].set('last_login', new Date().toISOString())
              await rows[rowIndex].save()
            }
          }

          return true
        } catch (error) {
          console.error("Error accessing Google Sheet:", error)
          return false
        }
      }
      return true
    },

    async session({ session, token }: { session: Session; token: JWT }) {
      // Add any additional session handling here if needed
      return session
    },

    async jwt({ token, user, account }: { token: JWT; user: User | null; account: any }) {
      // Add any additional token handling here if needed
      return token
    }
  },

  // Configure session handling
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },

  // Configure pages (optional)
  pages: {
    signIn: '/login',        // Custom sign-in page
    signOut: '/auth/signout', // Custom sign-out page
    error: '/auth/error',    // Error page
  },
}
