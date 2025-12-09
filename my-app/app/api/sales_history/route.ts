import { NextRequest, NextResponse } from "next/server";
import { Client } from "pg";

export async function POST(req: NextRequest) {
  const client = new Client({
    user: process.env.DB_user,
    host: process.env.DB_host,
    database: process.env.DB_name,
    password: process.env.DB_password,
    port: 5432,
  });

  try {
    await client.connect();

    const body = await req.json();
    const { items } = body;

    if (!Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
    }

    // Get the next orderId
    const res = await client.query(`SELECT COALESCE(MAX(orderid), 2) + 1 AS nextOrderId FROM salesHistory`);
    const orderId = res.rows[0].nextorderid; // will start from 3 if table has 2 orders

    for (const item of items) {
      const { item_id, quantity, price, size, sugar, ice, temperature, boba } = item;

      await client.query(
        `INSERT INTO salesHistory
         (orderid, drinkid, quantity, price, size, sugar, ice, temperature, boba)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)`,
        [orderId, item_id, quantity, price, size, sugar, ice, temperature, boba]
      );
    }

    return NextResponse.json({ message: "Order items added successfully", orderId });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  } finally {
    await client.end();
  }
}
