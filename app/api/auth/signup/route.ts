import { NextResponse } from 'next/server';
import { GoogleSpreadsheet } from 'google-spreadsheet';
import { JWT } from 'google-auth-library';

function getCredentials() {
    const serviceAccount = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
    let privateKey = process.env.GOOGLE_PRIVATE_KEY;
    
    if (!serviceAccount || !privateKey) {
        throw new Error('Missing required Google credentials in environment variables');
    }

    // Extract just the private key portion using regex
    const keyMatch = privateKey.match(/-----BEGIN PRIVATE KEY-----[\s\S]*?-----END PRIVATE KEY-----/);
    if (!keyMatch) {
        throw new Error('Invalid private key format');
    }

    // Clean up the private key string
    const formattedKey = keyMatch[0]
        .replace(/\\n/g, '\n')    // Replace \n with newlines
        .replace(/\\\\/g, '')     // Remove double backslashes
        .replace(/\\/g, '')       // Remove single backslashes
        .replace(/"/g, '')        // Remove double quotes
        .replace(/'/g, '')        // Remove single quotes
        .split('\n')              // Split into lines
        .map(line => line.trim()) // Trim each line
        .join('\n')               // Join back with newlines
        .trim();                  // Trim the whole string

    console.log('Formatted key:', formattedKey); // For debugging

    return {
        client_email: serviceAccount,
        private_key: formattedKey,
    };
}

export async function POST(request: Request) {
    try {
        const { name, email, password } = await request.json();

        if (!name || !email || !password) {
            return NextResponse.json(
                { message: 'Missing required fields' },
                { status: 400 }
            );
        }

        const credentials = getCredentials();
        
        // Debug log without JSON.stringify
        console.log('credentials.private_key:', credentials.private_key);
        
        // Create JWT with the raw string
        const jwt = new JWT({
            email: credentials.client_email,
            key: credentials.private_key,
            scopes: [
                'https://www.googleapis.com/auth/spreadsheets',
                'https://www.googleapis.com/auth/drive.file',
            ],
        });

        const doc = new GoogleSpreadsheet(process.env.GOOGLE_USERS_SHEET_ID!, jwt);
        
        // If you need to log the doc object, use a custom replacer function
        console.log('doc:', JSON.stringify(doc, null, 2));

        await doc.loadInfo();
        
        const sheet = doc.sheetsByTitle[process.env.GOOGLE_USERS_SHEET_NAME!];
        
        if (!sheet) {
            console.error('Sheet not found:', process.env.GOOGLE_USERS_SHEET_NAME);
            return NextResponse.json(
                { message: 'Configuration error: Sheet not found' },
                { status: 500 }
            );
        }

        const rows = await sheet.getRows();
        if (rows.some(row => row.get('email') === email)) {
            return NextResponse.json(
                { message: 'User already exists' },
                { status: 400 }
            );
        }

        await sheet.addRow({
            id: Date.now().toString(),
            name,
            email,
            password,
        });

        return NextResponse.json(
            { message: 'User created successfully' },
            { status: 201 }
        );
    } catch (error) {
        console.error('Signup error:', error);
        return NextResponse.json(
            { message: 'Error creating user', error: String(error) },
            { status: 500 }
        );
    }
}