// app/api/verify-payment/route.ts 

import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import pool from "../../../utils/database";

export async function POST(request: NextRequest) {
  const client = await pool.connect();
  try {
    const body = await request.json();
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      user_id,
      topic_id,
      amount,
      plan_name,
      duration_days,
    } = body;

    // --- 1. Validate the signature from Razorpay ---
    const secret = process.env.RAZORPAY_KEY_SECRET;
    if (!secret) {
        console.error("Razorpay secret key is not configured.");
        return NextResponse.json({ success: false, error: "Server configuration error" }, { status: 500 });
    }
    const shasum = crypto.createHmac("sha256", secret);
    shasum.update(`${razorpay_order_id}|${razorpay_payment_id}`);
    const digest = shasum.digest("hex");

    if (digest !== razorpay_signature) {
      return NextResponse.json(
        { success: false, error: "Invalid payment signature" },
        { status: 400 }
      );
    }

    // --- 2. Begin a database transaction ---
    // This ensures both operations (inserting into payments AND user_topics) succeed or fail together.
    await client.query("BEGIN");

    // --- 3. Insert into the `payments` table (for record-keeping) ---
    const paymentInsertQuery = `
      INSERT INTO payments (user_id, topic_id, amount, currency, status, payment_method, razorpay_payment_id, razorpay_order_id, created_at, updated_at)
      VALUES ($1, $2, $3, 'INR', 'completed', 'razorpay', $4, $5, NOW(), NOW())
      RETURNING id;
    `;
    await client.query(paymentInsertQuery, [
      user_id,
      topic_id,
      amount,
      razorpay_payment_id,
      razorpay_order_id,
    ]);

    // --- 4. Insert into the `user_topics` table (to grant access) ---
    const expiryDate = new Date();
    if (duration_days >= 9999) { // Use >= for lifetime access
      expiryDate.setFullYear(2099, 11, 31);
    } else if (duration_days) {
      expiryDate.setDate(expiryDate.getDate() + duration_days);
    } else {
      expiryDate.setFullYear(2099, 11, 31); // Default to lifetime if duration is not provided
    }

    const userTopicInsertQuery = `
      INSERT INTO user_topics (user_id, topic_id, plan_name, amount_paid, payment_status, purchased_date, expires_at)
      VALUES ($1, $2, $3, $4, 'completed', NOW(), $5)
      ON CONFLICT (user_id, topic_id) DO UPDATE SET
        plan_name = EXCLUDED.plan_name,
        amount_paid = EXCLUDED.amount_paid,
        payment_status = EXCLUDED.payment_status,
        purchased_date = EXCLUDED.purchased_date,
        expires_at = EXCLUDED.expires_at;
    `;
    await client.query(userTopicInsertQuery, [
      user_id,
      topic_id,
      plan_name,
      amount,
      expiryDate,
    ]);

    // --- 5. Commit the transaction ---
    await client.query("COMMIT");

    return NextResponse.json({
      success: true,
      message: "Payment verified and topic access granted",
    });

  } catch (error) {
    // --- 6. If any error occurs, rollback the transaction ---
    await client.query("ROLLBACK");
    console.error("Payment verification failed:", error);
    return NextResponse.json(
      { success: false, error: "Internal Server Error during payment verification" },
      { status: 500 }
    );
  } finally {
    client.release();
  }
}
