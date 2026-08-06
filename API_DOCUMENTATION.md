# tinynote REST API Documentation

The **tinynote REST API** provides endpoints for managing daily gratitude entries, user-scoped reflections, and Google Sheets integrations.

---

## Base URL

> ⚠️ **IMPORTANT FOR EXTERNAL INTEGRATIONS (Google Sheets, Telegram, Vercel):**
> - **Public API Base URL (Use this in Google Apps Script):** `https://ais-pre-ymht2q3d2aro4a7b6ggddj-497332855555.asia-east1.run.app`
> - **Private Dev URL (`ais-dev-`):** Do NOT use `ais-dev-` in Google Apps Script because it requires browser login and will return HTML (`<!doctype html>`). Always use `ais-pre-` for external API calls!

---

## Authentication & User Scoping

All endpoints support multi-user isolation. To scope requests to a specific user (such as a Telegram user or custom client ID), pass the user identifier in one of the following ways:

1. **HTTP Header (Recommended):** `X-User-Id: tg_123456789`
2. **Query Parameter:** `?userId=tg_123456789`
3. **JSON Request Body:** `{"userId": "tg_123456789", ...}`

*Note: If no user ID is provided, requests default to `guest_user`.*

---

## API Endpoints

### 1. Get All Reflections (Map Format)

Retrieves all recorded entries for a user formatted as a key-value object indexed by day number.

- **Method:** `GET`
- **Path:** `/api/entries`
- **Headers:** `X-User-Id: <user_id>` (optional)

#### Request Example
```bash
curl -H "X-User-Id: tg_123456789" https://<your-app-domain>/api/entries
```

#### Response Example (`200 OK`)
```json
{
  "success": true,
  "userId": "tg_123456789",
  "count": 2,
  "entries": {
    "1": {
      "id": "day-1",
      "dayNumber": 1,
      "text": "A calm morning espresso with quiet golden sunlight.",
      "gradientId": "sunset",
      "createdAt": 1772345600000,
      "dateString": "July 1, 2026"
    },
    "15": {
      "id": "day-15",
      "dayNumber": 15,
      "text": "Deep focus flow in work.",
      "gradientId": "violet",
      "createdAt": 1773554400000,
      "dateString": "July 15, 2026"
    }
  }
}
```

---

### 2. Get All Reflections (Flat Array for Google Sheets / CSV)

Retrieves all recorded entries for a user as a flat array sorted chronologically by day number. Ideal for Google Sheets (`IMPORTDATA`, `IMPORTJSON`), Excel, or mobile analytics.

- **Method:** `GET`
- **Path:** `/api/entries/list`
- **Query Params:** `?userId=<user_id>` (optional)

#### Request Example
```bash
curl "https://<your-app-domain>/api/entries/list?userId=tg_123456789"
```

#### Response Example (`200 OK`)
```json
[
  {
    "id": "day-1",
    "dayNumber": 1,
    "text": "A calm morning espresso with quiet golden sunlight.",
    "gradientId": "sunset",
    "createdAt": 1772345600000,
    "dateString": "July 1, 2026"
  },
  {
    "id": "day-15",
    "dayNumber": 15,
    "text": "Deep focus flow in work.",
    "gradientId": "violet",
    "createdAt": 1773554400000,
    "dateString": "July 15, 2026"
  }
]
```

---

### 3. Create or Update Reflection

Saves or updates a gratitude entry for a specific day.

- **Method:** `POST`
- **Path:** `/api/entries`
- **Headers:** `Content-Type: application/json`, `X-User-Id: <user_id>`
- **Request Body:**
  ```json
  {
    "dayNumber": 15,
    "text": "Finished reading an inspiring chapter on design.",
    "gradientId": "emerald",
    "dateString": "July 15, 2026"
  }
  ```

#### Response Example (`200 OK`)
```json
{
  "success": true,
  "userId": "tg_123456789",
  "entry": {
    "id": "day-15",
    "dayNumber": 15,
    "text": "Finished reading an inspiring chapter on design.",
    "gradientId": "emerald",
    "createdAt": 1773554400000,
    "dateString": "July 15, 2026"
  },
  "entries": { ... }
}
```

---

### 4. Delete Reflection

Removes a gratitude entry for a specific day.

- **Method:** `DELETE`
- **Path:** `/api/entries/:dayNumber`
- **Headers:** `X-User-Id: <user_id>`

#### Request Example
```bash
curl -X DELETE -H "X-User-Id: tg_123456789" https://<your-app-domain>/api/entries/15
```

#### Response Example (`200 OK`)
```json
{
  "success": true,
  "userId": "tg_123456789",
  "entries": { ... }
}
```

---

### 5. Load Demo Sample Data

Fills the user's current month with sample gratitude entries.

- **Method:** `POST`
- **Path:** `/api/entries/demo`
- **Headers:** `Content-Type: application/json`, `X-User-Id: <user_id>`
- **Request Body:**
  ```json
  {
    "entries": { ... }
  }
  ```

---

### 6. Reset Month Data

Clears all entries for the user.

- **Method:** `POST`
- **Path:** `/api/entries/reset`
- **Headers:** `X-User-Id: <user_id>`

---

### 7. Get All Entries Across All Users (For Sheet Global Sync)

Retrieves all recorded entries across all users in a single array.

- **Method:** `GET`
- **Path:** `/api/entries/all`

#### Response Example (`200 OK`)
```json
{
  "success": true,
  "count": 2,
  "entries": [
    {
      "userId": "tg_8839781890",
      "id": "day-1",
      "dayNumber": 1,
      "text": "Morning coffee",
      "gradientId": "sunset",
      "createdAt": 1772345600000,
      "dateString": "July 1, 2026"
    }
  ]
}
```

---

## Google Sheets Integration Examples

### Method A: Sync All Entries to "Entries" Sheet
```javascript
function syncApiEntriesToSheet() {
  // Use your production Vercel URL
  var url = "https://tinynote-mu.vercel.app/api/entries/all";
  
  var options = {
    method: "get",
    headers: {
      "Accept": "application/json"
    },
    muteHttpExceptions: true
  };
  
  var response = UrlFetchApp.fetch(url, options);
  var responseText = response.getContentText();
  
  if (responseText.trim().indexOf("<!doctype") === 0 || responseText.trim().indexOf("<html") === 0) {
    Logger.log("⚠️ Received HTML instead of JSON. Make sure Vercel is deployed with api/index.ts and vercel.json!");
    return;
  }
  
  var json = JSON.parse(responseText);
  if (!json.success || !json.entries) {
    Logger.log("No entries found or API error: " + responseText);
    return;
  }
  
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName("Entries") || ss.insertSheet("Entries");
  sheet.clear();
  sheet.appendRow(["User ID", "Day Number", "Date", "Reflection", "Color Theme", "Created At"]);
  sheet.getRange("1:1").setFontWeight("bold").setBackground("#F3F4F6");
  
  json.entries.forEach(function(item) {
    sheet.appendRow([
      item.userId || "N/A",
      item.dayNumber || "N/A",
      item.dateString || "N/A",
      item.text || "",
      item.gradientId || "sunset",
      item.createdAt ? new Date(item.createdAt).toISOString() : new Date().toISOString()
    ]);
  });
  
  Logger.log("✅ Successfully synced " + json.entries.length + " entries!");
}
```

