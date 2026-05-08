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

  // Insert default plans
  await sql`
    INSERT INTO subscription_plans (id, name, price_monthly, price_yearly, features, ai_credits_per_month)
    VALUES
      ('free', 'Free', 0, 0, ARRAY['1 free preview per service', 'Basic AI guidance'], 3),
      ('mystic', 'Mystic', 8.88, 79.99, ARRAY['10 AI readings per month', 'Full interpretations', 'Priority support', 'Reading history'], 10),
      ('oracle', 'Oracle', 19.99, 179.99, ARRAY['Unlimited AI readings', 'Full interpretations', 'Priority support', 'Reading history', 'Export PDF', 'Early access to new features'], 999)
    ON CONFLICT (id) DO NOTHING;
  `;

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
export async function getUserMonthlyUsage(userId: string) {
  if (!userId) throw new Error("userId is required");
  try {
    const result = await sql`
      SELECT COALESCE(SUM(tokens_used), 0) as total_tokens, COUNT(*) as readings
      FROM ai_usage
      WHERE user_id = ${userId}
      AND created_at >= date_trunc('month', NOW())
    `;
    return result.rows[0];
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
