// app/api/user-preference/route.ts

import { NextRequest, NextResponse } from "next/server";
import pool from "../../../utils/database";

export async function POST(req: NextRequest) {
  const client = await pool.connect();

  try {
    const body = await req.json();
    const { user_id, role, industry, language, preferred_mode, frequency } = body;

    // Validation - removed topic_ids requirement
    if (!user_id || !role || !industry || !language || !preferred_mode || !frequency) {
      return NextResponse.json(
        { success: false, error: "Missing required fields" },
        { status: 400 }
      );
    }

    await client.query("BEGIN");

    // Check if user preferences already exist
    const existingPrefQuery = `
      SELECT id FROM user_preferences WHERE user_id = $1
    `;
    const existingResult = await client.query(existingPrefQuery, [user_id]);

    let preferenceId;

    if (existingResult.rows.length > 0) {
      // Update existing preferences
      preferenceId = existingResult.rows[0].id;
      const updatePrefQuery = `
        UPDATE user_preferences 
        SET role = $2, industry = $3, language = $4, preferred_mode = $5, frequency = $6, updated_at = CURRENT_TIMESTAMP
        WHERE user_id = $1
        RETURNING id
      `;
      await client.query(updatePrefQuery, [
        user_id, role, industry, language, preferred_mode, frequency
      ]);
    } else {
      // Insert new preferences
      const insertPrefQuery = `
        INSERT INTO user_preferences 
          (user_id, role, industry, language, preferred_mode, frequency) 
        VALUES ($1, $2, $3, $4, $5, $6)
        RETURNING id
      `;
      const prefResult = await client.query(insertPrefQuery, [
        user_id, role, industry, language, preferred_mode, frequency
      ]);
      preferenceId = prefResult.rows[0].id;
    }

    await client.query("COMMIT");

    return NextResponse.json({ 
      success: true, 
      preferenceId,
      message: "User preferences saved successfully" 
    });
  } catch (error) {
    await client.query("ROLLBACK");
    console.error("Error saving preferences:", error);
    return NextResponse.json(
      { success: false, error: "Failed to save preferences" },
      { status: 500 }
    );
  } finally {
    client.release();
  }
}