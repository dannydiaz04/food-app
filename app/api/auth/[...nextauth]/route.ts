import NextAuth from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import { GoogleSpreadsheet } from "google-spreadsheet"
import { JWT } from "google-auth-library"
import bcrypt from "bcryptjs"

// Create a JWT client using the service account credentials
const serviceAccountAuth = new JWT({
  email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL as string,
  key: process.env.GOOGLE_PRIVATE_KEY as string,
  scopes: ["https://www.googleapis.com/auth/spreadsheets"],
})

// Create a GoogleSpreadsheet instance using the JWT auth client
const doc = new GoogleSpreadsheet(process.env.GOOGLE_USERS_SHEET_ID as string, serviceAccountAuth)

const authOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      // The shape of your credentials is up to you. 
      // But typically we define the fields you'd expect in signIn("credentials", {...})
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials, req) {
        try {
          if (!credentials?.email || !credentials?.password) {
            throw new Error("Please enter email and password")
          }

          // Load the spreadsheet
          await doc.loadInfo()

          // Access the 'users' sheet by title
          const sheet = doc.sheetsByTitle["users"]
          const rows = await sheet.getRows({
            mapHeaders: (header: string, index: number) => {
              if (!header.trim()) return ""
              if (header.toLowerCase().trim() === "date") {
                return `date_${index}`
              }
              if (["email", "password", "name", "id"].includes(header.toLowerCase().trim())) {
                return header.toLowerCase().trim()
              }
              return header.toLowerCase().trim()
            },
          })

          // Find the row that matches this email
          const user = rows.find((row) => {
            // Figure out which index is the 'email' column
            const emailIndex = sheet.headerValues.findIndex((header) =>
              header.toLowerCase().includes("email"),
            )
            const rowEmail = row._rawData[emailIndex]
            return rowEmail === credentials.email
          })

          if (!user) {
            throw new Error("No user found with this email")
          }

          // Now get the password from that row
          const passwordIndex = sheet.headerValues.findIndex((header) =>
            header.toLowerCase().includes("password"),
          )
          const storedHash = user._rawData[passwordIndex] // the hashed password in the sheet

          // Compare the given password with the stored hashed password
          const isPasswordValid = await bcrypt.compare(credentials.password, storedHash)
          if (!isPasswordValid) {
            throw new Error("Invalid password")
          }

          // If password is valid, return the user object
          // NextAuth will store this in `user` param of callbacks.jwt, etc.
          return {
            id: user.id,       // from the row's "id" property if it exists
            name: user.name,   // from the row's "name" property
            email: user.email, // from the row's "email"
          }
        } catch (error) {
          console.error("Authorization error:", error)
          throw new Error("Invalid login") // triggers an error in the client
        }
      },
    }),
  ],
  pages: {
    signIn: "/auth/signin",
    signUp: "/auth/signup",
  },
  session: {
    strategy: "jwt",
  },
  callbacks: {
    async jwt({ token, user }) {
      // If user is returned (i.e., the user just signed in), attach user info to the token
      if (user) {
        token.id = user.id
      }
      return token
    },
    async session({ session, token }) {
      // Make the user's ID available on session.user
      if (session.user) {
        session.user.id = token.id as string
      }
      return session
    },
  },
  // You should have a NEXTAUTH_SECRET in .env as well
  secret: process.env.NEXTAUTH_SECRET,
}

const handler = NextAuth(authOptions)

export { handler as GET, handler as POST }