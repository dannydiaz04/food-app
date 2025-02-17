import NextAuth from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { GoogleSpreadsheet } from 'google-spreadsheet';
import { JWT } from 'google-auth-library';
import bcrypt from 'bcryptjs';

// Add this helper function at the top of your file (or before its usage)
function getCircularReplacer() {
  const seen = new WeakSet();
  return (_key: string, value: any) => {
    if (typeof value === 'object' && value !== null) {
      if (seen.has(value)) {
        return '[Circular]';
      }
      seen.add(value);
    }
    return value;
  };
}

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
                email: { label: "email", type: "email" },
                password: { label: "password", type: "password" }
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
        async authorize(credentials) {
            try {
                if (!credentials?.email || !credentials?.password) {
                    throw new Error('Please enter email and password');
                }
                
                // Load the spreadsheet info using the JWT auth client.
                await doc.loadInfo();
                // Access the sheet by title.
                const sheet = doc.sheetsByTitle['users'];
                // Get rows with custom header mapping to handle duplicates
                const rows = await sheet.getRows({
                    mapHeaders: (header: string, index: number) => {
                        if (!header.trim()) return '';
                        console.log(`Processing header: "${header}" at index ${index}`);
                        
                        // If the header matches 'date' regardless of case, rename it uniquely
                        if (header.toLowerCase().trim() === 'date') {
                            return `date_${index}`;
                        }
                        
                        // If the header matches one of the keys we care about, normalize it exactly
                        if (['email', 'password', 'name', 'id'].includes(header.toLowerCase().trim())) {
                            return header.toLowerCase().trim();
                        }
                        
                        return header.toLowerCase().trim();
                    }
                });

                // Debug logs to understand the data structure
                console.log('Sheet headers:', sheet.headerValues);

                // Try accessing the email using the exact header name from the sheet
                const user = rows.find(row => {
                    console.log('Row data:', row._rawData);
                    // Try to find the email column index from headers
                    const emailIndex = sheet.headerValues.findIndex(header => 
                        header.toLowerCase().includes('email')
                    );
                    const rowEmail = row._rawData[emailIndex];
                    console.log('Found email in row:', rowEmail);
                    return rowEmail === credentials.email;
                });
                
                if (!user) {
                    throw new Error('No user found with this email');
                }

                const userPassword = user._rawData[sheet.headerValues.findIndex(header => header.toLowerCase().includes('password'))];
                console.log('User password from sheet:', userPassword);
                console.log('User password from credentials:', credentials.password);
                console.log('User.password in bcrypt compare function:', user.password);
                // Compare the given password with the stored hashed password
                const isPasswordValid = await bcrypt.compare(
                    credentials.password,
                    userPassword
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
    }
});

export { handler as GET, handler as POST };
