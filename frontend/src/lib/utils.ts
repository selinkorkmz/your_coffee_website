import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function padDatePart(datePart: string) {
  if (datePart.length === 2) return datePart;

  return `0${datePart}`
}