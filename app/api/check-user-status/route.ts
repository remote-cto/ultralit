// app/api/check-user-status/route.ts
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
        EXISTS(SELECT 1 FROM user_preferences WHERE user_id = $1) AS "hasPreferences",
        EXISTS(
          SELECT 1 
          FROM user_subscriptions 
          WHERE user_id = $2 
            AND status = 'active' 
            AND (next_renewal_date IS NULL OR next_renewal_date > NOW())
        ) AS "hasSubscription"
    `;

    const { rows } = await pool.query(query, [userId, userId]);

    if (rows.length > 0) {
      return NextResponse.json({
        success: true,
        hasPreferences: rows[0].hasPreferences,
        hasSubscription: rows[0].hasSubscription,
      });
    }

    return NextResponse.json({ success: false, error: "User not found" });
  } catch (error) {
    console.error("Error checking user status:", error);
    return NextResponse.json(
      { success: false, error: "Failed to check status" },
      { status: 500 }
    );
  }
}
