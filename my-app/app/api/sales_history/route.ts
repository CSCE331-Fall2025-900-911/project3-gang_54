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
      FROM sales_history sh
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
    console.error("Error in GET /api/sales_history:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ 
      error: "Internal Server Error",
      details: errorMessage 
    }, { status: 500 });
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

    // Validate all items before processing
    for (const item of items) {
      if (!item.item_id || !item.price) {
        return NextResponse.json({ 
          error: "Invalid item data",
          details: `Missing required fields: item_id=${item.item_id}, price=${item.price}` 
        }, { status: 400 });
      }
    }

    // Get the next orderId
    const res = await client.query(`SELECT COALESCE(MAX(orderid), 0) + 1 AS nextOrderId FROM sales_history`);
    const orderId = res.rows[0].nextorderid;

    for (const item of items) {
      const { item_id, quantity, price, size, sugar, ice, temperature, boba } = item;

      // Ensure all values are properly formatted
      const itemIdInt = parseInt(item_id);
      const quantityInt = parseInt(quantity) || 1;
      const priceFloat = parseFloat(price);
      
      if (isNaN(itemIdInt) || isNaN(priceFloat)) {
        throw new Error(`Invalid item data: item_id=${item_id} (parsed: ${itemIdInt}), price=${price} (parsed: ${priceFloat})`);
      }

      const values = [
        orderId,
        itemIdInt,
        quantityInt,
        priceFloat,
        String(size || 'Regular'),
        String(sugar || 'Regular'),
        String(ice || 'Regular'),
        String(temperature || 'Regular'),
        String(boba || 'None')
      ];

      console.log(`Inserting order item:`, { orderId, values });

      try {
        await client.query(
          `INSERT INTO sales_history
           (orderid, drinkid, quantity, price, size, sugar, ice, temperature, boba)
           VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)`,
          values
        );
      } catch (insertError) {
        console.error(`Failed to insert item:`, { item, values, error: insertError });
        throw insertError;
      }
    }

    return NextResponse.json({ message: "Order items added successfully", orderId });
  } catch (error) {
    console.error("Error in POST /api/sales_history:", error);
    
    // Get more detailed error information
    let errorMessage = "Unknown error";
    let errorCode = null;
    let errorDetail = null;
    
    if (error instanceof Error) {
      errorMessage = error.message;
      // Check if it's a PostgreSQL error
      if ('code' in error) {
        errorCode = (error as any).code;
      }
      if ('detail' in error) {
        errorDetail = (error as any).detail;
      }
      if ('constraint' in error) {
        errorDetail = `Constraint violation: ${(error as any).constraint}`;
      }
    }
    
    console.error("Full error details:", {
      message: errorMessage,
      code: errorCode,
      detail: errorDetail,
      error: error
    });
    
    return NextResponse.json({ 
      error: "Internal Server Error",
      details: errorMessage,
      code: errorCode,
      constraint: errorDetail
    }, { status: 500 });
  } finally {
    await client.end();
  }
}
