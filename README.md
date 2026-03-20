# Luminary — Your Love Story, Beautifully Told

A PWA that lets couples create and share their journey together — from first meeting to every milestone — with beautiful animations, AI-enhanced narratives, and 3 elegant themes.

---

## Setup

### 1. Prerequisites
- Node.js 18+ (download from nodejs.org)
- MongoDB (Atlas free tier works: cloud.mongodb.com)
- Gemini API key (aistudio.google.com)

### 2. Install dependencies
```bash
cd luminary
npm install
```

### 3. Configure environment
Edit `.env.local` and fill in your values:
```env
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/luminary
GEMINI_API_KEY=your_gemini_api_key_here
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 4. Run development server
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

### 5. Build for production
```bash
npm run build
npm start
```

---

## How It Works

### For the creator (setup)
1. Visit `/setup`
2. Enter both your names and your relationship start date
3. Pick one of 3 beautiful themes:
   - **Blush Romance** — rose pinks & lavender, floating hearts
   - **Golden Hour** — warm amber & gold, falling petals
   - **Velvet Night** — deep purple & navy, twinkling stars
4. Choose a secret access code (share this with your partner!)
5. Add your memories — first meeting, first kiss, first date, first fight, etc.
6. For each memory: write a description, optionally upload a photo, and hit **✦ Enhance with AI** to turn it into a poetic narrative
7. Hit **Publish Our Story** — your timeline is live!

### For the viewer (journey)
1. Visit `/` (the home page)
2. Enter the 6-character access code
3. Experience your love story as a beautiful animated timeline

---

## Features

- **3 stunning themes** with unique color palettes, fonts, and particle animations
- **AI story enhancement** via Gemini — transforms raw memories into poetic prose
- **Photo uploads** — one photo per moment, with lightbox view
- **Animated timeline** — scroll-triggered cards, alternating left/right layout
- **PWA** — installable on mobile, works offline for cached content
- **Multiple couples** — each couple gets their own access code and isolated story
- **Mobile-first** — beautiful on all screen sizes

---

## Project Structure

```
src/
├── app/
│   ├── page.tsx              # Entry screen (code input)
│   ├── setup/page.tsx        # Setup wizard
│   ├── journey/[code]/       # The timeline view
│   └── api/                  # Auth, couple, upload, AI enhance
├── components/
│   ├── entry/                # Code entry screen
│   ├── setup/                # Wizard + moment form
│   ├── journey/              # Timeline, hero, particles
│   └── shared/               # Theme provider, blobs
├── lib/                      # MongoDB, Gemini, themes, utils
├── models/                   # Couple + Moment schemas
└── types/                    # TypeScript interfaces
```

---

## Adding PWA Icons

Place these files in `public/icons/`:
- `icon-192.png` — 192×192 PNG
- `icon-512.png` — 512×512 PNG
- `apple-touch-icon.png` — 180×180 PNG

You can use any heart/love themed icon or generate from `public/icons/icon.svg`.
