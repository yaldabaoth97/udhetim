import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatALL(amount: number): string {
  return new Intl.NumberFormat("sq-AL", {
    style: "currency",
    currency: "ALL",
    minimumFractionDigits: 0,
  }).format(amount);
}

// Alias for consistency
export const formatCurrency = formatALL;

export function formatDate(date: Date, locale: string = "sq"): string {
  return new Intl.DateTimeFormat(locale === "sq" ? "sq-AL" : "en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

export function isRidePast(departureTime: Date): boolean {
  return new Date(departureTime) < new Date();
}
