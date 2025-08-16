import { NextRequest, NextResponse } from "next/server";
import pool from "../../../utils/database";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { user_id, role, industry, language, preferred_mode, frequency } = body;

    if (!user_id) {
      return NextResponse.json({ success: false, error: "User ID required" }, { status: 400 });
    }

    const query = `
      UPDATE user_preferences
      SET role = $1,
          industry = $2,
          language = $3,
          preferred_mode = $4,
          frequency = $5,
          updated_at = NOW()
      WHERE user_id = $6
      RETURNING *;
    `;

    const { rows } = await pool.query(query, [role, industry, language, preferred_mode, frequency, user_id]);

    if (rows.length > 0) {
      return NextResponse.json({ success: true, preferences: rows[0] });
    } else {
      return NextResponse.json({ success: false, error: "No preferences found" });
    }
  } catch (err) {
    console.error("Error updating preferences:", err);
    return NextResponse.json({ success: false, error: "Failed to update preferences" }, { status: 500 });
  }
}
