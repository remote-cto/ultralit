import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import pool from "../../../utils/database";

export async function POST(req: NextRequest) {
  const client = await pool.connect();

  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      user_id,
      plan_name,
      amount,
      preferences,
      currency = "INR",
    } = await req.json();

    // Debug logging
    console.log("Payment verification request:", {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature: razorpay_signature?.substring(0, 10) + "...", // Log partial signature for security
      user_id,
      plan_name,
      amount,
    });

    // Validate required fields
    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      console.error("Missing required Razorpay fields");
      return NextResponse.json(
        { success: false, error: "Missing required payment fields" },
        { status: 400 }
      );
    }

    if (!process.env.RAZORPAY_KEY_SECRET) {
      console.error("RAZORPAY_KEY_SECRET not found in environment variables");
      return NextResponse.json(
        { success: false, error: "Payment configuration error" },
        { status: 500 }
      );
    }

    // Verify signature
    const body = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(body.toString())
      .digest("hex");

    console.log("Signature verification:", {
      body,
      expectedSignature: expectedSignature.substring(0, 10) + "...",
      receivedSignature: razorpay_signature.substring(0, 10) + "...",
      match: expectedSignature === razorpay_signature,
    });

    if (expectedSignature !== razorpay_signature) {
      console.error("Signature verification failed");
      return NextResponse.json(
        { success: false, error: "Invalid payment signature" },
        { status: 400 }
      );
    }

    console.log("Signature verified successfully");

    // Start transaction
    await client.query("BEGIN");
    console.log("Database transaction started");

    // Check if payment already exists (prevent duplicate processing)
    const existingPayment = await client.query(
      "SELECT id FROM user_payments WHERE payment_id = $1",
      [razorpay_payment_id]
    );

    if (existingPayment.rows.length > 0) {
      await client.query("ROLLBACK");
      console.log("Payment already processed:", razorpay_payment_id);
      return NextResponse.json({
        success: true,
        message: "Payment already processed",
      });
    }

    // Insert payment record
    const paymentInsert = `
      INSERT INTO user_payments (
        user_id, payment_id, order_id, amount, currency,
        status, paid_at, method, plan_name, details
      )
      VALUES ($1, $2, $3, $4, $5, 'success', NOW(), 'razorpay', $6, $7)
      RETURNING id
    `;

    const paymentDetails = {
      razorpay_order_id,
      razorpay_payment_id,
      preferences,
      processed_at: new Date().toISOString(),
    };

    console.log("Inserting payment record...");
    const paymentResult = await client.query(paymentInsert, [
      user_id,
      razorpay_payment_id,
      razorpay_order_id,
      amount,
      currency,
      plan_name,
      JSON.stringify(paymentDetails),
    ]);

    console.log("Payment record inserted with ID:", paymentResult.rows[0].id);

    // Create or update user subscription
    const subscriptionUpsert = `
      INSERT INTO user_subscriptions (
  user_id, plan_name, status, start_date, next_renewal_date,
  amount, currency, payment_id, preferences
)
VALUES (
  $1, $2::varchar, 'active', NOW(),
  CASE 
    WHEN $2::text = 'Free Trial' THEN NOW() + interval '7 days'
    ELSE NOW() + interval '1 month'
  END,
  $3, $4, $5, $6
)

      ON CONFLICT (user_id) 
      DO UPDATE SET 
        plan_name = EXCLUDED.plan_name,
        status = 'active',
        start_date = NOW(),
        next_renewal_date = EXCLUDED.next_renewal_date,
        amount = EXCLUDED.amount,
        payment_id = EXCLUDED.payment_id,
        preferences = EXCLUDED.preferences,
        updated_at = NOW()
      RETURNING id
    `;

    console.log("Creating/updating subscription...");
    const subscriptionResult = await client.query(subscriptionUpsert, [
      user_id,
      plan_name,
      amount,
      currency,
      razorpay_payment_id,
      JSON.stringify(preferences),
    ]);

    console.log(
      "Subscription created/updated with ID:",
      subscriptionResult.rows[0].id
    );

    // Update payment record with subscription ID
    await client.query(
      "UPDATE user_payments SET subscription_id = $1 WHERE id = $2",
      [subscriptionResult.rows[0].id, paymentResult.rows[0].id]
    );

    console.log("Payment record updated with subscription ID");

    // Commit transaction
    await client.query("COMMIT");
    console.log("Transaction committed successfully");

    return NextResponse.json({
      success: true,
      payment_id: paymentResult.rows[0].id,
      subscription_id: subscriptionResult.rows[0].id,
      message: "Payment verified and subscription activated successfully",
    });
  } catch (error) {
    console.error("Payment verification error:", error);

    try {
      await client.query("ROLLBACK");
      console.log("Transaction rolled back");
    } catch (rollbackError) {
      console.error("Rollback error:", rollbackError);
    }

    return NextResponse.json(
      {
        success: false,
        error: "Payment verification failed",
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
