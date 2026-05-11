import { sql } from "@vercel/postgres";

/**
 * Initialize database tables
 * Run this once via POST /api/db/init
 */
export async function initDatabase() {
  // Users table (extends Clerk user data)
  await sql`
    CREATE TABLE IF NOT EXISTS users (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      clerk_id VARCHAR(255) UNIQUE NOT NULL,
      email VARCHAR(255),
      name VARCHAR(255),
      plan VARCHAR(50) DEFAULT 'free',
      points INTEGER DEFAULT 0,
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW()
    );
  `;

  // Subscription plans
  await sql`
    CREATE TABLE IF NOT EXISTS subscription_plans (
      id VARCHAR(50) PRIMARY KEY,
      name VARCHAR(100) NOT NULL,
      price_monthly DECIMAL(10,2) NOT NULL,
      price_yearly DECIMAL(10,2) NOT NULL,
      features TEXT[] NOT NULL,
      ai_credits_per_month INT DEFAULT 0,
      stripe_price_id_monthly VARCHAR(255),
      stripe_price_id_yearly VARCHAR(255),
      created_at TIMESTAMPTZ DEFAULT NOW()
    );
  `;

  // User subscriptions
  await sql`
    CREATE TABLE IF NOT EXISTS subscriptions (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id UUID REFERENCES users(id) ON DELETE CASCADE,
      plan_id VARCHAR(50) REFERENCES subscription_plans(id),
      stripe_subscription_id VARCHAR(255) UNIQUE,
      stripe_customer_id VARCHAR(255),
      status VARCHAR(50) NOT NULL DEFAULT 'inactive',
      current_period_start TIMESTAMPTZ,
      current_period_end TIMESTAMPTZ,
      cancel_at_period_end BOOLEAN DEFAULT FALSE,
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW()
    );
  `;

  // Payment history (replaces PayPal-only tracking)
  await sql`
    CREATE TABLE IF NOT EXISTS payments (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id UUID REFERENCES users(id) ON DELETE CASCADE,
      paypal_order_id VARCHAR(255),
      stripe_payment_intent_id VARCHAR(255),
      amount DECIMAL(10,2) NOT NULL,
      currency VARCHAR(10) DEFAULT 'USD',
      service VARCHAR(100) NOT NULL,
      status VARCHAR(50) NOT NULL DEFAULT 'pending',
      created_at TIMESTAMPTZ DEFAULT NOW()
    );
  `;

  // AI usage tracking
  await sql`
    CREATE TABLE IF NOT EXISTS ai_usage (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id UUID REFERENCES users(id) ON DELETE CASCADE,
      service VARCHAR(50) NOT NULL,
      tokens_used INT DEFAULT 0,
      created_at TIMESTAMPTZ DEFAULT NOW()
    );
  `;

  // Rate limiting (persisted across serverless instances)
  await sql`
    CREATE TABLE IF NOT EXISTS rate_limits (
      key TEXT PRIMARY KEY,
      count INT NOT NULL DEFAULT 1,
      reset_at TIMESTAMPTZ NOT NULL
    );
  `;

  // User reviews
  await sql`
    CREATE TABLE IF NOT EXISTS reviews (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id UUID REFERENCES users(id) ON DELETE CASCADE,
      service VARCHAR(50) NOT NULL,
      rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
      comment TEXT DEFAULT '',
      display_name VARCHAR(100) DEFAULT 'Anonymous',
      created_at TIMESTAMPTZ DEFAULT NOW()
    );
  `;

  // Daily check-ins
  await sql`
    CREATE TABLE IF NOT EXISTS daily_checkins (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id UUID REFERENCES users(id) ON DELETE CASCADE,
      checkin_date DATE NOT NULL DEFAULT CURRENT_DATE,
      streak INTEGER NOT NULL DEFAULT 1,
      points_earned INTEGER NOT NULL DEFAULT 10,
      fortune TEXT NOT NULL DEFAULT '',
      created_at TIMESTAMPTZ DEFAULT NOW(),
      UNIQUE(user_id, checkin_date)
    );
  `;

  // Point redemptions (one-time-use tokens for free readings)
  await sql`
    CREATE TABLE IF NOT EXISTS point_redemptions (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      token VARCHAR(255) UNIQUE NOT NULL,
      service VARCHAR(50) NOT NULL DEFAULT 'reading',
      used BOOLEAN NOT NULL DEFAULT FALSE,
      created_at TIMESTAMPTZ DEFAULT NOW()
    );
  `;

  // Insert default plans
  await sql`
    INSERT INTO subscription_plans (id, name, price_monthly, price_yearly, features, ai_credits_per_month)
    VALUES
      ('free', 'Free', 0, 0, ARRAY['3 free previews per service', 'Basic AI guidance'], 3),
      ('mystic', 'Mystic', 9.99, 99.99, ARRAY['Unlimited AI readings', 'Full interpretations', 'Reading history', 'Export PDF', 'Priority support'], 999)
    ON CONFLICT (id) DO NOTHING;
  `;

  // Ensure existing tables have new columns (for upgrades from older schema)
  await sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS points INTEGER DEFAULT 0`;

  return { success: true, message: "Database initialized" };
}

/**
 * Get or create user from Clerk ID
 */
export async function getOrCreateUser(clerkId: string, email?: string, name?: string) {
  if (!clerkId) throw new Error("clerkId is required");
  try {
    const existing = await sql`SELECT * FROM users WHERE clerk_id = ${clerkId}`;
    if (existing.rows.length > 0) return existing.rows[0];

    const result = await sql`
      INSERT INTO users (clerk_id, email, name)
      VALUES (${clerkId}, ${email || null}, ${name || null})
      RETURNING *
    `;
    return result.rows[0];
  } catch (error) {
    console.error("getOrCreateUser error:", error);
    throw error;
  }
}

/**
 * Get user's current subscription
 */
export async function getUserSubscription(userId: string) {
  if (!userId) throw new Error("userId is required");
  try {
    const result = await sql`
      SELECT s.*, p.name as plan_name, p.price_monthly, p.price_yearly, p.features, p.ai_credits_per_month
      FROM subscriptions s
      JOIN subscription_plans p ON s.plan_id = p.id
      WHERE s.user_id = ${userId} AND s.status = 'active'
      ORDER BY s.created_at DESC
      LIMIT 1
    `;
    return result.rows[0] || null;
  } catch (error) {
    console.error("getUserSubscription error:", error);
    throw error;
  }
}

/**
 * Get user's AI usage this month
 */
export async function getUserMonthlyUsage(userId: string): Promise<{ totalTokens: number; readings: number }> {
  if (!userId) throw new Error("userId is required");
  try {
    const result = await sql`
      SELECT COALESCE(SUM(tokens_used), 0) as total_tokens, COUNT(*) as readings
      FROM ai_usage
      WHERE user_id = ${userId}
      AND created_at >= date_trunc('month', NOW())
    `;
    const row = result.rows[0];
    return {
      totalTokens: Number(row?.total_tokens || 0),
      readings: Number(row?.readings || 0),
    };
  } catch (error) {
    console.error("getUserMonthlyUsage error:", error);
    throw error;
  }
}

/**
 * Record AI usage
 */
export async function recordAiUsage(userId: string, service: string, tokensUsed: number) {
  if (!userId) throw new Error("userId is required");
  if (!service) throw new Error("service is required");
  try {
    await sql`
      INSERT INTO ai_usage (user_id, service, tokens_used)
      VALUES (${userId}, ${service}, ${tokensUsed})
    `;
  } catch (error) {
    console.error("recordAiUsage error:", error);
    throw error;
  }
}

/**
 * Record payment
 */
export async function recordPayment(userId: string, data: {
  paypalOrderId?: string;
  stripePaymentIntentId?: string;
  amount: number;
  currency?: string;
  service: string;
  status?: string;
}) {
  if (!userId) throw new Error("userId is required");
  if (!data.amount || data.amount <= 0) throw new Error("Valid amount is required");
  if (!data.service) throw new Error("service is required");
  try {
    const result = await sql`
      INSERT INTO payments (user_id, paypal_order_id, stripe_payment_intent_id, amount, currency, service, status)
      VALUES (${userId}, ${data.paypalOrderId || null}, ${data.stripePaymentIntentId || null}, ${data.amount}, ${data.currency || 'USD'}, ${data.service}, ${data.status || 'completed'})
      RETURNING *
    `;
    return result.rows[0];
  } catch (error) {
    console.error("recordPayment error:", error);
    throw error;
  }
}

/**
 * Submit a review after a reading
 */
export async function submitReview(data: {
  userId: string;
  service: string;
  rating: number;
  comment?: string;
  displayName?: string;
}) {
  if (!data.userId) throw new Error("userId is required");
  if (!data.service) throw new Error("service is required");
  if (!data.rating || data.rating < 1 || data.rating > 5) throw new Error("Rating must be 1-5");
  try {
    const result = await sql`
      INSERT INTO reviews (user_id, service, rating, comment, display_name)
      VALUES (${data.userId}, ${data.service}, ${data.rating}, ${data.comment || ''}, ${data.displayName || 'Anonymous'})
      RETURNING *
    `;
    return result.rows[0];
  } catch (error) {
    console.error("submitReview error:", error);
    throw error;
  }
}

/**
 * Get reviews for a specific service (public)
 */
export async function getServiceReviews(service: string, limit = 10) {
  if (!service) throw new Error("service is required");
  try {
    const result = await sql`
      SELECT rating, comment, display_name, created_at
      FROM reviews
      WHERE service = ${service}
      ORDER BY created_at DESC
      LIMIT ${limit}
    `;
    return result.rows;
  } catch (error) {
    console.error("getServiceReviews error:", error);
    throw error;
  }
}

/**
 * Get average rating for a service
 */
export async function getServiceAverageRating(service: string) {
  if (!service) throw new Error("service is required");
  try {
    const result = await sql`
      SELECT AVG(rating)::float as average, COUNT(*) as count
      FROM reviews
      WHERE service = ${service}
    `;
    return result.rows[0] || { average: 0, count: 0 };
  } catch (error) {
    console.error("getServiceAverageRating error:", error);
    throw error;
  }
}

// ===== Rate Limiting (persisted) =====

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetAt: number; // epoch ms
}

/**
 * Check rate limit using Postgres for persistence across serverless instances.
 * Falls back to allowing the request if DB is unavailable.
 */
export async function checkRateLimitDb(
  key: string,
  maxRequests: number,
  windowSeconds: number,
): Promise<RateLimitResult> {
  try {
    const now = Date.now();
    const resetAt = now + windowSeconds * 1000;
    const resetAtDate = new Date(resetAt);

    const result = await sql`
      INSERT INTO rate_limits (key, count, reset_at)
      VALUES (${key}, 1, ${resetAtDate.toISOString()})
      ON CONFLICT (key) DO UPDATE
      SET count = CASE
            WHEN rate_limits.reset_at < NOW() THEN 1
            ELSE rate_limits.count + 1
          END,
          reset_at = CASE
            WHEN rate_limits.reset_at < NOW() THEN ${resetAtDate.toISOString()}
            ELSE rate_limits.reset_at
          END
      RETURNING count, reset_at
    `;

    const row = result.rows[0];
    const newCount: number = Number(row.count);
    const newResetAt: Date = new Date(row.reset_at);
    const remaining = Math.max(0, maxRequests - newCount);

    return {
      allowed: newCount <= maxRequests,
      remaining,
      resetAt: newResetAt.getTime(),
    };
  } catch (error) {
    console.error("Rate limit DB error, allowing request:", error);
    return { allowed: true, remaining: 1, resetAt: Date.now() + windowSeconds * 1000 };
  }
}

// ===== Payment / Order Verification =====

/**
 * Check if a PayPal order has already been consumed.
 * Returns the service it was consumed for, or null if not yet consumed.
 */
export async function getConsumedOrderService(orderId: string): Promise<string | null> {
  try {
    const result = await sql`
      SELECT service FROM payments
      WHERE paypal_order_id = ${orderId}
      LIMIT 1
    `;
    return result.rows[0]?.service || null;
  } catch (error) {
    console.error("getConsumedOrderService error:", error);
    return null;
  }
}

// ===== Subscription Management =====

/**
 * Activate (or extend) a subscription for a user after successful payment.
 * If user has an active subscription, extends it by 30 days from current expiry.
 */
export async function activateSubscription(
  userId: string,
  planId: string,
  paypalOrderId: string,
) {
  if (!userId) throw new Error("userId is required");
  if (!planId) throw new Error("planId is required");
  try {
    // Idempotency: check if this PayPal order was already processed
    const consumedService = await getConsumedOrderService(paypalOrderId);
    if (consumedService) {
      // Return existing active subscription without double-charging
      const existingSub = await sql`
        SELECT * FROM subscriptions
        WHERE user_id = ${userId} AND status = 'active' AND current_period_end > NOW()
        ORDER BY current_period_end DESC LIMIT 1
      `;
      if (existingSub.rows.length > 0) return existingSub.rows[0];
      throw new Error("Payment already processed but no active subscription found. Please contact support.");
    }

    // Check if user already has an active subscription
    const existing = await sql`
      SELECT * FROM subscriptions
      WHERE user_id = ${userId} AND status = 'active' AND current_period_end > NOW()
      ORDER BY current_period_end DESC LIMIT 1
    `;

    let sub;
    if (existing.rows.length > 0) {
      // Extend existing subscription
      const row = existing.rows[0];
      const newEnd = new Date(Math.max(
        new Date(row.current_period_end).getTime(),
        Date.now(),
      ) + 30 * 24 * 60 * 60 * 1000);
      const result = await sql`
        UPDATE subscriptions
        SET current_period_end = ${newEnd.toISOString()},
            updated_at = NOW()
        WHERE id = ${row.id}
        RETURNING *
      `;
      sub = result.rows[0];
    } else {
      // Create new subscription
      const now = new Date();
      const end = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
      const result = await sql`
        INSERT INTO subscriptions (user_id, plan_id, status, current_period_start, current_period_end)
        VALUES (${userId}, ${planId}, 'active', ${now.toISOString()}, ${end.toISOString()})
        RETURNING *
      `;
      sub = result.rows[0];
    }

    // Update user's plan
    await sql`UPDATE users SET plan = ${planId}, updated_at = NOW() WHERE id = ${userId}`;

    // Record the payment (subscription purchase)
    const plan = await sql`SELECT * FROM subscription_plans WHERE id = ${planId}`;
    const price = plan.rows[0]?.price_monthly || 9.99;
    await recordPayment(userId, {
      paypalOrderId,
      amount: Number(price),
      service: `subscription:${planId}`,
      status: "completed",
    });

    return sub;
  } catch (error) {
    console.error("activateSubscription error:", error);
    throw error;
  }
}

/**
 * Get the active subscription for a user (returns null if expired or none).
 */
export async function getActiveSubscription(userId: string) {
  if (!userId) return null;
  try {
    const result = await sql`
      SELECT s.*, p.name as plan_name, p.price_monthly, p.features, p.ai_credits_per_month
      FROM subscriptions s
      JOIN subscription_plans p ON s.plan_id = p.id
      WHERE s.user_id = ${userId}
        AND s.status = 'active'
        AND s.current_period_end > NOW()
      ORDER BY s.current_period_end DESC
      LIMIT 1
    `;
    return result.rows[0] || null;
  } catch (error) {
    console.error("getActiveSubscription error:", error);
    return null;
  }
}

// ===== Points & Check-ins =====

/**
 * Add points to a user and return the new total.
 */
export async function addUserPoints(userId: string, points: number) {
  if (!userId) throw new Error("userId is required");
  try {
    const result = await sql`
      UPDATE users SET points = points + ${points}, updated_at = NOW()
      WHERE id = ${userId}
      RETURNING points
    `;
    return result.rows[0]?.points || 0;
  } catch (error) {
    console.error("addUserPoints error:", error);
    throw error;
  }
}

/**
 * Get user's current points balance.
 */
export async function getUserPoints(userId: string): Promise<number> {
  if (!userId) return 0;
  try {
    const result = await sql`SELECT points FROM users WHERE id = ${userId}`;
    return result.rows[0]?.points || 0;
  } catch (error) {
    console.error("getUserPoints error:", error);
    return 0;
  }
}

/**
 * Redeem points (deduct) if user has enough. Returns new balance or throws.
 */
export async function redeemPoints(userId: string, points: number) {
  if (!userId) throw new Error("userId is required");
  try {
    const result = await sql`
      UPDATE users SET points = points - ${points}, updated_at = NOW()
      WHERE id = ${userId} AND points >= ${points}
      RETURNING points
    `;
    if (result.rows.length === 0) {
      const current = await getUserPoints(userId);
      throw new Error(`Insufficient points (have ${current}, need ${points})`);
    }
    return Number(result.rows[0]?.points || 0);
  } catch (error) {
    console.error("redeemPoints error:", error);
    throw error;
  }
}

/**
 * Create a one-time redemption token (after points are deducted).
 * Returns the token string for the client to pass to AI routes.
 */
export async function createRedemption(userId: string, service: string) {
  if (!userId) throw new Error("userId is required");
  try {
    const token = crypto.randomUUID();
    await sql`
      INSERT INTO point_redemptions (user_id, token, service)
      VALUES (${userId}, ${token}, ${service})
    `;
    return token;
  } catch (error) {
    console.error("createRedemption error:", error);
    throw error;
  }
}

/**
 * Consume a redemption token — returns the user_id if valid and unused, null otherwise.
 * Atomically marks the token as used to prevent double-spend.
 */
export async function consumeRedemption(token: string) {
  if (!token) return null;
  try {
    const result = await sql`
      UPDATE point_redemptions SET used = TRUE
      WHERE token = ${token} AND used = FALSE
      RETURNING user_id, service
    `;
    return result.rows[0] || null;
  } catch (error) {
    console.error("consumeRedemption error:", error);
    return null;
  }
}

/**
 * Perform daily check-in: calculates streak, awards points, inserts row.
 * Returns the check-in result with fortune.
 */
export async function performCheckin(userId: string, fortune: string): Promise<{
  id: string;
  user_id: string;
  checkin_date: string;
  streak: number;
  points_earned: number;
  fortune: string;
  totalPoints: number;
}> {
  if (!userId) throw new Error("userId is required");
  try {
    // Check if already checked in today
    const today = new Date().toISOString().slice(0, 10);
    const existing = await sql`
      SELECT id FROM daily_checkins
      WHERE user_id = ${userId} AND checkin_date = ${today}
    `;
    if (existing.rows.length > 0) {
      throw new Error("Already checked in today");
    }

    // Calculate streak from yesterday's check-in
    const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10);
    const prev = await sql`
      SELECT streak FROM daily_checkins
      WHERE user_id = ${userId} AND checkin_date = ${yesterday}
      ORDER BY checkin_date DESC LIMIT 1
    `;
    const streak = prev.rows.length > 0 ? (prev.rows[0].streak + 1) : 1;

    // Points based on streak tier
    let pointsEarned = 10;
    if (streak >= 30) pointsEarned = 30;
    else if (streak >= 7) pointsEarned = 20;
    else if (streak >= 3) pointsEarned = 15;

    // Insert check-in
    const result = await sql`
      INSERT INTO daily_checkins (user_id, checkin_date, streak, points_earned, fortune)
      VALUES (${userId}, ${today}, ${streak}, ${pointsEarned}, ${fortune})
      RETURNING *
    `;

    // Add points to user
    await addUserPoints(userId, pointsEarned);

    const row = result.rows[0] as {
      id: string;
      user_id: string;
      checkin_date: string;
      streak: number;
      points_earned: number;
      fortune: string;
    };
    return {
      id: row.id,
      user_id: row.user_id,
      checkin_date: row.checkin_date,
      streak: row.streak,
      points_earned: row.points_earned,
      fortune: row.fortune,
      totalPoints: await getUserPoints(userId),
    };
  } catch (error) {
    if (error instanceof Error && (error.message.includes("duplicate key") || error.message.includes("unique constraint") || error.message.includes("duplicate"))) {
      throw new Error("Already checked in today");
    }
    console.error("performCheckin error:", error);
    throw error;
  }
}

/**
 * Get today's check-in status for a user.
 */
export async function getTodayCheckin(userId: string) {
  if (!userId) return null;
  try {
    const today = new Date().toISOString().slice(0, 10);
    const result = await sql`
      SELECT * FROM daily_checkins
      WHERE user_id = ${userId} AND checkin_date = ${today}
    `;
    return result.rows[0] || null;
  } catch (error) {
    console.error("getTodayCheckin error:", error);
    return null;
  }
}

/**
 * Get recent check-in history for a user.
 */
export async function getCheckinHistory(userId: string, limit = 30) {
  if (!userId) return [];
  try {
    const result = await sql`
      SELECT checkin_date, streak, points_earned, fortune
      FROM daily_checkins
      WHERE user_id = ${userId}
      ORDER BY checkin_date DESC
      LIMIT ${limit}
    `;
    return result.rows;
  } catch (error) {
    console.error("getCheckinHistory error:", error);
    return [];
  }
}
