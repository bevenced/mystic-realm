import { NextRequest, NextResponse } from "next/server";
import { createSessionToken, setSessionCookie } from "@/lib/auth";
import { sql } from "@/lib/sql";
import { addUserPoints } from "@/lib/db";

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID || "";
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET || "";

function getSiteUrl(request: NextRequest): string {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL;
  if (siteUrl) return siteUrl;
  const host = request.headers.get("x-forwarded-host") || request.headers.get("host") || "";
  const proto = request.headers.get("x-forwarded-proto") || "https";
  return `${proto}://${host}`;
}

function getRedirectUri(request: NextRequest): string {
  return `${getSiteUrl(request)}/api/auth/google`;
}

export async function GET(request: NextRequest) {
  if (!GOOGLE_CLIENT_ID || !GOOGLE_CLIENT_SECRET) {
    return NextResponse.json({ error: "Google OAuth is not configured" }, { status: 501 });
  }

  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");
  const state = searchParams.get("state");

  // If this is the Google callback (has code param), exchange for tokens
  if (code) {
    try {
      const redirectUri = getRedirectUri(request);

      const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({
          client_id: GOOGLE_CLIENT_ID,
          client_secret: GOOGLE_CLIENT_SECRET,
          code,
          grant_type: "authorization_code",
          redirect_uri: redirectUri,
        }),
      });

      const tokenData = await tokenRes.json();
      if (tokenData.error) {
        return NextResponse.json({ error: `Google auth failed: ${tokenData.error}` }, { status: 400 });
      }

      const userRes = await fetch("https://openidconnect.googleapis.com/v1/userinfo", {
        headers: { Authorization: `Bearer ${tokenData.access_token}` },
      });
      const googleUser = await userRes.json();

      if (!googleUser.email) {
        return NextResponse.json({ error: "Could not get email from Google" }, { status: 400 });
      }

      // Find or create user
      const existing = await sql`SELECT * FROM users WHERE email = ${googleUser.email}`;
      let user;

      if (existing.rows.length > 0) {
        user = existing.rows[0];
      } else {
        const id = crypto.randomUUID();
        const result = await sql`
          INSERT INTO users (id, clerk_id, email, name, avatar)
          VALUES (${id}, ${id}, ${googleUser.email}, ${googleUser.name || googleUser.email}, ${googleUser.picture || null})
          RETURNING id, email, name, plan, points, created_at
        `;
        user = result.rows[0];

        // Welcome bonus: +50 points for new users
        await addUserPoints(user.id, 50, "signup_bonus", "Welcome bonus").catch(() => {});
      }

      const sessionToken = createSessionToken({
        id: user.id,
        email: user.email,
        name: user.name || user.email,
      });

      const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || getSiteUrl(request);
      const res = NextResponse.redirect(`${siteUrl}/dashboard`);
      res.headers.append("Set-Cookie", setSessionCookie(sessionToken));
      return res;
    } catch (error) {
      console.error("Google OAuth error:", error);
      return NextResponse.json({ error: "Google authentication failed" }, { status: 500 });
    }
  }

  // Initial request: redirect to Google consent screen
  const redirectUri = getRedirectUri(request);
  const oauthState = crypto.randomUUID();

  const params = new URLSearchParams({
    client_id: GOOGLE_CLIENT_ID,
    redirect_uri: redirectUri,
    response_type: "code",
    scope: "openid email profile",
    state: oauthState,
  });

  const res = NextResponse.redirect(`https://accounts.google.com/o/oauth2/v2/auth?${params}`);
  res.cookies.set("oauth_state", oauthState, { httpOnly: true, path: "/", maxAge: 600, sameSite: "lax" });
  return res;
}
