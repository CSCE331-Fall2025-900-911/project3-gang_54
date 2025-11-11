import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";

const SESSION_COOKIE = "sharetea-session";

interface SessionPayload {
  sub: string;
  email: string;
  name?: string;
  picture?: string;
  role?: string;
  iat?: number;
  exp?: number;
}

function getJwtSecret(): string {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error("Missing JWT_SECRET environment variable.");
  }
  return secret;
}

export async function GET(req: NextRequest) {
  try {
    const token = req.cookies.get(SESSION_COOKIE)?.value;
    if (!token) {
      return NextResponse.json({ user: null }, { status: 200 });
    }

    const payload = jwt.verify(token, getJwtSecret()) as SessionPayload;

    return NextResponse.json({
      user: {
        email: payload.email,
        name: payload.name,
        picture: payload.picture,
        role: payload.role,
      },
      expiresAt: payload.exp ? payload.exp * 1000 : null,
    });
  } catch (error) {
    console.error("Session check failed", error);
    return NextResponse.json({ user: null }, { status: 200 });
  }
}

export async function DELETE() {
  const response = NextResponse.json({ success: true });
  response.cookies.set({
    name: SESSION_COOKIE,
    value: "",
    path: "/",
    maxAge: 0,
  });
  return response;
}

