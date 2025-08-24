
// /api/update-topics/route.ts
import { NextRequest, NextResponse } from "next/server";
import pool from "../../../utils/database";

export async function POST(request: NextRequest) {
  const client = await pool.connect();

  try {
    const body = await request.json();
    const { user_id, topic_ids } = body;

    // Debug logging
    console.log("Update user topics request:", {
      user_id,
      topic_ids,
      topic_ids_type: typeof topic_ids,
      topic_ids_array: Array.isArray(topic_ids),
    });

    // Validate required fields
    if (!user_id || !topic_ids || !Array.isArray(topic_ids) || topic_ids.length === 0) {
      console.error("Missing required fields or invalid topic_ids");
      return NextResponse.json(
        {
          success: false,
          error: "Missing required fields or invalid topic_ids",
        },
        { status: 400 }
      );
    }

    // Convert and validate topic_ids are valid numbers
    const validTopicIds: number[] = [];
    const invalidTopicIds: any[] = [];

    for (const id of topic_ids) {
      const numId = Number(id);
      if (Number.isInteger(numId) && numId > 0) {
        validTopicIds.push(numId);
      } else {
        invalidTopicIds.push(id);
      }
    }

    if (invalidTopicIds.length > 0) {
      console.error("Invalid topic IDs found:", invalidTopicIds);
      return NextResponse.json(
        { success: false, error: "Invalid topic IDs provided" },
        { status: 400 }
      );
    }

    if (validTopicIds.length === 0) {
      console.error("No valid topic IDs provided");
      return NextResponse.json(
        { success: false, error: "No valid topic IDs provided" },
        { status: 400 }
      );
    }

    // Start transaction
    await client.query("BEGIN");
    console.log("Database transaction started");

    // First, remove existing user topics
    console.log("Removing existing user topics");
    const deleteResult = await client.query(
      "DELETE FROM user_topics WHERE user_id = $1",
      [user_id]
    );
    console.log(`Removed ${deleteResult.rowCount} existing user topics`);

    // Insert new user topics
    console.log("Inserting new user topics");
    let insertedCount = 0;

    for (const topicId of validTopicIds) {
      const insertResult = await client.query(
        `
        INSERT INTO user_topics (user_id, topic_id)
        VALUES ($1, $2)
        ON CONFLICT (user_id, topic_id) DO NOTHING
      `,
        [user_id, topicId]
      );

      if (insertResult.rowCount && insertResult.rowCount > 0) {
        insertedCount++;
      }
    }

    console.log(`Successfully inserted ${insertedCount} user topics`);

    // Commit transaction
    await client.query("COMMIT");
    console.log("Transaction committed successfully");

    return NextResponse.json({
      success: true,
      message: "User topics updated successfully",
      updated_count: insertedCount,
    });
  } catch (error) {
    console.error("Error updating user topics:", error);

    try {
      await client.query("ROLLBACK");
      console.log("Transaction rolled back");
    } catch (rollbackError) {
      console.error("Rollback error:", rollbackError);
    }

    return NextResponse.json(
      {
        success: false,
        error: "Failed to update user topics",
        details:
          process.env.NODE_ENV === "development"
            ? (error as Error).message
            : undefined,
      },
      { status: 500 }
    );
  } finally {
    client.release();
    console.log("Database connection released");
  }
}
