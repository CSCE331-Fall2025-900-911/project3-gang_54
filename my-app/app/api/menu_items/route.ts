import { NextRequest, NextResponse } from 'next/server';
import { Client } from 'pg';

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
        const result = await client.query('SELECT * FROM menu_items');
        return NextResponse.json(result.rows);
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
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
        await client.query('INSERT INTO menu_items (item_name, category, price) VALUES ($1, $2, $3)', [name, category, price]);

        const updatedResult = await client.query('SELECT * FROM menu_items');
        return NextResponse.json(updatedResult.rows);
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    } finally {
        await client.end();
    }
}
