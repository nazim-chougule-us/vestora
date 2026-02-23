/**
 * Vestora Frontend — shadcn/ui class name utility.
 * Combines clsx and tailwind-merge for conditional class merging.
 */

import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
