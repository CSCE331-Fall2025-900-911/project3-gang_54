import { NextRequest, NextResponse } from "next/server";
import { OAuth2Client } from "google-auth-library";

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

export async function POST(req: NextRequest) {
    const body = await req.json();
    const credential = body.credential;

    if (!credential) return NextResponse.json({ error: "Failed credential" }, { status: 400 });

    const ticket = await client.verifyIdToken({
        idToken: credential,
        audience: process.env.GOOGLE_CLIENT_ID,
    });
    const payload = ticket.getPayload();
    if (!payload?.email_verified) return NextResponse.json({ error: "Email not verified" }, { status: 401 });

    // TODO::check if manager/cashier/customer

    // TOOD::send access token/cookie/whatever
}