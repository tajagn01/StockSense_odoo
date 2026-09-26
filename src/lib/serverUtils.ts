import { revalidatePath } from "next/cache";

/**
 * Safely triggers Next.js path revalidation without throwing errors when executed
 * outside of an active HTTP request context (such as in integration tests or background workers).
 */
export function safeRevalidatePath(path: string) {
  try {
    revalidatePath(path);
  } catch {
    // Gracefully ignore missing Next.js request store in test or background worker contexts
  }
}
