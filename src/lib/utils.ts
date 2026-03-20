import { format, formatDistanceStrict } from "date-fns";

export function cn(...classes: (string | undefined | null | false)[]): string {
  return classes.filter(Boolean).join(" ");
}

export function formatDate(date: string | Date): string {
  return format(new Date(date), "MMMM d, yyyy");
}

export function formatDateShort(date: string | Date): string {
  return format(new Date(date), "MMM d, yyyy");
}

export function getDuration(startDate: string | Date): string {
  return formatDistanceStrict(new Date(startDate), new Date(), {
    addSuffix: false,
  });
}

export function getDays(startDate: string | Date): number {
  const start = new Date(startDate);
  const now = new Date();
  const diff = now.getTime() - start.getTime();
  return Math.floor(diff / (1000 * 60 * 60 * 24));
}
