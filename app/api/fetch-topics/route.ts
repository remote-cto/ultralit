//app/api/fetch-topics

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
