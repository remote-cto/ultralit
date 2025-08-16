// app/api/check-subscription/route.ts
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

    // Check for active subscription
    const subscriptionQuery = `
      SELECT 
        id,
        plan_name,
        status,
        start_date,
        next_renewal_date,
        amount,
        currency,
        created_at,
        updated_at,
        CASE 
          WHEN status = 'active' AND (next_renewal_date IS NULL OR next_renewal_date > NOW()) THEN true
          ELSE false
        END as is_active
      FROM user_subscriptions 
      WHERE user_id = $1 
      ORDER BY created_at DESC 
      LIMIT 1
    `;

    const subscriptionResult = await client.query(subscriptionQuery, [user_id]);

    if (subscriptionResult.rows.length === 0) {
      return NextResponse.json({
        success: true,
        hasSubscription: false,
        subscription: null,
        message: "No subscription found",
      });
    }

    const subscription = subscriptionResult.rows[0];

    // Check if subscription is expired
    let actualStatus = subscription.status;
    if (
      subscription.next_renewal_date &&
      new Date(subscription.next_renewal_date) < new Date()
    ) {
      actualStatus = "expired";

      // Update the subscription status in database if it's expired
      await client.query(
        "UPDATE user_subscriptions SET status = 'expired' WHERE id = $1",
        [subscription.id]
      );
    }

    return NextResponse.json({
      success: true,
      hasSubscription: true,
      subscription: {
        ...subscription,
        status: actualStatus,
        is_active: actualStatus === "active" && subscription.is_active,
      },
    });
  } catch (error) {
    console.error("Error checking subscription:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to check subscription status",
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
