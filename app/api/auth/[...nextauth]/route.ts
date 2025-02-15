import NextAuth from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { GoogleSpreadsheet } from 'google-spreadsheet';
import { JWT } from 'google-auth-library';
import bcrypt from 'bcryptjs';

function getPrivateKey() {
    const key = process.env.GOOGLE_PRIVATE_KEY!
        .replace(/^"/, '') // Remove leading quote
        .replace(/"$/, '') // Remove trailing quote
        .replace(/-----BEGIN PRIVATE KEY-----\\/, '-----BEGIN PRIVATE KEY-----\n') // Fix beginning
        .replace(/\\n/g, '\n'); // Replace remaining \n with actual newlines
    return key;
}

// Initialize Google Sheets
const credentials = {
    client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL!,
    private_key: getPrivateKey(),
};

const doc = new GoogleSpreadsheet(process.env.GOOGLE_SHEET_ID!, new JWT({
    email: credentials.client_email,
    key: credentials.private_key,
    scopes: [
        'https://www.googleapis.com/auth/spreadsheets',
        'https://www.googleapis.com/auth/drive.file',
    ],
}));

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

                    await doc.loadInfo();
                    const sheet = doc.sheetsByIndex[0];
                    const rows = await sheet.getRows();
                    
                    const user = rows.find(row => row.get('email') === credentials.email);
                    
                    if (!user) {
                        throw new Error('No user found with this email');
                    }

                    const isPasswordValid = await bcrypt.compare(
                        credentials.password, 
                        user.get('password')
                    );

                    if (!isPasswordValid) {
                        throw new Error('Invalid password');
                    }

                    return {
                        id: user.get('id'),
                        name: user.get('name'),
                        email: user.get('email'),
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
        },
    },
});

export { handler as GET, handler as POST };
