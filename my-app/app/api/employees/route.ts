import { NextResponse } from "next/server";
import { Pool, types } from "pg";

types.setTypeParser(1082, (val) => val);

const connectionString =
  `postgres://${process.env.DB_user}:${process.env.DB_password}` +
  `@${process.env.DB_host}:5432/${process.env.DB_name}`;

const pool = new Pool({
  connectionString,
  ssl: { rejectUnauthorized: false },
});

export async function GET() {
  try {
    const result = await pool.query(
      "SELECT * FROM employees ORDER BY employee_id ASC"
    );
    return NextResponse.json(result.rows);
  } catch (err: any) {
    console.error("GET /employees error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const {
      name,
      phone_number,
      email,
      role,
      hire_date,
      salary,
      status,
      address,
      date_of_birth,
    } = await req.json();

    const result = await pool.query(
      `INSERT INTO employees 
        (name, phone_number, email, role, hire_date, salary, status, address, date_of_birth)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)
       RETURNING *`,
      [
        name,
        phone_number,
        email,
        role,
        hire_date,
        salary,
        status,
        address,
        date_of_birth,
      ]
    );

    return NextResponse.json(result.rows[0]);
  } catch (err: any) {
    console.error("POST /employees error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const {
      employee_id,
      name,
      phone_number,
      email,
      role,
      hire_date,
      salary,
      status,
      address,
      date_of_birth,
    } = await req.json();

    await pool.query(
      `UPDATE employees 
       SET name = $1,
           phone_number = $2,
           email = $3,
           role = $4,
           hire_date = $5,
           salary = $6,
           status = $7,
           address = $8,
           date_of_birth = $9
       WHERE employee_id = $10`,
      [
        name,
        phone_number,
        email,
        role,
        hire_date,
        salary,
        status,
        address,
        date_of_birth,
        employee_id,
      ]
    );

    const updated = await pool.query(
      "SELECT * FROM employees ORDER BY employee_id ASC"
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
