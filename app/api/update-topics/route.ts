// app/api/update-topics/route.ts

import { NextRequest, NextResponse } from "next/server";
import pool from "../../../utils/database";

// -------------------- POST --------------------
export async function POST(req: NextRequest) {
  const client = await pool.connect();

  try {
    const body = await req.json();
    const { user_id, topic_ids } = body;

    // Validation
    if (!user_id || !topic_ids || !Array.isArray(topic_ids) || topic_ids.length === 0) {
      return NextResponse.json(
        { success: false, error: "Missing required fields or invalid topic_ids" },
        { status: 400 }
      );
    }

    await client.query("BEGIN");

    // Get user preference ID
    const prefQuery = `
      SELECT id FROM user_preferences WHERE user_id = $1
    `;
    const prefResult = await client.query(prefQuery, [user_id]);

    if (prefResult.rows.length === 0) {
      return NextResponse.json(
        { success: false, error: "User preferences not found. Please complete preferences first." },
        { status: 404 }
      );
    }

    const preferenceId = prefResult.rows[0].id;

    // Delete existing topic preferences
    const deleteQuery = `
      DELETE FROM user_preference_topics WHERE user_preference_id = $1
    `;
    await client.query(deleteQuery, [preferenceId]);

    // Insert new topic preferences (⚡ removed created_at column)
    const insertTopicQuery = `
      INSERT INTO user_preference_topics (user_preference_id, topic_id)
      VALUES ($1, $2)
    `;

    for (const rawTopicId of topic_ids) {
      const topic_id = parseInt(rawTopicId, 10);

      if (isNaN(topic_id)) {
        throw new Error(`Invalid topic_id: ${rawTopicId}`);
      }

      await client.query(insertTopicQuery, [preferenceId, topic_id]);
    }

    await client.query("COMMIT");

    return NextResponse.json({
      success: true,
      message: "Topics updated successfully",
      topicCount: topic_ids.length,
    });
  } catch (error) {
    await client.query("ROLLBACK");
    console.error("Error updating topics:", error);
    return NextResponse.json(
      { success: false, error: "Failed to update topics" },
      { status: 500 }
    );
  } finally {
    client.release();
  }
}

// -------------------- GET --------------------
export async function GET(req: NextRequest) {
  const client = await pool.connect();

  try {
    const { searchParams } = new URL(req.url);
    const user_id = searchParams.get("user_id");

    if (!user_id) {
      return NextResponse.json(
        { success: false, error: "user_id is required" },
        { status: 400 }
      );
    }

    const query = `
      SELECT t.id, t.name, t.description, t.topic_type
      FROM user_preference_topics upt
      JOIN user_preferences up ON upt.user_preference_id = up.id
      JOIN topics t ON upt.topic_id = t.id
      WHERE up.user_id = $1
      ORDER BY t.name
    `;

    const result = await client.query(query, [user_id]);

    return NextResponse.json({
      success: true,
      topics: result.rows,
    });
  } catch (error) {
    console.error("Error fetching user topics:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch topics" },
      { status: 500 }
    );
  } finally {
    client.release();
  }
}
