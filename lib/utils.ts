import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Utility function to handle Firebase Storage URLs for Next.js Image optimization
export function isFirebaseStorageUrl(url: string): boolean {
  return url.includes('firebasestorage.googleapis.com');
}

// Function to check if we should use unoptimized images for certain URLs
export function shouldUseUnoptimized(url: string): boolean {
  // For Firebase Storage URLs with complex tokens, use unoptimized in production
  return isFirebaseStorageUrl(url) && process.env.NODE_ENV === 'production';
}
