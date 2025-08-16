//app/api/get-user-preferences
// app/api/get-user-preferences/route.ts

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
      SELECT 
        up.role,
        up.industry,
        up.language,
        up.preferred_mode,
        up.frequency,
        COALESCE(
          json_agg(
            json_build_object(
              'id', ut.topic_id,
              'name', t.name,
              'description', t.description,
              'topic_type', t.topic_type
            )
          ) FILTER (WHERE ut.topic_id IS NOT NULL), 
          '[]'
        ) AS topics
      FROM user_preferences up
      LEFT JOIN user_topics ut ON up.user_id = ut.user_id
      LEFT JOIN topics t ON ut.topic_id = t.id
      WHERE up.user_id = $1
      GROUP BY up.id, up.role, up.industry, up.language, up.preferred_mode, up.frequency
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
