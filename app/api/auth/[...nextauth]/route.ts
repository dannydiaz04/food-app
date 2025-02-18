import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { createClient } from "@supabase/supabase-js";

// 1. Initialize your Supabase client using the service role key
const supabaseUrl = process.env.SUPABASE_URL as string;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY as string;
const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);

const authOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email", placeholder: "you@example.com" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials, req) {
        try {
          if (!credentials?.email || !credentials?.password) {
            throw new Error("Please provide both email and password.");
          }

          // 2. See if the request is intended to sign up OR sign in.
          //    - You can detect this in various ways, e.g., by checking
          //      a body parameter like `type: "signup"` or “signin”.
          //    - For demonstration, we'll assume your front-end sends 
          //      a param: credentials?.isSignUp.
          const isSignUp = req.body?.isSignUp; 
          const { email, password } = credentials;

          // 3. If it's a sign-up request:
          //    - Check if user already exists.
          //    - If not, create a new user with a hashed password.
          if (isSignUp) {
            const { data: existingUser } = await supabase
              .from("users")
              .select("id, email")
              .eq("email", email)
              .single();

            if (existingUser) {
              throw new Error("A user with this email already exists.");
            }

            // Hash the password before storing
            const hashedPassword = await bcrypt.hash(password, 10);

            // Insert the new user into the database
            const { data: newUser, error: insertError } = await supabase
              .from("users")
              .insert([
                { email, password: hashedPassword }, // Adjust columns as needed
              ])
              .select("*")
              .single();

            if (insertError || !newUser) {
              console.error("Sign-up insert error:", insertError);
              throw new Error("Error creating new user.");
            }

            // Return the newly created user data (NextAuth attaches it to the JWT)
            return {
              id: newUser.id,
              email: newUser.email,
              // Add any other columns from your "users" table as needed
            };
          } else {
            // 4. If it's a sign-in request:
            //    - Find user by email and compare the provided password with the stored hashed password.
            const { data: user, error } = await supabase
              .from("users")
              .select("id, email, password")
              .eq("email", email)
              .single();

            if (!user || error) {
              throw new Error("No user found with this email.");
            }

            // Compare the hashed password
            const isPasswordValid = await bcrypt.compare(password, user.password);
            if (!isPasswordValid) {
              throw new Error("Invalid credentials.");
            }

            // Return user object if password is valid
            return {
              id: user.id,
              email: user.email,
              // Add any other columns you want to include in the JWT/session
            };
          }
        } catch (error) {
          console.error("Authorization error:", error);
          throw error;
        }
      },
    }),
  ],

  pages: {
    signIn: "/auth/signin",
    // If you have a custom sign-up page, you can define it here:
    // signUp: "/auth/signup",
  },

  session: {
    strategy: "jwt",
  },

  callbacks: {
    async jwt({ token, user }: { token: any, user: any }) {
      // If user object exists, it means a successful sign-in or sign-up
      if (user) {
        token.id = user.id;
        // Add other properties to the token if desired
      }
      return token;
    },

    async session({ session, token }: { session: any, token: any }) {
      // Pass user ID (and/or other info) to the client in session
      if (session.user) {
        session.user.id = token.id;
      }
      return session;
    },
  },

  // Add your NEXTAUTH_SECRET in .env
  secret: process.env.NEXTAUTH_SECRET,
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };