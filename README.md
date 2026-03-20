# Luminary — Your Love Story, Beautifully Told

> A Progressive Web App for couples to create, relive, and share their journey together — from the first meeting to every milestone — with cinematic animations, AI-enhanced narratives, and three handcrafted themes.

---

## ✨ Features at a Glance

| Feature | Description |
|---|---|
| 🎨 **3 Themes** | Blush Romance · Golden Hour · Velvet Night — each with its own font, palette, and particles |
| 🤖 **AI Narratives** | Gemini transforms raw memories into poetic prose |
| 📸 **Photo Uploads** | One photo per moment, compressed to WebP via Sharp, stored on Vercel Blob |
| 🗺️ **3 Timeline Layouts** | Editorial · Story · Chapters — switch live |
| 🔄 **Live Theme Switching** | Change theme on the journey page anytime, saved per-device |
| 🃏 **Share Card** | Beautiful downloadable PNG card with QR code, matches active theme |
| 📱 **PWA** | Installable on mobile, works offline for cached content |
| 🔐 **Access Codes** | Each couple gets a private access code |
| ✨ **Particle Animations** | Hearts · Petals · Stars — unique per theme |
| ✏️ **Edit Page** | Add, edit, or delete memories after publishing |

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- MongoDB (Atlas free tier: [cloud.mongodb.com](https://cloud.mongodb.com))
- Gemini API key ([aistudio.google.com](https://aistudio.google.com))
- Vercel Blob store (for photo uploads — free on Vercel Hobby plan)

### 1. Install dependencies
```bash
npm install
```

### 2. Configure environment
Create `.env.local` in the project root:
```env
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/luminary
GEMINI_API_KEY=your_gemini_api_key_here
NEXT_PUBLIC_APP_URL=http://localhost:8080
BLOB_READ_WRITE_TOKEN=your_vercel_blob_token_here
```

> **Vercel Blob token:** Go to Vercel Dashboard → Storage → Create a Blob Store → connect it to your project. The token is added automatically as an environment variable.

> **MongoDB Atlas:** Make sure to whitelist `0.0.0.0/0` under Network Access so Vercel's dynamic IPs can connect.

### 3. Run development server
```bash
npm run dev
# → http://localhost:8080
```

### 4. Build for production
```bash
npm run build
npm start
```

> **Note:** The QR code on share cards uses `window.location.origin` — it automatically reflects your deployed domain in production.

---

## 🗺️ How It Works

### Step 1 — Entry Screen (`/`)

Enter your couple's access code to open the journey, or start a new story. If you already have a story, type your code and click **Edit your memories** to go directly to the edit page.

### Step 2 — Setup Wizard (`/setup`)

A 4-step guided wizard:

1. **Names & Date** — Enter both partners' names, relationship start date, and optional bio
2. **Choose a Theme** — Pick the visual mood for your timeline
3. **Access Code** — Pick a unique code to share with your partner
4. **Add Memories** — Add milestone moments with descriptions, optional photos, and AI enhancement

**Quick-add category bubbles** (pre-select the category before opening the form):

| Category | |
|---|---|
| ✨ First Meeting | 💬 First Real Conversation |
| 🌿 First Walk Together | 💕 Knowing the Feeling |
| 💍 The Proposal | 💋 First Kiss |
| 🌹 First Official Date | 🌧️ First Fight |
| ⭐ Custom Moment | |

Each memory supports:
- Date picker
- Description (up to 1000 chars)
- **✦ Enhance with AI** — Gemini rewrites it as a poetic narrative
- Optional photo upload (JPEG / PNG / WebP / GIF — auto-compressed to WebP at quality 88)

### Step 3 — Success Page (`/setup/success`)

After publishing, a celebration screen shows:
- Animated checkmark reveal
- Your access code (prominently displayed)
- The share card preview + download button
- Direct link to your journey

### Step 4 — Journey Page (`/journey/[code]`)

The viewer experience:

**Hero section** — couple names, start date, days-together counter, bio, and memory count.

**3 timeline layouts** (switch anytime via the pill selector):

| Layout | Description |
|---|---|
| ✦ **Editorial** | Clean full-width text reveals with numbered chapters, alternating photo placement, scroll-triggered animations |
| ◎ **Story** | Sticky split-panel scrollytelling — photo locks on one side while narrative scrolls |
| ◗ **Chapters** | Memories grouped by year with animated chapter headers |

**Bottom-right floating controls:**
- 🎨 **Theme Switcher** — change between Blush, Golden, Velvet live (saved to localStorage per couple)
- **Share** icon — opens the share card modal

### Step 5 — Edit Page (`/edit/[code]`)

Edit your story after it's published:
- View all existing memories in a card list
- **Edit** any memory inline (same form as setup — with AI enhance and photo upload)
- **Delete** any memory
- **Add** new memories with the same quick-add category bubbles
- Changes are saved to the database immediately — no publish step needed
- Access via the entry screen (type your code → click "Edit your memories") or navigate directly

---

## 🎨 Themes

Each theme has its own font, colour palette, particle system, and CSS variable set.

### 🌸 Blush Romance
- **Font:** Cormorant Garamond (elegant serif)
- **Palette:** Rose pinks, soft lavender, warm whites
- **Particles:** Floating hearts (3 depth layers with scroll parallax)
- **Feel:** Tender, romantic, soft

### ✨ Golden Hour
- **Font:** Playfair Display (classic editorial serif)
- **Palette:** Warm amber, golden yellows, cream
- **Particles:** Falling petals with golden sparkles
- **Feel:** Warm, nostalgic, luminous

### 🌙 Velvet Night
- **Font:** Cinzel (dramatic Roman caps)
- **Palette:** Midnight black, deep purple, silver
- **Particles:** Twinkling stars + shooting stars
- **Feel:** Dramatic, intimate, celestial

Theme fonts apply to all memory descriptions and display text — raw and poetic alike.

---

## 🃏 Share Card

Accessible via the share button on the journey page or the success page after setup.

**Card contents:**
- Couple names & start date
- Bio (if set)
- Stats: days together · duration · memory count
- QR code linking directly to the journey (URL is dynamic — reflects your deployed domain)

**Download:** Captures the exact rendered preview as a high-resolution PNG (3× pixel ratio) using `html-to-image`. The downloaded image is a pixel-perfect snapshot of the preview — same layout, colours, and border radius.

The card automatically matches the currently active theme.

---

## 📁 Project Structure

```
src/
├── app/
│   ├── page.tsx                    # Entry screen — access code input
│   ├── layout.tsx                  # Root layout + fonts
│   ├── setup/
│   │   ├── page.tsx                # Setup wizard
│   │   └── success/
│   │       ├── page.tsx            # Success server component
│   │       └── SuccessClient.tsx   # Success page client
│   ├── journey/[code]/
│   │   └── page.tsx                # Journey page (server + client)
│   ├── edit/[code]/
│   │   ├── page.tsx                # Edit page server component
│   │   └── EditClient.tsx          # Edit page client — add/edit/delete memories
│   └── api/
│       ├── auth/route.ts           # Access code validation
│       ├── couple/route.ts         # Create couple + moments
│       ├── couple/[code]/route.ts  # Fetch couple + moments by code
│       ├── moment/route.ts         # Add a single moment to existing couple
│       ├── moment/[id]/route.ts    # Edit or delete a single moment
│       ├── enhance/route.ts        # Gemini AI narrative enhancement
│       ├── qr/route.ts             # QR code PNG generation
│       └── upload/route.ts         # Photo upload → Vercel Blob (with Sharp compression)
├── components/
│   ├── entry/
│   │   └── EntryScreen.tsx         # Home page code input
│   ├── setup/
│   │   ├── SetupWizard.tsx         # 4-step wizard orchestrator
│   │   ├── MomentForm.tsx          # Add/edit memory form (reused in edit page)
│   │   └── steps/
│   │       ├── Step1Names.tsx      # Names + date + bio
│   │       ├── Step2Theme.tsx      # Theme picker
│   │       ├── Step3Code.tsx       # Access code picker
│   │       └── Step4Moments.tsx    # Memory list + quick-add
│   ├── journey/
│   │   ├── JourneyHero.tsx         # Hero banner
│   │   ├── Timeline.tsx            # Layout switcher + rendering
│   │   ├── TimelineNode.tsx        # Single editorial memory card
│   │   ├── LayoutPicker.tsx        # Editorial/Story/Chapters pill
│   │   ├── ParticleField.tsx       # Theme-specific particles
│   │   └── layouts/
│   │       ├── EditorialLayout.tsx # Editorial layout
│   │       ├── StoryLayout.tsx     # Story (sticky) layout
│   │       └── ChaptersLayout.tsx  # Chapters (by year) layout
│   └── shared/
│       ├── ThemeProvider.tsx       # Applies CSS vars via data-theme
│       ├── ThemeSwitcher.tsx       # Live theme switcher + share modal
│       ├── ShareCard.tsx           # Share card preview + download
│       └── ParallaxBlob.tsx        # Ambient background blobs
├── lib/
│   ├── mongodb.ts                  # MongoDB connection
│   ├── gemini.ts                   # Gemini AI client
│   ├── themes.ts                   # Theme definitions + CSS vars
│   ├── categories.ts               # Moment category definitions
│   └── utils.ts                    # Date helpers
├── models/
│   ├── Couple.ts                   # Mongoose couple schema
│   └── Moment.ts                   # Mongoose moment schema
└── types/
    └── index.ts                    # TypeScript interfaces
```

---

## 🔌 API Reference

| Endpoint | Method | Auth | Description |
|---|---|---|---|
| `/api/auth` | `POST` | — | Validate access code → returns couple data |
| `/api/couple` | `POST` | — | Create a new couple + moments |
| `/api/couple/[code]` | `GET` | — | Fetch couple + moments by code |
| `/api/moment` | `POST` | `x-access-code` header | Add a single moment to existing couple |
| `/api/moment/[id]` | `PATCH` | `x-access-code` header | Edit a moment (any field, all optional) |
| `/api/moment/[id]` | `DELETE` | `x-access-code` header | Delete a moment |
| `/api/enhance` | `POST` | — | AI-enhance a memory description via Gemini |
| `/api/upload` | `POST` | — | Upload a photo → returns Vercel Blob URL |
| `/api/qr` | `GET` | — | Generate QR code PNG for a given `?url=` |

**Auth header:** `x-access-code: your-code` — the couple's access code. The API verifies the moment belongs to that couple before allowing edits or deletes.

---

## 📦 Key Dependencies

| Package | Purpose |
|---|---|
| `next` 14 | App Router, server components, API routes |
| `framer-motion` | Scroll animations, spring physics, layout animations |
| `mongoose` | MongoDB ODM |
| `@google/generative-ai` | Gemini AI for narrative enhancement |
| `@vercel/blob` | Cloud photo storage (CDN-backed, free tier) |
| `sharp` | Server-side image compression → WebP at quality 88 |
| `html-to-image` | Pixel-perfect PNG snapshot of the share card |
| `qrcode` | Server-side QR code generation |
| `react-hot-toast` | Toast notifications |
| `uuid` | Unique IDs for draft moments |
| `@ducanh2912/next-pwa` | PWA service worker + manifest |

---

## 📱 PWA Setup

Place these files in `public/icons/`:
- `icon-192.png` — 192×192 px
- `icon-512.png` — 512×512 px
- `apple-touch-icon.png` — 180×180 px

The app is installable on iOS and Android from the browser's "Add to Home Screen" prompt.

---

## 🗄️ Data Models

### Couple
```ts
{
  partner1Name: string
  partner2Name: string
  startDate:    string        // ISO date
  bio?:         string
  accessCode:   string        // unique
  theme:        "blush" | "golden" | "velvet"
  coverPhotoPath?: string
  createdAt:    Date
}
```

### Moment
```ts
{
  coupleId:         ObjectId
  category:         "first_meeting" | "first_conversation" | "first_walk" |
                    "knowing_feelings" | "proposal" | "first_kiss" |
                    "first_date" | "first_fight" | "custom"
  customLabel?:     string      // used when category = "custom"
  date:             string      // ISO date
  rawDescription:   string      // user's original text
  poeticNarrative?: string      // AI-enhanced version
  photoPath?:       string      // Vercel Blob CDN URL
  photoAlt?:        string
  order:            number
}
```

---

## 🔒 Environment Variables

| Variable | Required | Description |
|---|---|---|
| `MONGODB_URI` | ✅ | MongoDB connection string |
| `GEMINI_API_KEY` | ✅ | Google AI Studio API key |
| `NEXT_PUBLIC_APP_URL` | ✅ | Base URL (used for internal references) |
| `BLOB_READ_WRITE_TOKEN` | ✅ | Vercel Blob token for photo uploads |
