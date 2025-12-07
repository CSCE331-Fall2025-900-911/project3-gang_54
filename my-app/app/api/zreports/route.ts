import { NextRequest, NextResponse } from "next/server";
import { Client, types } from "pg";

types.setTypeParser(1082, (val) => val);

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

    const result = await client.query(`
      SELECT 
        report_id,
        report_date,
        total_gross,
        total_discount,
        total_tax,
        total_net,
        void_count,
        return_count,
        cash_total,
        credit_total,
        debit_total,
        gift_card_total,
        mobile_pay_total,
        cashier_signatures
      FROM z_report
      ORDER BY report_date DESC, report_id DESC;
    `);

    return NextResponse.json(result.rows);
  } catch (error) {
    console.error("GET /zreports error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  } finally {
    await client.end();
  }
}

export async function POST(request: NextRequest) {
  const { date } = await request.json();

  if (!date) {
    return NextResponse.json({ error: "Missing date" }, { status: 400 });
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

    const aggregateQuery = `
      SELECT
        DATE(time) AS report_date,
        COALESCE(SUM(price), 0) AS total_gross,
        COALESCE(SUM(sale_discount), 0) AS total_discount,
        COALESCE(SUM(taxinformation), 0) AS total_tax,
        COALESCE(SUM(net_total), 0) AS total_net,
        COALESCE(SUM(CASE WHEN "void" = 1 THEN 1 ELSE 0 END), 0) AS void_count,
        COALESCE(SUM(CASE WHEN "return" = 1 THEN 1 ELSE 0 END), 0) AS return_count,
        COALESCE(SUM(CASE WHEN payment_method = 'cash' THEN net_total ELSE 0 END), 0) AS cash_total,
        COALESCE(SUM(CASE WHEN payment_method = 'credit' THEN net_total ELSE 0 END), 0) AS credit_total,
        COALESCE(SUM(CASE WHEN payment_method = 'debit' THEN net_total ELSE 0 END), 0) AS debit_total,
        COALESCE(SUM(CASE WHEN payment_method = 'gift_card' THEN net_total ELSE 0 END), 0) AS gift_card_total,
        COALESCE(SUM(CASE WHEN payment_method = 'mobile_pay' THEN net_total ELSE 0 END), 0) AS mobile_pay_total,
        COALESCE(string_agg(DISTINCT cashier_initials, ','), '') AS cashier_signatures
      FROM sales_history
      WHERE DATE(time) = $1
      GROUP BY report_date;
    `;

    const result = await client.query(aggregateQuery, [date]);

    if (result.rows.length === 0) {
      return NextResponse.json([]);
    }

    const r = result.rows[0];

    const insertQuery = `
      INSERT INTO z_report (
        report_date, total_gross, total_discount, total_tax, total_net,
        void_count, return_count, cash_total, credit_total, debit_total,
        gift_card_total, mobile_pay_total, cashier_signatures
      )
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13)
      RETURNING report_id, report_date, total_gross, total_discount,
                total_tax, total_net, void_count, return_count,
                cash_total, credit_total, debit_total, gift_card_total,
                mobile_pay_total, cashier_signatures;
    `;

    const inserted = await client.query(insertQuery, [
      date,
      r.total_gross,
      r.total_discount,
      r.total_tax,
      r.total_net,
      r.void_count,
      r.return_count,
      r.cash_total,
      r.credit_total,
      r.debit_total,
      r.gift_card_total,
      r.mobile_pay_total,
      r.cashier_signatures,
    ]);

    return NextResponse.json(inserted.rows);
  } catch (error) {
    console.error("Z-Report error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  } finally {
    await client.end();
  }
}