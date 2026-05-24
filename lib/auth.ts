import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { sql } from "@/lib/sql";

const JWT_SECRET = process.env.JWT_SECRET || "mystic-realm-jwt-secret-change-in-production";
const COOKIE_NAME = "session";
const OTP_COOKIE = "otp_token";
const SESSION_DURATION = 7 * 24 * 60 * 60; // 7 days
const OTP_DURATION = 10 * 60; // 10 minutes

export interface SessionUser {
  id: string;
  email: string;
  name: string;
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10);
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export function createSessionToken(user: SessionUser): string {
  return jwt.sign(user, JWT_SECRET, { expiresIn: SESSION_DURATION });
}

export function verifySessionToken(token: string): SessionUser | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    if (typeof decoded === "object" && decoded !== null && "id" in decoded) {
      return decoded as SessionUser;
    }
    return null;
  } catch {
    return null;
  }
}

export function getSessionUserFromRequest(request: Request): SessionUser | null {
  const cookieHeader = request.headers.get("cookie") || "";
  const cookies = cookieHeader.split(";").map((c) => c.trim());
  for (const cookie of cookies) {
    const eqIdx = cookie.indexOf("=");
    if (eqIdx === -1) continue;
    const name = cookie.slice(0, eqIdx).trim();
    if (name === COOKIE_NAME) {
      const token = cookie.slice(eqIdx + 1).trim();
      if (!token) return null;
      return verifySessionToken(decodeURIComponent(token));
    }
  }
  return null;
}

export function getSessionUserFromToken(token: string): SessionUser | null {
  if (!token) return null;
  return verifySessionToken(token);
}

export function setSessionCookie(token: string): string {
  const secure = process.env.NODE_ENV === "production" ? " Secure;" : "";
  return `${COOKIE_NAME}=${token}; HttpOnly; Path=/; SameSite=Lax; Max-Age=${SESSION_DURATION};${secure}`;
}

export function clearSessionCookie(): string {
  const secure = process.env.NODE_ENV === "production" ? " Secure;" : "";
  return `${COOKIE_NAME}=; HttpOnly; Path=/; SameSite=Lax; Max-Age=0;${secure}`;
}

export async function getAuthUser(request: Request) {
  const session = getSessionUserFromRequest(request);
  if (!session) return null;
  try {
    const result = await sql`SELECT * FROM users WHERE id = ${session.id}`;
    return result.rows[0] || null;
  } catch {
    return null;
  }
}

// ── OTP (One-Time Password) for email verification ──

export function generateOTP(): string {
  return String(Math.floor(100000 + Math.random() * 900000)); // 6-digit
}

export interface OTPPayload {
  email: string;
  code: string;
  purpose: "email_verification";
}

export function createOTPToken(email: string, code: string): string {
  return jwt.sign({ email, code, purpose: "email_verification" } as OTPPayload, JWT_SECRET, {
    expiresIn: OTP_DURATION,
  });
}

export function verifyOTPToken(token: string): OTPPayload | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    if (
      typeof decoded === "object" && decoded !== null &&
      "email" in decoded && "code" in decoded &&
      decoded.purpose === "email_verification"
    ) {
      return decoded as OTPPayload;
    }
    return null;
  } catch {
    return null;
  }
}

export function getOTPTokenFromRequest(request: Request): string | null {
  const cookies = (request.headers.get("cookie") || "").split(";").map((c) => c.trim());
  for (const cookie of cookies) {
    const eqIdx = cookie.indexOf("=");
    if (eqIdx === -1) continue;
    if (cookie.slice(0, eqIdx).trim() === OTP_COOKIE) {
      const token = cookie.slice(eqIdx + 1).trim();
      return token ? decodeURIComponent(token) : null;
    }
  }
  return null;
}

export function setOTPCookie(token: string): string {
  const secure = process.env.NODE_ENV === "production" ? " Secure;" : "";
  return `${OTP_COOKIE}=${token}; HttpOnly; Path=/; SameSite=Lax; Max-Age=${OTP_DURATION};${secure}`;
}

export function clearOTPCookie(): string {
  const secure = process.env.NODE_ENV === "production" ? " Secure;" : "";
  return `${OTP_COOKIE}=; HttpOnly; Path=/; SameSite=Lax; Max-Age=0;${secure}`;
}
