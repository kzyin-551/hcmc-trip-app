# HCMC Trip App

Reads and writes to a Google Sheet as its live database. No separate database needed.

## 1. Set up your Google Sheet

Create a Sheet with two tabs, headers in row 1 exactly as below (order matters):

**Tab: `Places`**
| id | name | area | category | tier | visited | instagram | price | notes |
|----|------|------|----------|------|---------|-----------|-------|-------|
| p1 | Pho Hoa Pasteur | District 1 | Food | must-do | FALSE | @phohoapasteur | ~80,000 VND | Get there before 12 |

- `category`: Food / Drink / Cafe / Dessert / Massage / Shopping
- `tier`: must-do / best-effort
- `visited`: TRUE / FALSE

**Tab: `DayPlans`** (leave empty except headers — the app fills this in as you lock meals)
| day | meal | place_id | locked |
|-----|------|----------|--------|

## 2. Create a Google Cloud service account

1. Go to console.cloud.google.com → create a project (or use an existing one)
2. Enable the **Google Sheets API**
3. Go to IAM & Admin → Service Accounts → Create service account
4. Create a key for it (JSON) and download it
5. Open your Google Sheet → Share → paste the service account's email (looks like `xxx@xxx.iam.gserviceaccount.com`) → give it **Editor** access

## 3. Set environment variables

Copy `.env.example` to `.env` locally, or set these in Vercel's dashboard (Settings → Environment Variables):

- `GOOGLE_SERVICE_ACCOUNT_EMAIL` — from the JSON key file (`client_email`)
- `GOOGLE_PRIVATE_KEY` — from the JSON key file (`private_key`) — keep the `\n` characters as-is
- `GOOGLE_SHEET_ID` — the long ID in your sheet's URL: `docs.google.com/spreadsheets/d/THIS_PART/edit`

## 4. Deploy

```
npm install
npx vercel
```

Follow the prompts. Once deployed, Vercel gives you a live URL — bookmark it on your phone.

## How it works

- Every time you open the app, it fetches fresh data from your Sheet — edit the Sheet, refresh the app, see the change.
- Checking "visited" or locking a meal writes back to the Sheet immediately via small serverless functions in `/api`.
- The illustration placeholder in Overview is just a div — swap in your own image by editing `public/index.html` (search for "your illustration goes here").
