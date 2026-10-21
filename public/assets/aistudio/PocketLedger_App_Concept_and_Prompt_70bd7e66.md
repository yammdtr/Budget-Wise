# PocketLedger: Google Drive-Integrated Budget Tracker

## 1. System Prompt for AI Studio / LLM Prototyping

Copy and paste the system prompt below into Google AI Studio to define the role and functionality of the PocketLedger app logic:

```text
You are PocketLedger, a minimalist, user-first budget tracking assistant that interfaces directly with files stored on the user's personal Google Drive. 

Core App Flow:
1. Quick Entry Interface: The user immediately provides an amount and selects a catalog/category (e.g., Food, Bills, Transportation, Hobbies). An optional brief memo/note can be attached.
2. Google Drive Storage: All transactions are stored in a simple, standardized format (such as a CSV or JSON file) inside the user's personal Google Drive folder (`/PocketLedger/budget_data.csv`).
3. Multi-Catalog Organization: Categorize expenses into standard or custom catalogs:
   - Food & Dining
   - Bills & Utilities
   - Transportation
   - Groceries
   - Hobbies & Entertainment
   - Custom User-Defined Catalogs
4. Data Privacy & Ownership: No external database servers are used. All reading, updating, and history logging happen directly on the user's Google Drive.

Your goal is to parse user inputs (e.g., "Spent 250 on food", "Paid 1500 for electric bill"), format them into standardized ledger rows, track category totals, and confirm sync status with Google Drive.
```

---

## 2. App Design & Architecture Specification

### Overview
**PocketLedger** is a lightweight budget tracking application designed for maximum speed and data privacy. It operates on a local-first model, syncing transaction data directly to a `.csv` or `.json` file in the user's personal Google Drive account.

---

### Core User Interface (The Quick-Log Experience)

1. **Amount Input (Step 1)**
   - Large digital display showing currency/amount.
   - Touch-friendly numerical keypad for fast entry.

2. **Catalog Selection (Step 2)**
   - Single-tap category buttons with distinct visual icons and colors:
     - 🍔 **Food & Dining**
     - 💡 **Bills & Utilities**
     - 🚗 **Transportation**
     - 🛒 **Groceries**
     - 🎮 **Hobbies & Entertainment**
     - ➕ **Custom Category**

3. **Optional Memo & Direct Sync (Step 3)**
   - Optional text field for notes (e.g., "Electricity bill", "Lunch at cafe").
   - **Save & Sync Button**: Sends the entry directly to the designated Google Drive file.

---

### Google Drive Data Schema (`budget_data.csv`)

Every saved entry appends a row to the master budget file stored in Google Drive:

| Date       | Time  | Type    | Amount  | Category        | Memo             | Sync Status |
|------------|-------|---------|---------|-----------------|------------------|-------------|
| 2026-10-21 | 14:40 | Expense | 250.00  | Food & Dining   | Lunch            | Synced      |
| 2026-10-21 | 18:00 | Expense | 1500.00 | Bills & Utilities| Electric Bill   | Synced      |
| 2026-10-22 | 09:15 | Income  | 5000.00 | Freelance       | Web Project Payment| Synced    |

---

### Key Benefits of Google Drive Integration

1. **Full Data Ownership:** No reliance on third-party backend servers or subscription locks.
2. **Spreadsheet Compatibility:** The generated storage file can be opened directly in **Google Sheets** for custom charts, formulas, or exports.
3. **Automatic Versioning & Backup:** Google Drive keeps revision histories, protecting data against accidental deletion or errors.
4. **Offline Caching:** Transactions saved offline queue locally and automatically sync to Google Drive once a connection is restored.