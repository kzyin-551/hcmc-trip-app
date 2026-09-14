const { google } = require("googleapis");

// One place to hold the Sheet schema. If you rename columns in your
// Google Sheet, update the values on the right — nothing else needs to change.
const PLACES_TAB = "Places";
const PLACES_COLUMNS = [
  "id",         // A - unique id, e.g. p1, p2...
  "name",       // B
  "area",       // C - e.g. "District 1"
  "category",   // D - Food / Drink / Cafe / Dessert / Massage / Shopping
  "tier",       // E - "must-do" / "best-effort"
  "visited",    // F - TRUE / FALSE
  "instagram",  // G - IG handle or website URL
  "price",      // H - free text, e.g. "~80,000 VND"
  "notes"       // I - free text
];

const PLANS_TAB = "DayPlans";
const PLANS_COLUMNS = [
  "day",       // A - 1-6
  "meal",      // B - breakfast / lunch / dinner
  "place_id",  // C - references Places.id
  "locked"     // D - TRUE / FALSE
];

function getAuth() {
  const email = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
  const key = (process.env.GOOGLE_PRIVATE_KEY || "").replace(/\\n/g, "\n");
  if (!email || !key) {
    throw new Error("Missing GOOGLE_SERVICE_ACCOUNT_EMAIL or GOOGLE_PRIVATE_KEY env vars");
  }
  return new google.auth.JWT(email, null, key, [
    "https://www.googleapis.com/auth/spreadsheets"
  ]);
}

function getSheetId() {
  const id = process.env.GOOGLE_SHEET_ID;
  if (!id) throw new Error("Missing GOOGLE_SHEET_ID env var");
  return id;
}

function rowsToObjects(rows, columns) {
  return rows.map((row) => {
    const obj = {};
    columns.forEach((col, i) => {
      obj[col] = row[i] !== undefined ? row[i] : "";
    });
    return obj;
  });
}

async function getSheetsClient() {
  const auth = getAuth();
  await auth.authorize();
  return google.sheets({ version: "v4", auth });
}

async function readTab(tabName, columns) {
  const sheets = await getSheetsClient();
  const range = `${tabName}!A2:${String.fromCharCode(64 + columns.length)}`;
  const res = await sheets.spreadsheets.values.get({
    spreadsheetId: getSheetId(),
    range
  });
  const rows = res.data.values || [];
  return rowsToObjects(rows, columns);
}

// Finds the 1-indexed sheet row number (including header) for a place by id.
async function findRowIndex(tabName, idColumnLetter, idValue) {
  const sheets = await getSheetsClient();
  const res = await sheets.spreadsheets.values.get({
    spreadsheetId: getSheetId(),
    range: `${tabName}!${idColumnLetter}2:${idColumnLetter}`
  });
  const rows = res.data.values || [];
  const idx = rows.findIndex((r) => r[0] === idValue);
  return idx === -1 ? -1 : idx + 2; // +2: skip header row, convert to 1-indexed
}

async function updateCell(tabName, cellRef, value) {
  const sheets = await getSheetsClient();
  await sheets.spreadsheets.values.update({
    spreadsheetId: getSheetId(),
    range: `${tabName}!${cellRef}`,
    valueInputOption: "RAW",
    requestBody: { values: [[value]] }
  });
}

// Appends a new DayPlans row (used when locking a meal for the first time).
async function appendRow(tabName, columns, obj) {
  const sheets = await getSheetsClient();
  const row = columns.map((c) => obj[c] !== undefined ? obj[c] : "");
  await sheets.spreadsheets.values.append({
    spreadsheetId: getSheetId(),
    range: `${tabName}!A1`,
    valueInputOption: "RAW",
    insertDataOption: "INSERT_ROWS",
    requestBody: { values: [row] }
  });
}

module.exports = {
  PLACES_TAB, PLACES_COLUMNS,
  PLANS_TAB, PLANS_COLUMNS,
  readTab, findRowIndex, updateCell, appendRow
};
