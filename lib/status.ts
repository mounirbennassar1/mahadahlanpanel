import type { LeadStatus } from "@prisma/client";

export const STATUS_META: Record<
  LeadStatus,
  { label: string; className: string; dot: string }
> = {
  INQUIRY: { label: "Inquiry", className: "s-inquiry", dot: "var(--blue)" },
  CONFIRMED: { label: "Confirmed", className: "s-confirmed", dot: "var(--amber)" },
  BOOKED: { label: "Booked", className: "s-booked", dot: "var(--green)" },
  NO_ANSWER: { label: "No answer", className: "s-noanswer", dot: "var(--slate)" },
  CANCELLED: { label: "Cancelled", className: "s-cancelled", dot: "var(--red)" },
  NOT_INTERESTED: { label: "Not interested", className: "s-notint", dot: "var(--notint-dot)" },
};

export const STATUS_ORDER: LeadStatus[] = [
  "INQUIRY",
  "CONFIRMED",
  "BOOKED",
  "NO_ANSWER",
  "CANCELLED",
  "NOT_INTERESTED",
];

export function formatRelative(date: Date) {
  const now = Date.now();
  const diff = now - date.getTime();
  const day = 24 * 60 * 60 * 1000;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const thatDay = new Date(date);
  thatDay.setHours(0, 0, 0, 0);
  const dayDiff = Math.round((today.getTime() - thatDay.getTime()) / day);

  const time = date.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" });
  if (dayDiff <= 0) return { when: "Today", time };
  if (dayDiff === 1) return { when: "Yesterday", time };
  if (dayDiff < 7) return { when: `${dayDiff} days ago`, time };
  return { when: date.toLocaleDateString("en-US", { month: "short", day: "numeric" }), time };
  void diff;
}
