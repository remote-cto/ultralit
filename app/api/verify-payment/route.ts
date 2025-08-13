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
      topic_id,
      subscription_id,
      amount,
      currency = "INR",
      payment_details // optional: raw Razorpay response for JSONB storage
    } = await req.json();

    // Verify signature
    const body = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET!)
      .update(body.toString())
      .digest("hex");

    if (expectedSignature !== razorpay_signature) {
      return NextResponse.json(
        { success: false, error: "Invalid signature" },
        { status: 400 }
      );
    }

    // Start transaction
    await client.query("BEGIN");

    // 1️⃣ Insert payment record
    const paymentInsert = `
      INSERT INTO user_payments (
        user_id, topic_id, subscription_id, payment_id, amount, currency,
        status, paid_at, method, details
      )
      VALUES ($1, $2, $3, $4, $5, $6, 'success', NOW(), 'razorpay', $7)
      RETURNING id
    `;

    const paymentResult = await client.query(paymentInsert, [
      user_id,
      topic_id,
      subscription_id,
      razorpay_payment_id,
      amount,
      currency,
      payment_details || null
    ]);

    // 2️⃣ Activate subscription
    // If subscription_id exists, update it. Otherwise, create a new one.
    if (subscription_id) {
      await client.query(
        `UPDATE user_subscriptions
         SET status = 'active',
             start_date = NOW(),
             next_renewal_at = NOW() + interval '1 month',
             updated_at = NOW()
         WHERE id = $1`,
        [subscription_id]
      );
    } else {
      const subInsert = `
        INSERT INTO user_subscriptions (
          user_id, topic_id, status, start_date, next_renewal_at
        )
        VALUES ($1, $2, 'active', NOW(), NOW() + interval '1 month')
        RETURNING id
      `;
      const subResult = await client.query(subInsert, [user_id, topic_id]);

      // Update payment record with new subscription_id
      await client.query(
        `UPDATE user_payments SET subscription_id = $1 WHERE id = $2`,
        [subResult.rows[0].id, paymentResult.rows[0].id]
      );
    }

    // Commit transaction
    await client.query("COMMIT");

    return NextResponse.json({ success: true });
  } catch (error) {
    await client.query("ROLLBACK");
    console.error("Payment processing error:", error);
    return NextResponse.json(
      { error: "Payment verification failed" },
      { status: 500 }
    );
  } finally {
    client.release();
  }
}
