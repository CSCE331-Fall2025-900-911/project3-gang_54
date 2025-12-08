import { NextResponse } from "next/server";

const SESSION_COOKIE = "sharetea-session";

export async function GET() {
  const res = NextResponse.redirect("/");

  res.cookies.set({
    name: SESSION_COOKIE,
    value: "",
    maxAge: 0,
    path: "/",
  });

  return res;
}