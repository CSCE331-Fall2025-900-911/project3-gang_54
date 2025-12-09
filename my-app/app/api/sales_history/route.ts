import { NextRequest, NextResponse } from "next/server";
import { Client } from "pg";

export async function GET(req: NextRequest) {
  const client = new Client({
    user: process.env.DB_user,
    host: process.env.DB_host,
    database: process.env.DB_name,
    password: process.env.DB_password,
    port: 5432,
  });

  try {
    await client.connect();

    const { searchParams } = new URL(req.url);
    const orderId = searchParams.get("orderId");
    const limit = parseInt(searchParams.get("limit") || "50");

    let query = `
      SELECT 
        sh.orderid,
        sh.drinkid,
        sh.quantity,
        sh.price,
        sh.size,
        sh.sugar,
        sh.ice,
        sh.temperature,
        sh.boba,
        i.item_name,
        sh.timestamp
      FROM salesHistory sh
      JOIN items i ON sh.drinkid = i.item_id
    `;

    const params: any[] = [];
    if (orderId) {
      query += ` WHERE sh.orderid = $1`;
      params.push(orderId);
    }

    query += ` ORDER BY sh.timestamp DESC, sh.orderid DESC LIMIT $${params.length + 1}`;
    params.push(limit);

    const result = await client.query(query, params);

    // Group by orderId
    const ordersMap = new Map<number, any>();
    
    result.rows.forEach((row) => {
      const orderId = row.orderid;
      if (!ordersMap.has(orderId)) {
        ordersMap.set(orderId, {
          orderId,
          timestamp: row.timestamp,
          items: [],
          total: 0,
        });
      }
      
      const order = ordersMap.get(orderId)!;
      order.items.push({
        drinkId: row.drinkid,
        drinkName: row.item_name,
        quantity: row.quantity,
        price: parseFloat(row.price),
        size: row.size,
        sugar: row.sugar,
        ice: row.ice,
        temperature: row.temperature,
        boba: row.boba,
      });
      order.total += parseFloat(row.price) * row.quantity;
    });

    const orders = Array.from(ordersMap.values());
    return NextResponse.json(orders);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  } finally {
    await client.end();
  }
}

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
