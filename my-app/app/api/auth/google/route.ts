import { NextRequest, NextResponse } from "next/server";
import { OAuth2Client } from "google-auth-library";
import jwt from "jsonwebtoken";
import { Pool } from "pg";

const SESSION_COOKIE = "sharetea-session";
const SESSION_MAX_AGE = 60 * 60 * 24 * 7; // 7 days

const EMAIL1 = process.env.EMAIL1;
const EMAIL2 = process.env.EMAIL2;
const EMAIL3 = process.env.EMAIL3;
const EMAIL4 = process.env.EMAIL4;

// Database connection for fetching employees
const connectionString =
  `postgres://${process.env.DB_user}:${process.env.DB_password}` +
  `@${process.env.DB_host}:5432/${process.env.DB_name}`;

const pool = new Pool({
  connectionString,
  ssl: { rejectUnauthorized: false },
});

// Build role directory from database employees and hardcoded emails
// Returns an array of roles for each email to support multiple roles
async function buildRoleDirectory(): Promise<Record<string, ("manager" | "cashier" | "customer")[]>> {
  const roleDirectory: Record<string, ("manager" | "cashier" | "customer")[]> = {};

  // First, fetch employees from database and add them to role directory
  try {
    const result = await pool.query(
      "SELECT email, role FROM employees WHERE email IS NOT NULL AND email != '' AND role IN ('manager', 'cashier')"
    );
    
    result.rows.forEach((row: { email: string; role: string }) => {
      if (row.email && (row.role === "manager" || row.role === "cashier")) {
        const emailLower = row.email.toLowerCase();
        if (!roleDirectory[emailLower]) {
          roleDirectory[emailLower] = [];
        }
        if (!roleDirectory[emailLower].includes(row.role as "manager" | "cashier")) {
          roleDirectory[emailLower].push(row.role as "manager" | "cashier");
        }
      }
    });
  } catch (error) {
    console.error("Error fetching employees for role directory:", error);
    // Continue with hardcoded emails if database query fails
  }

  // Then, add hardcoded emails (these take precedence over database)
  // Hardcoded manager emails
  const reveilleEmail = "reveille.bubbletea@gmail.com";
  if (!roleDirectory[reveilleEmail]) {
    roleDirectory[reveilleEmail] = [];
  }
  if (!roleDirectory[reveilleEmail].includes("manager")) {
    roleDirectory[reveilleEmail].push("manager");
  }

  // Hardcoded emails with multiple roles
  const akulEmail = "akul.ranjan.1@tamu.edu";
  if (!roleDirectory[akulEmail]) {
    roleDirectory[akulEmail] = [];
  }
  // Add both manager and cashier roles
  if (!roleDirectory[akulEmail].includes("manager")) {
    roleDirectory[akulEmail].push("manager");
  }
  if (!roleDirectory[akulEmail].includes("cashier")) {
    roleDirectory[akulEmail].push("cashier");
  }

  // Add environment variable emails as managers (if they exist) - these also take precedence
  [EMAIL1, EMAIL2, EMAIL3, EMAIL4].forEach((email) => {
    if (email) {
      const emailLower = email.toLowerCase();
      if (!roleDirectory[emailLower]) {
        roleDirectory[emailLower] = [];
      }
      if (!roleDirectory[emailLower].includes("manager")) {
        roleDirectory[emailLower].push("manager");
      }
    }
  });

  return roleDirectory;
}

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

    // Build role directory dynamically from database
    const roleDirectory = await buildRoleDirectory();
    const emailLower = payload.email.toLowerCase();
    const roles = roleDirectory[emailLower] ?? ["customer"];
    
    console.log(`[Auth] Email: ${payload.email}, Lowercase: ${emailLower}, Roles:`, roles);
    console.log(`[Auth] Role directory keys:`, Object.keys(roleDirectory));
    const user = {
      sub: payload.sub,
      name: payload.name ?? "",
      email: payload.email,
      picture: payload.picture ?? "",
      roles, // Store as array
    };

    const token = jwt.sign(
      {
        sub: user.sub,
        email: user.email,
        name: user.name,
        picture: user.picture,
        roles: user.roles, // Store as array in JWT
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
