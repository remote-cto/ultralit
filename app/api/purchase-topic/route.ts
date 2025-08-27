// app/api/purchase-topic/route.ts - Corrected version
import { NextRequest, NextResponse } from "next/server";
import pool from "../../../utils/database";

export async function POST(request: NextRequest) {
  const client = await pool.connect();
  
  try {
    const { user_id, topic_id, plan_name, amount, payment_status, duration_days } = await request.json();

    console.log("Processing topic purchase:", {
      user_id,
      topic_id,
      plan_name,
      amount,
      payment_status,
      duration_days
    });

    // Check if topic is already purchased (using basic columns)
    const existingPurchase = await client.query(
      "SELECT * FROM user_topics WHERE user_id = $1 AND topic_id = $2",
      [user_id, topic_id]
    );

    if (existingPurchase.rows.length > 0) {
      return NextResponse.json({
        success: false,
        error: "Topic already purchased"
      }, { status: 400 });
    }

    // Calculate expiry date
    const expiryDate = new Date();
    if (duration_days === 9999) {
      expiryDate.setFullYear(2099); // Lifetime access
    } else if (duration_days) {
      expiryDate.setDate(expiryDate.getDate() + duration_days);
    } else {
      expiryDate.setDate(expiryDate.getDate() + 30); // Default 30 days
    }

    // Insert purchase record using basic columns that should exist
    const insertQuery = `
      INSERT INTO user_topics (user_id, topic_id, created_at, expires_at)
      VALUES ($1, $2, NOW(), $3)
      RETURNING *
    `;
    
    const result = await client.query(insertQuery, [
      user_id, 
      topic_id, 
      expiryDate
    ]);

    console.log("Topic purchase successful:", result.rows[0]);

    // Also insert into a separate purchases/payments table if you want to track payment details
    try {
      const paymentInsert = `
        INSERT INTO payments (user_id, topic_id, amount, currency, status, payment_method, payment_type, created_at, updated_at)
        VALUES ($1, $2, $3, 'INR', 'completed', 'free_trial', 'topic_purchase', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
        ON CONFLICT DO NOTHING
        RETURNING id
      `;
      
      await client.query(paymentInsert, [user_id, topic_id, amount || 0]);
    } catch (paymentError) {
      console.log("Payment record insertion failed (table might not exist):", paymentError);
      // Continue anyway since the main topic purchase succeeded
    }

    return NextResponse.json({
      success: true,
      purchase: result.rows[0],
      message: "Topic purchased successfully"
    });

  } catch (error) {
    console.error("Error purchasing topic:", error);
    return NextResponse.json({
      success: false,
      error: "Failed to purchase topic",
      details: process.env.NODE_ENV === "development" ? (error as Error).message : undefined
    }, { status: 500 });
  } finally {
    client.release();
  }
}

// GET method to fetch user's purchased topics
export async function GET(request: NextRequest) {
  const client = await pool.connect();
  
  try {
    const { searchParams } = new URL(request.url);
    const user_id = searchParams.get('user_id');

    if (!user_id) {
      return NextResponse.json({
        success: false,
        error: 'Missing user_id parameter'
      }, { status: 400 });
    }

    // Query to get user's topics with topic details
    const query = `
      SELECT 
        ut.*,
        t.name as topic_name,
        t.description as topic_description
      FROM user_topics ut
      LEFT JOIN topics t ON ut.topic_id = t.id
      WHERE ut.user_id = $1
      ORDER BY ut.created_at DESC
    `;
    
    const result = await client.query(query, [user_id]);

    return NextResponse.json({
      success: true,
      topics: result.rows,
      count: result.rows.length
    });

  } catch (error) {
    console.error('Error fetching user topics:', error);
    return NextResponse.json({
      success: false,
      error: 'Internal server error'
    }, { status: 500 });
  } finally {
    client.release();
  }
}