import { NextResponse } from 'next/server'
import { GoogleSpreadsheet } from 'google-spreadsheet'
import { JWT } from 'google-auth-library'
import { getServerSession } from 'next-auth'
import { authOptions } from '../../auth/config/auth'

export async function POST(request: Request) {
  try {
    // Get the authenticated user's session
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { meal, foodName, quantity, unit, calories, carbs, fats, protein } = await request.json()

    // Initialize Google Sheets
    const jwt = new JWT({
      email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL!,
      key: process.env.GOOGLE_PRIVATE_KEY!.replace(/\\n/g, '\n'),
      scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    })

    const doc = new GoogleSpreadsheet(process.env.GOOGLE_SHEET_ID!, jwt)
    await doc.loadInfo()

    const sheet = doc.sheetsByTitle[process.env.GOOGLE_FOOD_DIARY_SHEET_NAME!]

    // Add the food entry with user information
    const newRow = await sheet.addRow({
      id: Date.now().toString(), // Simple unique ID
      userId: session.user.email,
      meal,
      foodName,
      quantity,
      unit,
      calories,
      carbs,
      fats,
      protein,
      date: new Date().toISOString(),
    })

    return NextResponse.json({ success: true, id: newRow.get('id') })
  } catch (error) {
    console.error('Error adding food entry:', error)
    return NextResponse.json({ error: 'Failed to add food entry' }, { status: 500 })
  }
}

// Get user's food entries
export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Initialize Google Sheets
    const jwt = new JWT({
      email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL!,
      key: process.env.GOOGLE_PRIVATE_KEY!.replace(/\\n/g, '\n'),
      scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    })

    const doc = new GoogleSpreadsheet(process.env.GOOGLE_SHEET_ID!, jwt)
    await doc.loadInfo()

    const sheet = doc.sheetsByTitle[process.env.GOOGLE_FOOD_DIARY_SHEET_NAME!]
    const rows = await sheet.getRows()

    // Filter entries for the current user
    const userEntries = rows
      .filter(row => row.get('userId') === session.user.email)
      .map(row => ({
        id: row.get('id'),
        meal: row.get('meal'),
        foodName: row.get('foodName'),
        quantity: row.get('quantity'),
        unit: row.get('unit'),
        calories: row.get('calories'),
        carbs: row.get('carbs'),
        fats: row.get('fats'),
        protein: row.get('protein'),
        date: row.get('date'),
      }))

    return NextResponse.json(userEntries)
  } catch (error) {
    console.error('Error fetching food entries:', error)
    return NextResponse.json({ error: 'Failed to fetch food entries' }, { status: 500 })
  }
}

// Delete a food entry
export async function DELETE(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await request.json()

    const jwt = new JWT({
      email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL!,
      key: process.env.GOOGLE_PRIVATE_KEY!.replace(/\\n/g, '\n'),
      scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    })

    const doc = new GoogleSpreadsheet(process.env.GOOGLE_SHEET_ID!, jwt)
    await doc.loadInfo()

    const sheet = doc.sheetsByTitle[process.env.GOOGLE_FOOD_DIARY_SHEET_NAME!]
    const rows = await sheet.getRows()

    // Find the row and verify it belongs to the user
    const row = rows.find(row => 
      row.get('id') === id && 
      row.get('userId') === session.user.email
    )

    if (!row) {
      return NextResponse.json({ error: 'Entry not found or unauthorized' }, { status: 404 })
    }

    // Delete the row
    await row.delete()

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting food entry:', error)
    return NextResponse.json({ error: 'Failed to delete food entry' }, { status: 500 })
  }
}
