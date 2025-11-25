import { NextResponse } from "next/server";
import { Pool } from "pg";

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

export async function GET() {
  try {
    const result = await pool.query(
      "SELECT employee_id, name, role FROM employees ORDER BY employee_id ASC"
    );
    return NextResponse.json(result.rows);
  } catch (err: any) {
    console.error("GET /employees error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const { name, role } = await req.json();

    const result = await pool.query(
      "INSERT INTO employees (name, role) VALUES ($1, $2) RETURNING *",
      [name, role]
    );

    return NextResponse.json(result.rows[0]);
  } catch (err: any) {
    console.error("POST /employees error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const { id, name, role } = await req.json();

    await pool.query(
      "UPDATE employees SET name = $1, role = $2 WHERE employee_id = $3",
      [name, role, id]
    );

    const updated = await pool.query(
      "SELECT employee_id, name, role FROM employees ORDER BY employee_id ASC"
    );

    return NextResponse.json(updated.rows);
  } catch (err: any) {
    console.error("PUT /employees error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const { id } = await req.json();

    await pool.query("DELETE FROM employees WHERE employee_id = $1", [id]);

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("DELETE /employees error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
