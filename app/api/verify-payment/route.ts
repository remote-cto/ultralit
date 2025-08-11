import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import pool from "../../../utils/database"

export async function POST(req: NextRequest) {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, user_id, topic_id, subscription_id, amount } = await req.json();

    const body = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET!)
      .update(body.toString())
      .digest("hex");

    if (expectedSignature === razorpay_signature) {
      // Store in DB
      await pool.query(
        `INSERT INTO user_payments (user_id, topic_id, subscription_id, payment_id, amount, status, paid_at, method) 
         VALUES ($1, $2, $3, $4, $5, 'success', NOW(), 'razorpay')`,
        [user_id, topic_id, subscription_id, razorpay_payment_id, amount]
      );

      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ success: false, error: "Invalid signature" }, { status: 400 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Payment verification failed" }, { status: 500 });
  }
}
