// app/api/user-preferences/route.ts

import { NextRequest, NextResponse } from "next/server";
import pool from "../../../utils/database";

export async function POST(req: NextRequest) {
  const client = await pool.connect();

  try {
    const body = await req.json();
    const { user_id, role, industry, language, preferred_mode, frequency, topic_ids } = body;

    if (!user_id || !role || !industry || !language || !preferred_mode || !frequency || !topic_ids?.length) {
      return NextResponse.json(
        { success: false, error: "Missing required fields" },
        { status: 400 }
      );
    }

    await client.query("BEGIN");

    // Insert into user_preferences
    const insertPrefQuery = `
      INSERT INTO user_preferences 
        (user_id, role, industry, language, preferred_mode, frequency) 
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING id
    `;
    const prefResult = await client.query(insertPrefQuery, [
      user_id, role, industry, language, preferred_mode, frequency
    ]);
    const preferenceId = prefResult.rows[0].id;

    // Insert topics into user_preference_topics
    const insertTopicQuery = `
      INSERT INTO user_preference_topics (user_preference_id, topic_id)
      VALUES ($1, $2)
    `;
    for (const topic_id of topic_ids) {
      await client.query(insertTopicQuery, [preferenceId, topic_id]);
    }

    await client.query("COMMIT");

    return NextResponse.json({ success: true });
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