//app/api/activate-trial/route.ts

import { NextRequest, NextResponse } from "next/server";
import pool from "../../../utils/database";

export async function POST(req: NextRequest) {
  const client = await pool.connect();

  try {
    const {
      user_id,
      plan_name,
      preferences,
    } = await req.json();

    // Debug logging
    console.log("Free trial activation request:", {
      user_id,
      plan_name,
      preferences,
    });

    // Validate required fields
    if (!user_id || !plan_name) {
      console.error("Missing required fields");
      return NextResponse.json(
        { success: false, error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Validate that this is actually a free trial request
    if (plan_name !== "Free Trial") {
      console.error("Invalid plan for free trial activation:", plan_name);
      return NextResponse.json(
        { success: false, error: "Invalid plan for free trial" },
        { status: 400 }
      );
    }

    // Start transaction
    await client.query("BEGIN");
    console.log("Database transaction started");

    // Check if user already has an active subscription
    const existingSubscription = await client.query(
      "SELECT id, plan_name, status, start_date FROM user_subscriptions WHERE user_id = $1 AND status = 'active'",
      [user_id]
    );

    if (existingSubscription.rows.length > 0) {
      await client.query("ROLLBACK");
      console.log("User already has active subscription:", existingSubscription.rows[0]);
      return NextResponse.json(
        { 
          success: false, 
          error: "You already have an active subscription",
          current_plan: existingSubscription.rows[0].plan_name
        },
        { status: 400 }
      );
    }

    // Check if user has already used a free trial
    const previousTrial = await client.query(
      "SELECT id FROM user_subscriptions WHERE user_id = $1 AND plan_name = 'Free Trial'",
      [user_id]
    );

    if (previousTrial.rows.length > 0) {
      await client.query("ROLLBACK");
      console.log("User already used free trial");
      return NextResponse.json(
        { 
          success: false, 
          error: "Free trial already used. Please choose a paid plan." 
        },
        { status: 400 }
      );
    }

    // Generate a unique trial ID for tracking
    const trialId = `trial_${Date.now()}_${user_id}`;

    // Insert trial record (acts as payment record for consistency)
    const trialInsert = `
      INSERT INTO user_payments (
        user_id, payment_id, order_id, amount, currency,
        status, paid_at, method, plan_name, details
      )
      VALUES ($1, $2, $3, $4, $5, 'success', NOW(), 'free_trial', $6, $7)
      RETURNING id
    `;

    const trialDetails = {
      trial_id: trialId,
      preferences,
      activated_at: new Date().toISOString(),
      trial_duration_days: 7,
    };

    console.log("Inserting trial record...");
    const trialResult = await client.query(trialInsert, [
      user_id,
      trialId, // payment_id
      trialId, // order_id (same as payment_id for trials)
      0, // amount (free)
      "INR", // currency
      plan_name,
      JSON.stringify(trialDetails),
    ]);

    console.log("Trial record inserted with ID:", trialResult.rows[0].id);

    // Create user subscription for free trial
    const subscriptionInsert = `
      INSERT INTO user_subscriptions (
        user_id, plan_name, status, start_date, next_renewal_date,
        amount, currency, payment_id, preferences
      )
      VALUES (
        $1, $2, 'active', NOW(), NOW() + interval '7 days',
        $3, $4, $5, $6
      )
      RETURNING id
    `;

    console.log("Creating free trial subscription...");
    const subscriptionResult = await client.query(subscriptionInsert, [
      user_id,
      plan_name,
      0, // amount
      "INR", // currency
      trialId, // payment_id
      JSON.stringify(preferences),
    ]);

    console.log(
      "Free trial subscription created with ID:",
      subscriptionResult.rows[0].id
    );

    // Update trial record with subscription ID
    await client.query(
      "UPDATE user_payments SET subscription_id = $1 WHERE id = $2",
      [subscriptionResult.rows[0].id, trialResult.rows[0].id]
    );

    console.log("Trial record updated with subscription ID");

    // Commit transaction
    await client.query("COMMIT");
    console.log("Transaction committed successfully");

    return NextResponse.json({
      success: true,
      trial_id: trialResult.rows[0].id,
      subscription_id: subscriptionResult.rows[0].id,
      message: "Free trial activated successfully",
      trial_expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days from now
    });

  } catch (error) {
    console.error("Free trial activation error:", error);

    try {
      await client.query("ROLLBACK");
      console.log("Transaction rolled back");
    } catch (rollbackError) {
      console.error("Rollback error:", rollbackError);
    }

    return NextResponse.json(
      {
        success: false,
        error: "Free trial activation failed",
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