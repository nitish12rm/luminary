import SetupWizard from "@/components/setup/SetupWizard";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Create Your Story — Luminary",
  description: "Start building your couple's journey timeline.",
};

export default function SetupPage() {
  return <SetupWizard />;
}
