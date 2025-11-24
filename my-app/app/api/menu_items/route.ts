import { NextRequest, NextResponse } from "next/server";
import { Client } from "pg";

export async function GET() {
  const client = new Client({
    user: process.env.DB_user,
    host: process.env.DB_host,
    database: process.env.DB_name,
    password: process.env.DB_password,
    port: 5432,
  });

  try {
    await client.connect();
    const result = await client.query("SELECT * FROM menu_items");
    return NextResponse.json(result.rows);
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  } finally {
    await client.end();
  }
}

export async function POST(request: NextRequest) {
  const { name, category, price } = await request.json();

  const client = new Client({
    user: process.env.DB_user,
    host: process.env.DB_host,
    database: process.env.DB_name,
    password: process.env.DB_password,
    port: 5432,
  });

  try {
    await client.connect();
    const insertResult = await client.query(
      "INSERT INTO menu_items (item_name, category, price) VALUES ($1, $2, $3) RETURNING item_id, item_name, category, price",
      [name, category, price]
    );

    const createdRow = insertResult.rows[0];
    return NextResponse.json(createdRow, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  } finally {
    await client.end();
  }
}

export async function PUT(request: NextRequest) {
  const { id, name, category, price } = await request.json();

  const client = new Client({
    user: process.env.DB_user,
    host: process.env.DB_host,
    database: process.env.DB_name,
    password: process.env.DB_password,
    port: 5432,
  });

  try {
    await client.connect();
    await client.query(
      "UPDATE menu_items SET item_name = $1, category = $2, price = $3 WHERE item_id = $4",
      [name, category, price, id]
    );

    const updatedResult = await client.query("SELECT * FROM menu_items");
    return NextResponse.json(updatedResult.rows);
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  } finally {
    await client.end();
  }
}

export async function DELETE(request: NextRequest) {
  const { id } = await request.json();

  const client = new Client({
    user: process.env.DB_user,
    host: process.env.DB_host,
    database: process.env.DB_name,
    password: process.env.DB_password,
    port: 5432,
  });

  try {
    await client.connect();
    await client.query("DELETE FROM menu_items WHERE item_id = $1", [id]);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  } finally {
    await client.end();
  }
}
