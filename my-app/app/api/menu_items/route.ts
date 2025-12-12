import { NextRequest, NextResponse } from "next/server";
import { Client } from "pg";

function normalizeTags(tags: any): string[] {
  if (Array.isArray(tags)) return tags.map((t) => String(t)).filter((t) => t.length > 0);
  if (typeof tags === "string") {
    const s = tags.trim();
    if (!s) return [];
    const inner = s.startsWith("{") && s.endsWith("}") ? s.slice(1, -1) : s;
    return inner
      .split(",")
      .map((x) => x.trim())
      .filter((x) => x.length > 0);
  }
  return [];
}

function makeClient() {
  return new Client({
    user: process.env.DB_user,
    host: process.env.DB_host,
    database: process.env.DB_name,
    password: process.env.DB_password,
    port: 5432,
  });
}

export async function GET() {
  const client = makeClient();
  try {
    await client.connect();
    const result = await client.query("SELECT * FROM menu_items ORDER BY item_id ASC");
    return NextResponse.json(result.rows);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  } finally {
    await client.end();
  }
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const {
    name,
    subtitle = null,
    description = null,
    price,
    tags = [],
    category = null,
    icon = null,
    badge = null,
  } = body ?? {};

  const client = makeClient();

  try {
    await client.connect();

    const insertResult = await client.query(
      "INSERT INTO menu_items (name, subtitle, description, price, tags, category, icon, badge) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *",
      [
        name,
        subtitle,
        description,
        price,
        normalizeTags(tags),
        category,
        icon,
        badge,
      ]
    );

    return NextResponse.json(insertResult.rows[0], { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  } finally {
    await client.end();
  }
}

export async function PUT(request: NextRequest) {
  const body = await request.json();
  const {
    id,
    name,
    subtitle = null,
    description = null,
    price,
    tags = [],
    category = null,
    icon = null,
    badge = null,
  } = body ?? {};

  const client = makeClient();

  try {
    await client.connect();

    await client.query(
      "UPDATE menu_items SET name = $1, subtitle = $2, description = $3, price = $4, tags = $5, category = $6, icon = $7, badge = $8 WHERE item_id = $9",
      [
        name,
        subtitle,
        description,
        price,
        normalizeTags(tags),
        category,
        icon,
        badge,
        id,
      ]
    );

    const updatedResult = await client.query("SELECT * FROM menu_items ORDER BY item_id ASC");
    return NextResponse.json(updatedResult.rows);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  } finally {
    await client.end();
  }
}

export async function DELETE(request: NextRequest) {
  const { id } = await request.json();
  const client = makeClient();

  try {
    await client.connect();
    await client.query("DELETE FROM menu_items WHERE item_id = $1", [id]);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  } finally {
    await client.end();
  }
}