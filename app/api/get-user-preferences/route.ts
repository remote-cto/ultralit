import { NextRequest, NextResponse } from "next/server";
import pool from "../../../utils/database";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("user_id");

    if (!userId) {
      return NextResponse.json(
        { success: false, error: "User ID is required" },
        { status: 400 }
      );
    }

    const query = `
      SELECT up.role,
             up.industry,
             up.language,
             up.preferred_mode,
             up.frequency,
             COALESCE(json_agg(upt.topic_id) FILTER (WHERE upt.topic_id IS NOT NULL), '[]') AS topic_ids
      FROM user_preferences up
      LEFT JOIN user_preference_topics upt
        ON up.id = upt.user_preference_id
      WHERE up.user_id = $1
      GROUP BY up.id
      ORDER BY up.created_at DESC
      LIMIT 1
    `;

    const { rows } = await pool.query(query, [userId]);

    if (rows.length > 0) {
      return NextResponse.json({
        success: true,
        preferences: rows[0],
      });
    } else {
      return NextResponse.json({
        success: false,
        error: "No preferences found",
      });
    }
  } catch (error) {
    console.error("Error fetching user preferences:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch preferences" },
      { status: 500 }
    );
  }
}
