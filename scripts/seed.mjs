/**
 * Luminary — MongoDB Seed Script
 * --------------------------------
 * Usage:
 *   node scripts/seed.mjs
 *
 * Reads seed-data.json, generates SVG placeholder images for moments
 * marked hasPhoto:true, writes them to public/uploads/{coupleId}/,
 * then inserts the couple + all moments into MongoDB.
 *
 * Safe to re-run: deletes any existing couple with the same accessCode
 * (and their moments) before inserting fresh data.
 */

import { readFileSync, writeFileSync, mkdirSync, existsSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";
import mongoose from "mongoose";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const ROOT = join(__dirname, "..");

// ─── Load .env.local ──────────────────────────────────────────────────────────
function loadEnvLocal() {
  const envPath = join(ROOT, ".env.local");
  if (!existsSync(envPath)) {
    console.warn("⚠  No .env.local found — falling back to process.env");
    return;
  }
  const lines = readFileSync(envPath, "utf-8").split("\n");
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eqIdx = trimmed.indexOf("=");
    if (eqIdx === -1) continue;
    const key = trimmed.slice(0, eqIdx).trim();
    const val = trimmed.slice(eqIdx + 1).trim();
    if (key && !process.env[key]) process.env[key] = val;
  }
}
loadEnvLocal();

// ─── Mongoose models (inline — avoids TS/path-alias issues) ──────────────────
const CoupleSchema = new mongoose.Schema(
  {
    accessCode: { type: String, required: true, unique: true, trim: true },
    partner1Name: { type: String, required: true, trim: true },
    partner2Name: { type: String, required: true, trim: true },
    startDate: { type: Date, required: true },
    theme: { type: String, enum: ["blush", "golden", "velvet"], default: "blush" },
    coverPhotoPath: { type: String, default: null },
    bio: { type: String, default: "" },
  },
  { timestamps: true }
);

const MomentSchema = new mongoose.Schema(
  {
    coupleId: { type: mongoose.Schema.Types.ObjectId, ref: "Couple", required: true },
    category: {
      type: String,
      enum: [
        "first_meeting", "first_conversation", "first_walk",
        "knowing_feelings", "proposal", "first_kiss",
        "first_date", "first_fight", "custom",
      ],
      required: true,
    },
    customLabel: { type: String, default: "" },
    date: { type: Date, required: true },
    rawDescription: { type: String, required: true },
    poeticNarrative: { type: String, default: "" },
    photoPath: { type: String, default: null },
    photoAlt: { type: String, default: "" },
    order: { type: Number, default: 0 },
  },
  { timestamps: true }
);

const Couple = mongoose.models.Couple || mongoose.model("Couple", CoupleSchema);
const Moment = mongoose.models.Moment || mongoose.model("Moment", MomentSchema);

// ─── Placeholder SVG generator ────────────────────────────────────────────────
const CATEGORY_META = {
  first_meeting:      { emoji: "✨", label: "First Meeting",       gradient: ["#fde8f0", "#ede0ff"] },
  first_conversation: { emoji: "💬", label: "First Conversation",  gradient: ["#e8f4fd", "#dde8ff"] },
  first_walk:         { emoji: "🌿", label: "First Walk",          gradient: ["#e8fde8", "#d0f0e8"] },
  knowing_feelings:   { emoji: "💕", label: "Knowing the Feeling", gradient: ["#fdeef8", "#f8e0ff"] },
  proposal:           { emoji: "💍", label: "The Proposal",        gradient: ["#fdf8e8", "#fff0d0"] },
  first_kiss:         { emoji: "💋", label: "First Kiss",          gradient: ["#fde8e8", "#ffd0e0"] },
  first_date:         { emoji: "🌹", label: "First Date",          gradient: ["#ffe8f0", "#ffd8e8"] },
  first_fight:        { emoji: "🌧",  label: "First Fight",         gradient: ["#e8eef8", "#d8e8f8"] },
  custom:             { emoji: "⭐", label: "Special Memory",      gradient: ["#fef8e0", "#fff0c0"] },
};

function makeSVG(category, label, coupleNames) {
  const meta = CATEGORY_META[category] || CATEGORY_META.custom;
  const displayLabel = label || meta.label;
  const [c1, c2] = meta.gradient;

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="800" height="600" viewBox="0 0 800 600">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="${c1}"/>
      <stop offset="100%" stop-color="${c2}"/>
    </linearGradient>
    <filter id="blur">
      <feGaussianBlur stdDeviation="28"/>
    </filter>
  </defs>

  <!-- Background -->
  <rect width="800" height="600" fill="url(#bg)"/>

  <!-- Soft blobs -->
  <circle cx="180" cy="150" r="160" fill="${c1}" opacity="0.5" filter="url(#blur)"/>
  <circle cx="640" cy="460" r="140" fill="${c2}" opacity="0.5" filter="url(#blur)"/>

  <!-- Decorative dots -->
  <circle cx="80"  cy="520" r="4" fill="#e8789a" opacity="0.3"/>
  <circle cx="720" cy="80"  r="6" fill="#b89ee8" opacity="0.3"/>
  <circle cx="400" cy="40"  r="3" fill="#e8789a" opacity="0.25"/>
  <circle cx="760" cy="300" r="5" fill="#b89ee8" opacity="0.25"/>
  <circle cx="40"  cy="300" r="4" fill="#e8789a" opacity="0.2"/>

  <!-- Heart accent (top-right) -->
  <text x="740" y="56" font-size="28" text-anchor="middle" opacity="0.18">♥</text>
  <text x="60"  y="560" font-size="22" text-anchor="middle" opacity="0.15">✦</text>

  <!-- Category emoji -->
  <text x="400" y="245" font-size="88" text-anchor="middle" dominant-baseline="middle">${meta.emoji}</text>

  <!-- Moment label -->
  <text x="400" y="318" font-size="26" font-family="Georgia, 'Times New Roman', serif"
        text-anchor="middle" dominant-baseline="middle" fill="#7a5468" letter-spacing="0.5">${displayLabel}</text>

  <!-- Couple names -->
  <text x="400" y="360" font-size="15" font-family="Georgia, serif" font-style="italic"
        text-anchor="middle" dominant-baseline="middle" fill="#b08898">${coupleNames}</text>

  <!-- Divider line -->
  <line x1="340" y1="388" x2="460" y2="388" stroke="#e8789a" stroke-width="1" opacity="0.4"/>

  <!-- Footer -->
  <text x="400" y="408" font-size="11" font-family="'Helvetica Neue', Arial, sans-serif"
        text-anchor="middle" dominant-baseline="middle" fill="#b08898" letter-spacing="2" opacity="0.6">LUMINARY  ·  PLACEHOLDER</text>
</svg>`;
}

// ─── Main ─────────────────────────────────────────────────────────────────────
async function seed() {
  const uri = process.env.MONGODB_URI;
  if (!uri || uri === "your_mongodb_uri_here") {
    console.error("✗  MONGODB_URI is not set. Update .env.local and retry.");
    process.exit(1);
  }

  // Load seed data
  const data = JSON.parse(readFileSync(join(ROOT, "seed-data.json"), "utf-8"));
  const { couple: coupleData, moments: momentsData } = data;

  console.log("→  Connecting to MongoDB...");
  await mongoose.connect(uri);
  console.log("✓  Connected\n");

  // ── Clean up any previous seed with same accessCode ──────────────────────
  const existing = await Couple.findOne({ accessCode: coupleData.accessCode });
  if (existing) {
    console.log(`⚠  Found existing couple with code "${coupleData.accessCode}" — removing...`);
    await Moment.deleteMany({ coupleId: existing._id });
    await Couple.deleteOne({ _id: existing._id });
    console.log("   Cleaned up old documents.\n");
  }

  // ── Create couple ─────────────────────────────────────────────────────────
  const couple = await Couple.create({
    accessCode: coupleData.accessCode,
    partner1Name: coupleData.partner1Name,
    partner2Name: coupleData.partner2Name,
    startDate: new Date(coupleData.startDate),
    theme: coupleData.theme,
    bio: coupleData.bio,
  });

  const coupleId = couple._id.toString();
  const coupleNames = `${couple.partner1Name} & ${couple.partner2Name}`;
  console.log(`✓  Created couple: ${coupleNames}  (id: ${coupleId})`);
  console.log(`   Access code: "${coupleData.accessCode}"\n`);

  // ── Create uploads directory ──────────────────────────────────────────────
  const uploadsDir = join(ROOT, "public", "uploads", coupleId);
  if (!existsSync(uploadsDir)) {
    mkdirSync(uploadsDir, { recursive: true });
    console.log(`✓  Created directory: public/uploads/${coupleId}/`);
  }

  // ── Insert moments + generate placeholder SVGs ────────────────────────────
  console.log("→  Inserting moments...\n");
  let photoCount = 0;

  for (let i = 0; i < momentsData.length; i++) {
    const m = momentsData[i];
    let photoPath = null;
    let photoAlt = "";

    if (m.hasPhoto) {
      const filename = `moment-${String(i + 1).padStart(3, "0")}.svg`;
      const filePath = join(uploadsDir, filename);
      const svgContent = makeSVG(m.category, m.customLabel || null, coupleNames);
      writeFileSync(filePath, svgContent, "utf-8");
      photoPath = `/uploads/${coupleId}/${filename}`;
      photoAlt = m.customLabel || CATEGORY_META[m.category]?.label || "Memory photo";
      photoCount++;
    }

    const label = m.customLabel || CATEGORY_META[m.category]?.label || m.category;

    await Moment.create({
      coupleId: couple._id,
      category: m.category,
      customLabel: m.customLabel || "",
      date: new Date(m.date),
      rawDescription: m.rawDescription,
      poeticNarrative: m.poeticNarrative || "",
      photoPath,
      photoAlt,
      order: i,
    });

    const photoMark = photoPath ? " 📷" : "   ";
    console.log(`  ${String(i + 1).padStart(2)}. ${photoMark} ${label}  (${m.date})`);
  }

  // ── Summary ───────────────────────────────────────────────────────────────
  console.log(`
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✓  Seeding complete!

   Couple  : ${coupleNames}
   Code    : ${coupleData.accessCode}
   Theme   : ${coupleData.theme}
   Moments : ${momentsData.length}
   Photos  : ${photoCount} SVG placeholders written
             → public/uploads/${coupleId}/

Open the app and enter code: "${coupleData.accessCode}"
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);

  await mongoose.disconnect();
}

seed().catch((err) => {
  console.error("\n✗  Seed failed:", err.message);
  process.exit(1);
});
