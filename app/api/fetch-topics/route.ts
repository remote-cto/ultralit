// app/api/fetch-topics/route.ts 
import { NextRequest, NextResponse } from "next/server";
import pool from "../../../utils/database";

export async function GET(req: NextRequest) {
  const client = await pool.connect();

  try {
    const result = await client.query(
      `SELECT id, name, description, topic_type 
       FROM topic 
       WHERE is_active = TRUE 
       ORDER BY name ASC`
    );

    return NextResponse.json({
      success: true,
      topics: result.rows,
    });
  } catch (error) {
    console.error("Error fetching topics:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch topics" },
      { status: 500 }
    );
  } finally {
    client.release();
  }
}

// Optional: If you need to create/update topics (admin functionality)
export async function POST(request: NextRequest) {
  const client = await pool.connect();
  
  try {
    const body = await request.json();
    const { name, description, topic_type, is_active = true } = body;

    if (!name) {
      return NextResponse.json(
        { success: false, error: "Topic name is required" },
        { status: 400 }
      );
    }

    const insertQuery = `
      INSERT INTO topic (name, description, topic_type, is_active, created_at, updated_at)
      VALUES ($1, $2, $3, $4, NOW(), NOW())
      RETURNING id, name, description, topic_type, is_active
    `;

    const { rows } = await client.query(insertQuery, [name, description, topic_type, is_active]);

    return NextResponse.json({
      success: true,
      topic: rows[0],
      message: "Topic created successfully"
    });

  } catch (error) {
    console.error("Error creating topic:", error);
    return NextResponse.json(
      { success: false, error: "Failed to create topic" },
      { status: 500 }
    );
  } finally {
    client.release();
  }
}