# Chronicles of Change - Project Setup Guide

## Prerequisites

- **Node.js** 18+ (https://nodejs.org)
- **PostgreSQL** 16+ (via Homebrew: `brew install postgresql@16`)
- **Ren'Py** 8.x (https://renpy.org/latest.html)

---

## 1. Clone the Repository

```bash
git clone <your-repo-url>
cd SENG401_FinalProject/rpgfight
```

---

## 2. Set Up PostgreSQL

### Start PostgreSQL

```bash
brew services start postgresql@16
```

### Create the database

```bash
createdb chronicles_of_change
```

Verify it works:

```bash
psql -d chronicles_of_change -c "SELECT 1;"
```

---

## 3. Set Up the Dashboard

```bash
cd dashboard
npm install
```

### Create your `.env` file

```bash
cp .env.example .env
```

Then edit `.env` with your database connection:

```
DATABASE_URL="postgresql://<your-username>@localhost:5432/chronicles_of_change?schema=public"
```

Replace `<your-username>` with your macOS username (run `whoami` to check).

### Generate Prisma client and run migrations

```bash
npx prisma generate
npx prisma migrate deploy
```

### Option A: Seed from scratch (first time only)

If you're starting fresh and want the default Persia campaign:

```bash
npx prisma db seed
```

### Option B: Import from team's exported JSON (recommended for syncing)

If another team member has already configured the campaign:

1. Start the dashboard first: `npm run dev`
2. Open http://localhost:3000/import
3. Upload the `game/config/campaign.json` file from the repo
4. The database will be populated with the imported campaign data

---

## 4. Start the Dashboard

```bash
cd dashboard
npm run dev
```

The dashboard will be available at **http://localhost:3000**.

---

## 5. Run the Game

1. Open the **Ren'Py Launcher**
2. Click "preferences" and set the **Projects Directory** to the folder containing `rpgfight/`
3. Select `rpgfight` from the project list
4. Click **Launch Project**

Or from command line:

```bash
/path/to/renpy.sh /path/to/rpgfight
```

The game will automatically:
1. Try to fetch config from the dashboard at `http://localhost:3000/api/export/1`
2. If the dashboard isn't running, use the cached `game/config/campaign.json`
3. If neither is available, fall back to hardcoded defaults in .rpy files

---

## Keeping the Database in Sync Across the Team

Since each developer runs their own local PostgreSQL, you need a way to share campaign data. Here's the workflow:

### When you make changes:

1. Edit the campaign on the dashboard (http://localhost:3000)
2. Go to the campaign page and click **Download File**
3. Save/move the downloaded `campaign.json` to `game/config/campaign.json`
4. Commit and push:

```bash
git add game/config/campaign.json
git commit -m "Update campaign config"
git push
```

### When a teammate makes changes:

1. Pull the latest changes:

```bash
git pull
```

2. The game will automatically use the updated `game/config/campaign.json` on next launch
3. To also update your local dashboard database:
   - Start the dashboard: `npm run dev`
   - Go to http://localhost:3000/import
   - Upload `game/config/campaign.json`
   - Your local DB is now in sync

### Quick reference

| Action | Command / Step |
|--------|---------------|
| Start PostgreSQL | `brew services start postgresql@16` |
| Start dashboard | `cd dashboard && npm run dev` |
| Reset DB to defaults | `cd dashboard && npx prisma migrate reset` |
| Import campaign JSON | Dashboard > Import Campaign > Upload file |
| Export campaign JSON | Dashboard > Campaign > Download File |
| Run the game | Ren'Py Launcher > rpgfight > Launch |

---

## Troubleshooting

### "Database does not exist"
```bash
createdb chronicles_of_change
```

### "Prisma client not generated"
```bash
cd dashboard && npx prisma generate
```

### "Migrations out of date"
```bash
cd dashboard && npx prisma migrate deploy
```

### Game doesn't load DB data
- Make sure the dashboard is running (`npm run dev` in `dashboard/`)
- Or make sure `game/config/campaign.json` exists and has valid data
- Delete stale compiled files: `find game/ -name "*.rpyc" -delete`
- Check `rpgfight/log.txt` for `[CONFIG]` messages showing load source

### Port 3000 already in use
```bash
lsof -i :3000
# then kill the process or use a different port:
PORT=3001 npm run dev
```
