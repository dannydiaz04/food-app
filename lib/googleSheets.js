import { GoogleSpreadsheet } from 'google-spreadsheet';
import { JWT } from 'google-auth-library';

const SCOPES = [
  'https://www.googleapis.com/auth/spreadsheets',
];

async function getAuthenticatedDoc() {
  const jwt = new JWT({
    email: process.env.GOOGLE_CLIENT_EMAIL,
    key: process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, '\n'),
    scopes: SCOPES,
  });

  const doc = new GoogleSpreadsheet(process.env.GOOGLE_SHEET_ID, jwt);
  await doc.loadInfo();
  return doc;
}

// Users Sheet Operations
export async function getUserByEmail(email) {
  const doc = await getAuthenticatedDoc();
  const sheet = doc.sheetsByTitle[process.env.GOOGLE_USERS_SHEET_NAME];
  await sheet.loadCells();
  
  const rows = await sheet.getRows();
  return rows.find(row => row.email === email);
}

export async function createUser(userData) {
  const doc = await getAuthenticatedDoc();
  const sheet = doc.sheetsByTitle[process.env.GOOGLE_USERS_SHEET_NAME];
  
  return await sheet.addRow({
    email: userData.email,
    name: userData.name,
    createdAt: new Date().toISOString(),
  });
}

// Food Diary Operations
export async function addFoodEntry(userId, foodData) {
  const doc = await getAuthenticatedDoc();
  const sheet = doc.sheetsByTitle[process.env.GOOGLE_FOOD_DIARY_SHEET_NAME];
  
  return await sheet.addRow({
    userId,
    food: foodData.name,
    calories: foodData.calories,
    date: new Date().toISOString(),
    // Add other food-related fields as needed
  });
}

export async function getFoodEntries(userId) {
  const doc = await getAuthenticatedDoc();
  const sheet = doc.sheetsByTitle[process.env.GOOGLE_FOOD_DIARY_SHEET_NAME];
  
  const rows = await sheet.getRows();
  return rows.filter(row => row.userId === userId);
}
