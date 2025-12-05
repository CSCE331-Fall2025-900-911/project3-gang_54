import { NextRequest, NextResponse } from "next/server";
import { Client } from "pg";

export async function POST(request: NextRequest) {
  const { date } = await request.json();

  if (!date) {
    return NextResponse.json(
      { error: "Missing date" },
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

    const sql = `
      SELECT
        EXTRACT(HOUR FROM time) AS hour_of_day,
        COUNT(*) AS num_orders,
        ROUND(SUM(price), 2) AS total_sales,
        SUM(CASE WHEN "return" = 1 THEN 1 ELSE 0 END) AS returns,
        SUM(CASE WHEN "void" = 1 THEN 1 ELSE 0 END) AS voids,
        ROUND(SUM(CASE WHEN payment_method = 'cash' THEN net_total ELSE 0 END), 2) AS cash_total,
        ROUND(SUM(CASE WHEN payment_method = 'credit' THEN net_total ELSE 0 END), 2) AS credit_total,
        ROUND(SUM(CASE WHEN payment_method = 'debit' THEN net_total ELSE 0 END), 2) AS debit_total,
        ROUND(SUM(CASE WHEN payment_method = 'gift_card' THEN net_total ELSE 0 END), 2) AS gift_card_total,
        ROUND(SUM(CASE WHEN payment_method = 'mobile_pay' THEN net_total ELSE 0 END), 2) AS mobile_pay_total
      FROM sales_history
      WHERE DATE(time) = $1
      GROUP BY hour_of_day
      ORDER BY hour_of_day;
    `;

    const result = await client.query(sql, [date]);

    const formatted = result.rows.map((r: any) => ({
      hour: `${String(r.hour_of_day).padStart(2, "0")}:00`,
      orders: Number(r.num_orders),
      total_sales: Number(r.total_sales).toFixed(2),
      returns: Number(r.returns),
      voids: Number(r.voids),
      cash_total: Number(r.cash_total).toFixed(2),
      credit_total: Number(r.credit_total).toFixed(2),
      debit_total: Number(r.debit_total).toFixed(2),
      gift_card_total: Number(r.gift_card_total).toFixed(2),
      mobile_pay_total: Number(r.mobile_pay_total).toFixed(2),
    }));

    return NextResponse.json(formatted);
  } catch (error) {
    console.error("X-Report error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  } finally {
    await client.end();
  }
}
