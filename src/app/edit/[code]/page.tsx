import { notFound } from "next/navigation";
import type { Metadata } from "next";
import connectDB from "@/lib/mongodb";
import Couple from "@/models/Couple";
import Moment from "@/models/Moment";
import { ICouple, IMoment } from "@/types";
import ThemeProvider from "@/components/shared/ThemeProvider";
import EditClient from "./EditClient";

interface Props {
  params: { code: string };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  return { title: "Edit Your Story — Luminary" };
}

async function getData(code: string) {
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

export default async function EditPage({ params }: Props) {
  const data = await getData(params.code);
  if (!data) notFound();

  return (
    <ThemeProvider theme={data.couple.theme} coupleId={data.couple._id}>
      <EditClient couple={data.couple} initialMoments={data.moments} />
    </ThemeProvider>
  );
}
