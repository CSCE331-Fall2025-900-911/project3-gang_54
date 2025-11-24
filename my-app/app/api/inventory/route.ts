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
    const result = await client.query("SELECT * FROM ingredients");
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
  const { name, quantity } = await request.json();

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
      "INSERT INTO ingredients (name, quantity) VALUES ($1, $2) RETURNING ingredient_id, name, quantity",
      [name, quantity]
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
  const { id, name, quantity } = await request.json();

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
      "UPDATE ingredients SET name = $1, quantity = $2 WHERE ingredient_id = $3",
      [name, quantity, id]
    );

    const updatedResult = await client.query("SELECT * FROM ingredients");
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
    await client.query("DELETE FROM ingredients WHERE ingredient_id = $1", [
      id,
    ]);

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