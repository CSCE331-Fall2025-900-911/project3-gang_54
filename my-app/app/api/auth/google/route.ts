import { NextRequest, NextResponse } from "next/server";
import { OAuth2Client } from "google-auth-library";
import jwt from "jsonwebtoken";

const SESSION_COOKIE = "sharetea-session";
const SESSION_MAX_AGE = 60 * 60 * 24 * 7; // 7 days

const EMAIL1 = process.env.EMAIL1;
const EMAIL2 = process.env.EMAIL2;
const EMAIL3 = process.env.EMAIL3;
const EMAIL4 = process.env.EMAIL4;

console.log("EMAIL2 =", JSON.stringify(EMAIL2));
console.log("EMAIL1 =", JSON.stringify(EMAIL1));
console.log("EMAIL3 =", JSON.stringify(EMAIL3));
console.log("EMAIL4 =", JSON.stringify(EMAIL4));

const ROLE_DIRECTORY: Record<string, "manager" | "cashier" | "customer"> = {
  "reveille.bubbletea@gmail.com": "manager",
  [EMAIL1!]: "manager",
  [EMAIL2!]: "manager",
  [EMAIL3!]: "manager",
  [EMAIL4!]: "manager",
};

function getJwtSecret(): string {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error("Missing JWT_SECRET environment variable.");
  }
  return secret;
}

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

export async function POST(req: NextRequest) {
  try {
    if (!process.env.GOOGLE_CLIENT_ID) {
      return NextResponse.json(
        { error: "Google client not configured. Ask an admin to set GOOGLE_CLIENT_ID." },
        { status: 500 }
      );
    }

    const body = await req.json().catch(() => null);
    const credential = body?.credential;

    if (!credential) {
      return NextResponse.json({ error: "Missing Google credential." }, { status: 400 });
    }

    const ticket = await googleClient.verifyIdToken({
      idToken: credential,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    if (!payload?.email || !payload.email_verified) {
      return NextResponse.json({ error: "Google account email is not verified." }, { status: 401 });
    }

    const role = ROLE_DIRECTORY[payload.email] ?? "customer";
    const user = {
      sub: payload.sub,
      name: payload.name ?? "",
      email: payload.email,
      picture: payload.picture ?? "",
      role,
    };

    const token = jwt.sign(
      {
        sub: user.sub,
        email: user.email,
        name: user.name,
        picture: user.picture,
        role: user.role,
      },
      getJwtSecret(),
      { expiresIn: SESSION_MAX_AGE }
    );

    const response = NextResponse.json({
      user,
      expiresIn: SESSION_MAX_AGE,
    });

    response.cookies.set({
      name: SESSION_COOKIE,
      value: token,
      maxAge: SESSION_MAX_AGE,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
    });

    return response;
  } catch (error) {
    console.error("Google OAuth error", error);
    return NextResponse.json({ error: "Unable to authenticate with Google." }, { status: 500 });
  }
}
