import { NextRequest, NextResponse } from "next/server";
import Razorpay from "razorpay";

interface OrderRequest {
  amount: number;
  currency?: string;
  receipt?: string;
}

export async function POST(req: NextRequest) {
  try {
    const { amount, currency = "INR", receipt }: OrderRequest = await req.json();

    if (!amount || isNaN(amount) || amount <= 0) {
      return NextResponse.json({ error: "Invalid amount" }, { status: 400 });
    }

    if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
      return NextResponse.json({ error: "Payment keys not configured" }, { status: 500 });
    }

    const razorpay = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET,
    });

    const options = {
      amount: amount * 100,
      currency,
      receipt: receipt || `rcpt_${Date.now()}`,
    };

    const order = await razorpay.orders.create(options);

    return NextResponse.json({ order });
  } catch (error) {
    console.error("Razorpay order creation failed:", error);
    return NextResponse.json({ error: "Unable to create order" }, { status: 500 });
  }
}
