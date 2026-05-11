import { checkRateLimit, getClientIp } from "@/lib/rate-limit";
import { getActiveSubscription } from "@/lib/db";
import { NextRequest } from "next/server";

export interface RateLimitResult {
  allowed: boolean;
  dbUserId: string | null;
  retryAfter?: string;
  resetAt?: number;
}

/**
 * Shared helper: check subscription status and apply rate limit.
 * Subscribers get 100 requests/60s; signed-in free users get 5; anonymous gets 3.
 * @param userId — DB user ID (UUID), null if anonymous
 */
export async function checkSubscriptionAndRateLimit(
  req: NextRequest,
  userId: string | null,
  isPaid: boolean,
): Promise<RateLimitResult> {
  let isSubscriber = false;
  let dbUserId: string | null = userId;

  if (userId) {
    const sub = await getActiveSubscription(userId);
    isSubscriber = !!(sub && sub.status === "active");
  }

  const clientIp = getClientIp(req);
  const rateKey = userId ? `ai:${userId}` : `ai:anon:${clientIp}`;
  const maxRequests = (isPaid || isSubscriber) ? 100 : (userId ? 5 : 3);

  const rateResult = await checkRateLimit(rateKey, { maxRequests, windowSeconds: 60 });

  return {
    allowed: rateResult.allowed,
    dbUserId,
    retryAfter: rateResult.resetAt
      ? String(Math.ceil((rateResult.resetAt - Date.now()) / 1000))
      : undefined,
    resetAt: rateResult.resetAt,
  };
}
