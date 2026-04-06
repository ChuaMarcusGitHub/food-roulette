import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/** Merges Tailwind classes safely — deduplicates conflicting utilities. */
export const cn = (...inputs: ClassValue[]) => twMerge(clsx(inputs));
