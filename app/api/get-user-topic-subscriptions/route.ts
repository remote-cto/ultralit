// app/api/get-user-topic-subscriptions/route.ts

import { NextRequest, NextResponse } from "next/server";
import pool from "../../../utils/database";

export async function GET(req: NextRequest) {
  const client = await pool.connect();

  try {
    const { searchParams } = new URL(req.url);
    const user_id = searchParams.get("user_id");

    if (!user_id) {
      return NextResponse.json(
        { success: false, error: "User ID is required" },
        { status: 400 }
      );
    }

    const query = `
      SELECT 
        ut.topic_id,
        t.name as topic_name,
        ut.subscribed_at,
        ut.status
      FROM user_topics ut
      LEFT JOIN topics t ON ut.topic_id = t.id
      WHERE ut.user_id = $1
      ORDER BY ut.subscribed_at DESC
    `;

    const { rows } = await client.query(query, [user_id]);

    return NextResponse.json({ success: true, topics: rows });
  } catch (error) {
    console.error("Error fetching user topic subscriptions:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch topic subscriptions" },
      { status: 500 }
    );
  } finally {
    client.release();
  }
}
