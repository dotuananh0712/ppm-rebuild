import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: string | Date): string {
  return new Date(date).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export function formatMonth(date: string): string {
  return new Date(date).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
  });
}

export function getMonthRange(startDate: Date, months: number): string[] {
  const result: string[] = [];
  const current = new Date(startDate);
  current.setDate(1);
  
  for (let i = 0; i < months; i++) {
    result.push(current.toISOString().slice(0, 10));
    current.setMonth(current.getMonth() + 1);
  }
  
  return result;
}
