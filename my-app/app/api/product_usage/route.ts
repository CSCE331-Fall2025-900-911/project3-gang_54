import { NextRequest, NextResponse } from "next/server";
import { Client } from "pg";

export async function POST(request: NextRequest) {
  const { startDate, endDate } = await request.json();

  if (!startDate || !endDate) {
    return NextResponse.json(
      { error: "Missing startDate or endDate" },
      { status: 400 }
    );
  }

  const client = new Client({
    user: process.env.DB_user,
    host: process.env.DB_host,
    database: process.env.DB_name,
    password: process.env.DB_password,
    port: 5432,
  });

  try {
    await client.connect();

    const query = `
      SELECT ii.ingredient_id,
             ing.name AS ingredient_name,
             SUM(ii.servings_per_drink) AS total_used
      FROM sales_history s
      JOIN item_ingredients ii ON s.drink_id = ii.item_id
      JOIN ingredients ing ON ii.ingredient_id = ing.ingredient_id
      WHERE s.time BETWEEN $1 AND $2
      GROUP BY ii.ingredient_id, ing.name
      ORDER BY ii.ingredient_id;
    `;

    const result = await client.query(query, [startDate, endDate]);

    return NextResponse.json(result.rows);
  } catch (error) {
    console.error("Product usage error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  } finally {
    await client.end();
  }
}