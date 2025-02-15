import { NextResponse } from 'next/server';
import { GoogleSpreadsheet } from 'google-spreadsheet';
import { JWT } from 'google-auth-library';
import bcrypt from 'bcrypt';
import { formatPrivateKey } from '../../../../utils/google';

function getCredentials() {
    const serviceAccount = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
    const rawPrivateKey = process.env.GOOGLE_PRIVATE_KEY;
    
    if (!serviceAccount || !rawPrivateKey) {
        throw new Error('Missing required Google credentials in environment variables');
    }

    const formattedKey = formatPrivateKey(rawPrivateKey);
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

        // Hash the password before storing it
        const hashedPassword = await bcrypt.hash(password, 10);

        console.log("Before adding row to the sheet");
        const newRow = await sheet.addRow({
            id: Date.now().toString(),
            name,
            email,
            password: hashedPassword,
        });
        console.log("After adding row to the sheet", newRow);

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