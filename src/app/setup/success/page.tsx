import { notFound } from "next/navigation";
import type { Metadata } from "next";
import connectDB from "@/lib/mongodb";
import Couple from "@/models/Couple";
import Moment from "@/models/Moment";
import { ICouple } from "@/types";
import SuccessClient from "./SuccessClient";

interface Props {
  searchParams: { code?: string };
}

export const metadata: Metadata = {
  title: "Your story is live! — Luminary",
  description: "Your love story has been created on Luminary.",
};

async function getData(code: string) {
  await connectDB();
  const coupleDoc = await Couple.findOne({ accessCode: code }).lean();
  if (!coupleDoc) return null;
  const momentCount = await Moment.countDocuments({ coupleId: coupleDoc._id });
  return {
    couple: JSON.parse(JSON.stringify(coupleDoc)) as ICouple,
    totalMoments: momentCount,
  };
}

export default async function SuccessPage({ searchParams }: Props) {
  const code = searchParams.code;
  if (!code) notFound();

  const data = await getData(code);
  if (!data) notFound();

  return <SuccessClient couple={data.couple} totalMoments={data.totalMoments} />;
}
