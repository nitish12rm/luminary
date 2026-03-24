import { notFound } from "next/navigation";
import { cookies } from "next/headers";
import crypto from "crypto";
import type { Metadata } from "next";
import connectDB from "@/lib/mongodb";
import Couple from "@/models/Couple";
import Moment from "@/models/Moment";
import { ICouple, IMoment } from "@/types";
import ThemeProvider from "@/components/shared/ThemeProvider";
import ThemeSwitcher from "@/components/shared/ThemeSwitcher";
import JourneyHero from "@/components/journey/JourneyHero";
import Timeline from "@/components/journey/Timeline";
import ParticleField from "@/components/journey/ParticleField";
import PinGate from "@/components/journey/PinGate";

function makeCookieToken(accessCode: string) {
  const secret = process.env.COOKIE_SECRET || "luminary-pin-secret";
  return crypto.createHmac("sha256", secret).update(accessCode).digest("hex");
}

interface Props {
  params: { code: string };
}

async function getJourneyData(code: string) {
  await connectDB();

  const coupleDoc = await Couple.findOne({ accessCode: code }).lean() as { _id: unknown } & Record<string, unknown> | null;
  if (!coupleDoc) return null;

  const momentDocs = await Moment.find({ coupleId: coupleDoc._id })
    .sort({ date: 1, order: 1 })
    .lean();

  return {
    couple: JSON.parse(JSON.stringify(coupleDoc)) as ICouple,
    moments: JSON.parse(JSON.stringify(momentDocs)) as IMoment[],
  };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  try {
    const data = await getJourneyData(params.code);
    if (!data) return { title: "Story Not Found" };

    const { couple } = data;
    return {
      title: `${couple.partner1Name} & ${couple.partner2Name} — Our Journey`,
      description: couple.bio || `The love story of ${couple.partner1Name} and ${couple.partner2Name}.`,
    };
  } catch {
    return { title: "Our Journey — Luminary" };
  }
}

export default async function JourneyPage({ params }: Props) {
  const data = await getJourneyData(params.code);

  if (!data) notFound();

  const { couple, moments } = data;

  // PIN gate check
  if (couple.pin) {
    const cookieStore = cookies();
    const cookieVal = cookieStore.get(`lum_pin_${params.code}`)?.value;
    const expected = makeCookieToken(params.code);
    const unlocked = cookieVal
      ? crypto.timingSafeEqual(Buffer.from(cookieVal), Buffer.from(expected))
      : false;

    if (!unlocked) {
      return (
        <ThemeProvider theme={couple.theme} coupleId={couple._id}>
          <PinGate
            code={params.code}
            partner1={couple.partner1Name}
            partner2={couple.partner2Name}
          />
        </ThemeProvider>
      );
    }
  }

  return (
    <ThemeProvider theme={couple.theme} coupleId={couple._id}>
      <main
        className="min-h-screen relative"
        style={{ background: "var(--bg-primary)" }}
      >
        <ParticleField theme={couple.theme} />

        <div className="relative z-10">
          <JourneyHero couple={couple} totalMoments={moments.length} />
          <Timeline moments={moments} couple={couple} />
        </div>

        <ThemeSwitcher defaultTheme={couple.theme} coupleId={couple._id} couple={couple} totalMoments={moments.length} />
      </main>
    </ThemeProvider>
  );
}
