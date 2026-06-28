# Grocery Cost Splitter (Splittr)

A private household expense-splitting app for tracking grocery purchases, splitting costs among three people, and calculating who owes whom — with full pairwise breakdowns and receipt upload via AI parsing.

Built with **Next.js 16**, **React 19**, **MongoDB**, and **Tailwind CSS 4**.

---

## Overview

Splittr helps a household (Kabirul, Shubhangi, and Raunak) track monthly grocery spending. Each item records:

- What was bought, how much it cost, and when
- Which category it belongs to
- Who participated in the split
- Who paid for it

The app computes per-person balances and detailed pairwise debts so everyone knows exactly who should pay whom.

---

## Features

### Entries (`/`)

- View and edit grocery items for the **selected month**
- Month selector defaults to the **current calendar month**
- Filter by item name, category, or who paid
- Inline add / edit / delete with participant checkboxes
- Per-row share columns for each person
- Settlement pills in the header show net “who pays whom” for the month

### Upload (`/upload`)

- Upload grocery receipts (PDF, JPG, or PNG — up to 10 MB)
- AI extracts line items, prices, categories, and purchase date via OpenRouter
- Review parsed items before importing
- Set default paid-by and participants for the batch

### Summary (`/summary`)

- Monthly overview with:
  - **Who pays whom** — net settlement for each pair
  - **Balances** — total paid, total share, and net per person
  - **Pairwise breakdown** — gross debts both ways, item-level detail, and net settlement for every pair
  - **Spending by category** — per-person category breakdown

### Authentication

- Password-protected site with JWT bearer tokens (30-day expiry)
- All API routes require authentication except `/api/auth/login`
- Receipt parse route validates auth in the route handler (large uploads bypass middleware body limits)
- `robots.txt` and meta tags prevent search engine indexing

---

## People & categories

Configured in `app/lib/config.ts`:


| People               | Kabirul, Shubhangi, Raunak |
| -------------------- | -------------------------- |
| Default paid-by      | Raunak                     |
| Default participants | All three                  |


**Categories:** Essentials/spreads, Snacks, Sweet/Icecream, Eggs, Dairy, Vegetables, Meat, Rice

To change people or categories, edit `app/lib/config.ts` and redeploy.

---

## How calculations work

All calculation logic lives in `app/lib/calculations.ts`.

### Share per item

For each grocery item:

```
split ways = number of checked participants (minimum 1)
person's share = price ÷ split ways   (if that person is checked)
```

Example: a ₹300 item split among Kabirul and Raunak → each owes ₹150.

### Per-person balance

For a given month:

```
total share = sum of that person's shares across all items
total paid  = sum of item prices where paidBy = that person
balance     = total paid − total share
```


| Balance  | Meaning         |
| -------- | --------------- |
| Positive | Gets money back |
| Negative | Owes money      |
| ~zero    | Settled         |


### Pairwise (gross) debt

For each pair of people (A, B):

```
A owes B = sum of A's shares on items B paid for (where A participated)
B owes A = sum of B's shares on items A paid for (where B participated)
```

Every contributing item is listed with date, name, price, and share.

### Net settlement per pair

```
net = (A owes B) − (B owes A)
```


| Net       | Result                    |
| --------- | ------------------------- |
| > ₹0.01   | A pays B the net amount   |
| < −₹0.01  | B pays A the net amount   |
| otherwise | Settled between that pair |


### Who pays whom (summary)

The settlements list is the set of all non-zero net pairwise settlements, sorted by amount descending. These also appear as pills in the page header.

**Important:** Pairwise net settlements show direct debts between each pair. They are not simplified through a third person. For example, if Kabirul net-owes Raunak ₹804.25 from shared items, that line appears even when both have positive overall balances (because Shubhangi owes them separately).

---

## Month selection

- Defaults to the **current month** on first load
- The month picker always includes the selected month, even if it has no data yet
- Empty months show “no items” — not a redirect to the latest month with data
- Grocery items are fetched **per month**: `GET /api/grocery?month=YYYY-MM`
- Month list for the picker comes from `GET /api/summary` (months that have at least one item)

---

## Tech stack


| Layer           | Technology                            |
| --------------- | ------------------------------------- |
| Framework       | Next.js 16 (App Router, Turbopack)    |
| UI              | React 19, Tailwind CSS 4              |
| Database        | MongoDB                               |
| Auth            | JWT via `jose`, site password         |
| Receipt parsing | OpenRouter LLM + `pdf-parse` for PDFs |
| Deployment      | Vercel                                |


---

## Project structure

```
app/
├── page.tsx                 # Entries page
├── summary/page.tsx         # Summary page
├── upload/page.tsx          # Receipt upload
├── login/page.tsx           # Login
├── api/
│   ├── auth/login/          # POST — get JWT
│   ├── grocery/             # GET (with ?month=), POST
│   ├── grocery/[id]/        # GET, PATCH, DELETE
│   ├── summary/             # GET — all month summaries
│   ├── summary/[monthKey]/  # GET — one month detail
│   ├── categories/          # GET — all categories
│   └── receipt/
│       ├── parse/           # POST — parse receipt file
│       └── import/          # POST — bulk import items
├── components/              # UI components
├── context/
│   ├── GroceryContext.tsx   # Items, summaries, CRUD
│   └── MonthSelectionContext.tsx
├── hooks/
│   └── useMonthSelection.ts
└── lib/
    ├── calculations.ts      # Share, balance, pairwise logic
    ├── config.ts            # People, categories, defaults
    ├── grouping.ts          # Month grouping and summaries
    ├── summary.ts           # Detailed month summary
    ├── grocery-service.ts   # MongoDB operations
    ├── receipt-parser.ts    # Receipt → structured items
    └── ...
middleware.ts                # API auth guard
```

---

## Environment variables

Create `.env.local` in the project root:

```bash
# MongoDB
MONGODB_URI=mongodb+srv://...
MONGODB_DB_NAME=splittr
MONGODB_COLLECTION=grocery_items

# Site auth
SITE_PASSWORD=your-shared-password
JWT_SECRET=your-random-secret-at-least-32-chars

# OpenRouter (receipt parsing)
OPENROUTER_API_KEY={{api_key}}
OPENROUTER_API_URL=https://openrouter.ai/api/v1/chat/completions
OPENROUTER_MODEL={{model}}
OPENROUTER_TEMPERATURE=0
OPENROUTER_APP_TITLE={{app_title}}
APP_URL={{url}}
```


| Variable                 | Required   | Purpose                         |
| ------------------------ | ---------- | ------------------------------- |
| `MONGODB_URI`            | Yes        | MongoDB connection string       |
| `MONGODB_DB_NAME`        | Yes        | Database name                   |
| `MONGODB_COLLECTION`     | Yes        | Collection for grocery items    |
| `SITE_PASSWORD`          | Yes        | Shared login password           |
| `JWT_SECRET`             | Yes        | Signs JWT tokens                |
| `OPENROUTER_API_KEY`     | For upload | Receipt AI parsing              |
| `OPENROUTER_API_URL`     | For upload | OpenRouter API endpoint         |
| `OPENROUTER_MODEL`       | For upload | Model used for extraction       |
| `OPENROUTER_TEMPERATURE` | For upload | LLM temperature (0 recommended) |
| `OPENROUTER_APP_TITLE`   | For upload | App name sent to OpenRouter     |
| `APP_URL`                | For upload | App URL sent to OpenRouter      |


---

## Getting started

### Prerequisites

- Node.js 20+
- Yarn (or npm)
- MongoDB instance (local or Atlas)
- OpenRouter API key (only needed for receipt upload)

### Install and run

```bash
yarn install
# Create .env.local with the variables listed below
yarn dev
```

Open [http://localhost:3000](http://localhost:3000) and log in with `SITE_PASSWORD`.

### Build for production

```bash
yarn build
yarn start
```

### Lint

```bash
yarn lint
```

---

## API reference

All endpoints except `POST /api/auth/login` require:

```
Authorization: Bearer <jwt-token>
```

### Auth


| Method | Path              | Body                    | Response             |
| ------ | ----------------- | ----------------------- | -------------------- |
| `POST` | `/api/auth/login` | `{ "password": "..." }` | `{ "token": "..." }` |


### Grocery items


| Method   | Path                         | Notes                             |
| -------- | ---------------------------- | --------------------------------- |
| `GET`    | `/api/grocery?month=YYYY-MM` | Items for one month               |
| `POST`   | `/api/grocery`               | Create item `{ "item": { ... } }` |
| `GET`    | `/api/grocery/:id`           | Single item                       |
| `PATCH`  | `/api/grocery/:id`           | Update item                       |
| `DELETE` | `/api/grocery/:id`           | Delete item                       |


**Item shape:**

```json
{
  "purchaseDate": "2026-06-15T00:00:00.000Z",
  "item": "Amul Milk",
  "category": "Dairy",
  "price": 130,
  "participants": { "Kabirul": true, "Shubhangi": true, "Raunak": true },
  "paidBy": "Raunak"
}
```

### Summary


| Method | Path                     | Response                                                 |
| ------ | ------------------------ | -------------------------------------------------------- |
| `GET`  | `/api/summary`           | `{ "summaries": [...] }` — one entry per month with data |
| `GET`  | `/api/summary/:monthKey` | `{ "summary": { ... } }` — detail for `YYYY-MM`          |


Each summary includes `summaries` (balances), `settlements` (net pairwise), and `pairwise` (full gross + item detail).

### Categories


| Method | Path              | Response                           |
| ------ | ----------------- | ---------------------------------- |
| `GET`  | `/api/categories` | `{ "categories": ["Dairy", ...] }` |


### Receipts


| Method | Path                  | Body                              | Response                                           |
| ------ | --------------------- | --------------------------------- | -------------------------------------------------- |
| `POST` | `/api/receipt/parse`  | `multipart/form-data` with `file` | `{ "result": { purchaseDate, storeName, lines } }` |
| `POST` | `/api/receipt/import` | `{ "items": [...] }`              | `{ "items": [...] }`                               |


Supported receipt formats: **PDF, JPG, PNG** (max 10 MB).

---

## Deployment (Vercel)

1. Push to GitHub and import the repo in Vercel
2. Add all environment variables from the table above
3. Deploy

`vercel.json` configures the receipt parse function with 60s timeout and 1024 MB memory. `next.config.ts` sets `proxyClientMaxBodySize` to 12 MB for large receipt uploads.

---

## Data model

Each document in MongoDB represents one grocery item:


| Field          | Type                      | Description                      |
| -------------- | ------------------------- | -------------------------------- |
| `purchaseDate` | ISO string (UTC midnight) | When the item was bought         |
| `item`         | string                    | Product name                     |
| `category`     | string                    | One of the configured categories |
| `price`        | number                    | Total line price in INR          |
| `participants` | `{ [person]: boolean }`   | Who shares this cost             |
| `paidBy`       | string                    | Who paid for it                  |


MongoDB `_id` is exposed as `id` in the API.

---

## Security notes

- The app is intended as a **private household tool**, not a multi-tenant SaaS
- Single shared password; no per-user accounts
- JWT tokens stored in `localStorage` on the client
- All pages and APIs send `X-Robots-Tag: noindex` headers
- Do not commit `.env.local` or expose `SITE_PASSWORD` / `JWT_SECRET`

---

## License

Private project — not licensed for public redistribution.

## Caution ⚠️

Very high AI Slop content - very less verified code 