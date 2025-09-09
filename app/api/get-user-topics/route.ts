// // app/api/get-user-topics/route.ts

// import { NextRequest, NextResponse } from "next/server";
// import pool from "../../../utils/database";

// interface UserTopic {
//   topic_id: number;
//   topic_name: string;
//   payment_status: string;
//   purchased_date: string;
//   expires_at: string | null;
//   amount_paid: number;
//   plan_name: string;
//   status: string;
//   payment_id?: string;
//   topic_description?: string;
//   topic_type?: string;
// }

// export async function GET(req: NextRequest) {
//   const client = await pool.connect();

//   try {
//     const { searchParams } = new URL(req.url);
//     const user_id = searchParams.get("user_id");

//     if (!user_id) {
//       return NextResponse.json(
//         { success: false, error: "User ID is required" },
//         { status: 400 }
//       );
//     }

//     console.log("Fetching topics for user:", user_id);

//     // Get user's purchased topics with payment information
//     // This query is now fixed to prevent duplicates by correctly joining with the latest payment per topic.
//     const topicsQuery = `
//       SELECT
//         ut.topic_id,
//         t.name as topic_name,
//         t.description as topic_description,
//         t.topic_type,
//         ut.created_at as purchased_date,
//         ut.expires_at,
//         COALESCE(p.amount, 0) as amount_paid,
//         COALESCE(p.status, 'completed') as payment_status,
//         CASE 
//           WHEN ut.expires_at IS NULL THEN 'Lifetime'
//           WHEN ut.expires_at > CURRENT_TIMESTAMP THEN 'Premium'
//           ELSE 'Free'
//         END as plan_name,
//         CASE 
//           WHEN ut.expires_at IS NULL THEN 'active'
//           WHEN ut.expires_at > CURRENT_TIMESTAMP THEN 'active'
//           ELSE 'expired'
//         END as status,
//         p.razorpay_payment_id as payment_id
//       FROM user_topics ut
//       JOIN topics t ON ut.topic_id = t.id
//       LEFT JOIN (
//         SELECT
//           *,
//           ROW_NUMBER() OVER(PARTITION BY user_id, topic_id ORDER BY created_at DESC) as rn
//         FROM payments
//       ) p ON p.user_id = ut.user_id AND p.topic_id = ut.topic_id AND p.rn = 1
//       WHERE ut.user_id = $1
//       ORDER BY ut.created_at DESC
//     `;

//     const result = await client.query(topicsQuery, [user_id]);

//     console.log(`Found ${result.rows.length} topics for user ${user_id}`);

//     // If no direct topic purchases found, check if user has subscription-based access
//     if (result.rows.length === 0) {
//       console.log("No direct topic purchases found, checking subscription-based access...");
      
//       // Check if user has active subscription and selected topics
//       const subscriptionTopicsQuery = `
//         SELECT DISTINCT
//           ucd.topic_id,
//           t.name as topic_name,
//           t.description as topic_description,
//           t.topic_type,
//           s.created_at as purchased_date,
//           s.next_renewal_date as expires_at,
//           s.amount as amount_paid,
//           'completed' as payment_status,
//           s.plan_name,
//           CASE 
//             WHEN s.status = 'active' AND s.is_active = true THEN 'active'
//             ELSE 'expired'
//           END as status,
//           NULL as payment_id
//         FROM user_content_delivery ucd
//         JOIN topics t ON ucd.topic_id = t.id
//         JOIN subscriptions s ON s.user_id = ucd.user_id
//         WHERE ucd.user_id = $1 
//           AND s.status = 'active' 
//           AND s.is_active = true
//         ORDER BY s.created_at DESC
//       `;

//       const subscriptionResult = await client.query(subscriptionTopicsQuery, [user_id]);
//       console.log(`Found ${subscriptionResult.rows.length} subscription-based topics`);

//       return NextResponse.json({
//         success: true,
//         topics: subscriptionResult.rows as UserTopic[],
//         count: subscriptionResult.rows.length,
//         source: 'subscription'
//       });
//     }

//     const topics = result.rows.map(row => ({
//       topic_id: parseInt(row.topic_id),
//       topic_name: row.topic_name,
//       topic_description: row.topic_description,
//       topic_type: row.topic_type,
//       payment_status: row.payment_status,
//       purchased_date: row.purchased_date,
//       expires_at: row.expires_at,
//       amount_paid: parseFloat(row.amount_paid) || 0,
//       plan_name: row.plan_name,
//       status: row.status,
//       payment_id: row.payment_id
//     })) as UserTopic[];

//     return NextResponse.json({
//       success: true,
//       topics,
//       count: topics.length,
//       source: 'direct_purchase'
//     });

//   } catch (error) {
//     console.error("Error fetching user topics:", error);
//     return NextResponse.json(
//       {
//         success: false,
//         error: "Failed to fetch user topics",
//         details:
//           process.env.NODE_ENV === "development"
//             ? (error as Error).message
//             : undefined,
//       },
//       { status: 500 }
//     );
//   } finally {
//     client.release();
//   }
// }

// // POST method to add a topic to user's account (for free topics or manual additions)
// export async function POST(req: NextRequest) {
//   const client = await pool.connect();

//   try {
//     const body = await req.json();
//     const { user_id, topic_id, plan_type = 'Free', expires_at = null } = body;

//     if (!user_id || !topic_id) {
//       return NextResponse.json(
//         { success: false, error: "user_id and topic_id are required" },
//         { status: 400 }
//       );
//     }

//     // Check if topic already exists for user
//     const existingCheck = await client.query(
//       "SELECT id FROM user_topics WHERE user_id = $1 AND topic_id = $2",
//       [user_id, topic_id]
//     );

//     if (existingCheck.rows.length > 0) {
//       return NextResponse.json(
//         { success: false, error: "Topic already added to user account" },
//         { status: 409 } // 409 Conflict is more appropriate here
//       );
//     }

//     // Add topic to user account
//     const insertQuery = `
//       INSERT INTO user_topics (user_id, topic_id, created_at, expires_at)
//       VALUES ($1, $2, CURRENT_TIMESTAMP, $3)
//       RETURNING *
//     `;

//     const result = await client.query(insertQuery, [user_id, topic_id, expires_at]);

//     return NextResponse.json({
//       success: true,
//       message: "Topic added successfully",
//       topic: result.rows[0]
//     });

//   } catch (error) {
//     console.error("Error adding topic to user:", error);
//     return NextResponse.json(
//       {
//         success: false,
//         error: "Failed to add topic",
//         details:
//           process.env.NODE_ENV === "development"
//             ? (error as Error).message
//             : undefined,
//       },
//       { status: 500 }
//     );
//   } finally {
//     client.release();
//   }
// }


// app/api/get-user-topics/route.ts

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

    console.log("Fetching topics for user:", user_id);

    // NEW, SIMPLIFIED QUERY
    // This correctly reads all purchase data directly from user_topics
    // and joins with topics to get the name and description.
    const query = `
      SELECT 
        ut.topic_id,
        ut.plan_name,
        ut.payment_status,
        ut.purchased_date,
        ut.amount_paid,
        ut.expires_at,
        t.name as topic_name,
        t.description as topic_description,
        t.topic_type,
        CASE 
          WHEN ut.expires_at IS NULL THEN 'active'
          WHEN ut.expires_at > CURRENT_TIMESTAMP THEN 'active'
          ELSE 'expired'
        END as status
      FROM user_topics ut
      JOIN topics t ON ut.topic_id = t.id
      WHERE ut.user_id = $1
      ORDER BY ut.purchased_date DESC;
    `;

    const result = await client.query(query, [user_id]);

    console.log(`Found ${result.rows.length} topics for user ${user_id}`);

    return NextResponse.json({
      success: true,
      topics: result.rows,
      count: result.rows.length,
    });
    
  } catch (error) {
    console.error("Error fetching user topics:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch user topics",
        details:
          process.env.NODE_ENV === "development"
            ? (error as Error).message
            : undefined,
      },
      { status: 500 }
    );
  } finally {
    client.release();
  }
}