import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function isRtkQueryError(data: unknown): data is { error: { data: { success: boolean, message: string }}}{
  const result = (data as { error: { data: { success: boolean, message: string }}})?.error?.data;
  return result && "success" in result;
}
