import NextAuth from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { GoogleSpreadsheet } from 'google-spreadsheet';
import { JWT } from 'google-auth-library';
import bcrypt from 'bcryptjs';

// Create a JWT client using the service account credentials.
const serviceAccountAuth = new JWT({
    email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL as string,
    key: process.env.GOOGLE_PRIVATE_KEY as string,
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
});

// Create a GoogleSpreadsheet instance using the JWT auth client.
const doc = new GoogleSpreadsheet(process.env.GOOGLE_USERS_SHEET_ID as string, serviceAccountAuth);

const handler = NextAuth({
    providers: [
        CredentialsProvider({
            name: 'Credentials',
            credentials: {
                email: { label: "Email", type: "email" },
                password: { label: "Password", type: "password" }
            },
            async authorize(credentials) {
                try {
                    if (!credentials?.email || !credentials?.password) {
                        throw new Error('Please enter email and password');
                    }
                    
                    // Load the spreadsheet info using the JWT auth client.
                    await doc.loadInfo();
                    
                    // Access the first sheet.
                    const sheet = doc.sheetsByIndex[0];
                    
                    // Get rows with custom header mapping to handle duplicates
                    const rows = await sheet.getRows({
                        mapHeaders: (header: string) => {
                            if (!header.trim()) return '';
                            // Append a unique identifier to duplicate 'date' headers
                            if (header === 'date') {
                                return `date_${Math.random()}`;
                            }
                            return header;
                        }
                    });
                    
                    // Find the user row by directly accessing the email column
                    const user = rows.find(row => row.email === credentials.email);
                    
                    if (!user) {
                        throw new Error('No user found with this email');
                    }
                    
                    // Compare the given password with the stored hashed password
                    const isPasswordValid = await bcrypt.compare(
                        credentials.password,
                        user.password
                    );
                    
                    if (!isPasswordValid) {
                        throw new Error('Invalid password');
                    }
                    
                    return {
                        id: user.id,
                        name: user.name,
                        email: user.email,
                    };
                } catch (error) {
                    console.error('Authorization error:', error);
                    return null;
                }
            }
        })
    ],
    pages: {
        signIn: '/auth/signin',
        signUp: '/auth/signup',
    },
    session: {
        strategy: 'jwt',
    },
    callbacks: {
        async jwt({ token, user }) {
            if (user) {
                token.id = user.id;
            }
            return token;
        },
        async session({ session, token }) {
            if (session.user) {
                session.user.id = token.id as string;
            }
            return session;
        }
    },
});

export { handler as GET, handler as POST };
