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
        { success: false, error: "Missing required fields: user_id and topic_ids array" },
        { status: 400 }
      );
    }

    await client.query("BEGIN");

    // Check if user exists and get current subscription status
    const userCheckQuery = `
      SELECT 
        u.id as user_id,
        u.name,
        u.email,
        s.id as subscription_id,
        s.plan_name,
        s.status as subscription_status,
        s.is_active
      FROM users u
      LEFT JOIN subscriptions s ON u.id = s.user_id 
        AND s.is_active = true 
        AND s.status = 'active'
      WHERE u.id = $1
    `;
    
    const userResult = await client.query(userCheckQuery, [user_id]);
    
    if (userResult.rows.length === 0) {
      await client.query("ROLLBACK");
      return NextResponse.json({
        success: false,
        error: 'User not found'
      }, { status: 404 });
    }

    const user = userResult.rows[0];
    const hasActiveSubscription = user.subscription_id && user.is_active && user.subscription_status === 'active';

    // Check if user preferences exist (optional - create if not exists)
    const prefQuery = `
      SELECT id FROM user_preferences WHERE user_id = $1
    `;
    const prefResult = await client.query(prefQuery, [user_id]);

    if (prefResult.rows.length === 0) {
      await client.query("ROLLBACK");
      return NextResponse.json(
        { success: false, error: "User preferences not found. Please complete preferences first." },
        { status: 404 }
      );
    }

    // Get existing topic selections for this user (using user_id directly)
    const existingTopicsQuery = `
      SELECT topic_id FROM user_topics WHERE user_id = $1
    `;
    const existingTopicsResult = await client.query(existingTopicsQuery, [user_id]);
    const existingTopicIds = existingTopicsResult.rows.map(row => parseInt(row.topic_id));

    // Check which topics are new
    const newTopicIds = topic_ids.filter(topicId => !existingTopicIds.includes(parseInt(topicId)));
    const duplicateTopics = topic_ids.filter(topicId => existingTopicIds.includes(parseInt(topicId)));

    // Validate that all new topic IDs exist in the topics table
    if (newTopicIds.length > 0) {
      const topicValidationQuery = `
        SELECT id FROM topics WHERE id = ANY($1)
      `;
      const validTopicsResult = await client.query(topicValidationQuery, [newTopicIds.map(id => parseInt(id))]);
      
      if (validTopicsResult.rows.length !== newTopicIds.length) {
        const validTopicIds = validTopicsResult.rows.map(row => parseInt(row.id));
        const invalidTopicIds = newTopicIds.filter(id => !validTopicIds.includes(parseInt(id)));
        await client.query("ROLLBACK");
        return NextResponse.json({
          success: false,
          error: `Invalid topic IDs: ${invalidTopicIds.join(', ')}`
        }, { status: 400 });
      }
    }

    // If user has active subscription, add topics directly
    if (hasActiveSubscription && newTopicIds.length > 0) {
      // Insert new topic preferences only (using user_id directly)
      const insertTopicQuery = `
        INSERT INTO user_topics (user_id, topic_id)
        VALUES ($1, $2)
      `;

      for (const rawTopicId of newTopicIds) {
        const topic_id = parseInt(rawTopicId, 10);
        if (isNaN(topic_id)) {
          throw new Error(`Invalid topic_id: ${rawTopicId}`);
        }
        await client.query(insertTopicQuery, [user_id, topic_id]);
      }

      await client.query("COMMIT");

      return NextResponse.json({
        success: true,
        message: 'Topics added successfully to your active subscription',
        data: {
          user_id,
          new_topics_added: newTopicIds.length,
          duplicate_topics: duplicateTopics.length,
          has_active_subscription: true,
          subscription_plan: user.plan_name
        }
      });
    }

    // If user doesn't have active subscription, store topics for later activation
    if (newTopicIds.length > 0) {
      // Delete existing topic preferences and insert all selected topics (using user_id)
      const deleteQuery = `
        DELETE FROM user_topics WHERE user_id = $1
      `;
      await client.query(deleteQuery, [user_id]);

      // Insert all topic preferences (both existing and new) (using user_id)
      const insertTopicQuery = `
        INSERT INTO user_topics (user_id, topic_id)
        VALUES ($1, $2)
      `;

      for (const rawTopicId of topic_ids) {
        const topic_id = parseInt(rawTopicId, 10);
        if (isNaN(topic_id)) {
          throw new Error(`Invalid topic_id: ${rawTopicId}`);
        }
        await client.query(insertTopicQuery, [user_id, topic_id]);
      }
    }

    await client.query("COMMIT");

    return NextResponse.json({
      success: true,
      message: hasActiveSubscription 
        ? 'Topics updated successfully' 
        : 'Topic selection saved. Please complete payment to activate.',
      data: {
        user_id,
        topics_selected: topic_ids.length,
        new_topics_added: newTopicIds.length,
        duplicate_topics: duplicateTopics.length,
        has_active_subscription: hasActiveSubscription,
        subscription_plan: user.plan_name || null
      }
    });

  } catch (error) {
    await client.query("ROLLBACK");
    console.error("Error in update-topics API:", error);
    return NextResponse.json({
      success: false,
      error: "Internal server error",
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    }, { status: 500 });
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
        { success: false, error: "Missing user_id parameter" },
        { status: 400 }
      );
    }

    // Updated query to use user_id directly instead of user_preference_id
    const query = `
      SELECT 
        t.id,
        t.name,
        t.description,
        t.topic_type
      FROM user_topics ut
      JOIN topics t ON ut.topic_id = t.id
      WHERE ut.user_id = $1
      ORDER BY t.name
    `;

    const result = await client.query(query, [user_id]);

    return NextResponse.json({
      success: true,
      topics: result.rows,
      count: result.rows.length
    });

  } catch (error) {
    console.error("Error fetching user topics:", error);
    return NextResponse.json({
      success: false,
      error: "Internal server error",
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    }, { status: 500 });
  } finally {
    client.release();
  }
}