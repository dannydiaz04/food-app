import { NextRequest, NextResponse } from "next/server";
import { GoogleSpreadsheet } from 'google-spreadsheet';

// Make sure these exist in your .env.local file
// and are available at runtime on your server:
const {
  GOOGLE_FOOD_SHEET_NAME,
  GOOGLE_FOOD_SHEET_ID,
  GOOGLE_CLIENT_EMAIL,
  GOOGLE_PRIVATE_KEY,
} = process.env;

// Re-use the Sheets client in memory to avoid re-instantiating
let sheetsClient: any;

async function getSheetsClient() {
  if (!sheetsClient) {
    // Service account auth with private key
    const auth = new google.auth.JWT(
      GOOGLE_CLIENT_EMAIL,
      undefined,
      // Replace escaped newlines in private key (common in .env files)
      (GOOGLE_PRIVATE_KEY || "").replace(/\\n/g, "\n"),
      ["https://www.googleapis.com/auth/spreadsheets"] // required scope
    );

    sheetsClient = google.sheets({ version: "v4", auth });
  }
  return sheetsClient;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Initialize the GoogleSpreadsheet instance using your FOOD sheet ID.
    const doc = new GoogleSpreadsheet(process.env.GOOGLE_FOOD_SHEET_ID as string);

    // Use your service account credentials.
    await doc.useServiceAccountAuth({
      client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL as string,
      // Ensure proper formatting of the private key (replace literal \n with actual line breaks)
      private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
    });

    await doc.loadInfo();

    // Get the sheet titled "food" (make sure this sheet exists in your Google Spreadsheet)
    const sheet = doc.sheetsByTitle["food"];
    if (!sheet) {
      throw new Error('Food sheet not found');
    }

    // Prepare the row data.
    const newRow = {
      date: body.date || new Date().toISOString(),
      meal: body.meal,
      foodName: body.foodName || "Custom Entry",
      quantity: body.quantity ? String(body.quantity) : "1",
      unit: body.unit || "serving",
      calories: body.calories,
      carbs: body.carbs,
      fats: body.fats,
      protein: body.protein,
      // Spread any additional micronutrient fields.
      ...body.micronutrients,
    };

    // Add the new row.
    await sheet.addRow(newRow);

    return NextResponse.json({ message: "Food entry added successfully!" });
  } catch (error: any) {
    console.error("Failed to add food entry:", error);
    return NextResponse.json({ error: error.message || "Failed to add food entry" }, { status: 500 });
  }
}