/**
 * Edge-compatible auth helpers (no Node.js modules except jwt).
 * Safe to import in middleware.ts.
 */
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "mystic-realm-jwt-secret-change-in-production";
const COOKIE_NAME = "session";

export interface SessionUser {
  id: string;
  email: string;
  name: string;
}

function verifySessionToken(token: string): SessionUser | null {
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
