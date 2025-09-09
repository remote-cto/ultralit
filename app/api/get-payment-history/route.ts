// app/api/get-payment-history/route.ts

import { NextRequest, NextResponse } from "next/server";
import pool from "../../../utils/database";

export async function GET(request: NextRequest) {
    const client = await pool.connect();
    try {
        const { searchParams } = new URL(request.url);
        const userId = searchParams.get("user_id");

        if (!userId) {
            return NextResponse.json(
                { success: false, error: "User ID is required" },
                { status: 400 }
            );
        }

        const query = `
            SELECT
                p.id,
                p.razorpay_payment_id,
                p.amount,
                p.currency,
                p.status,
                p.created_at,
                p.payment_method,
                COALESCE(t.name, 'General Subscription') as topic_name
            FROM payments p
            LEFT JOIN topics t ON p.topic_id = t.id
            WHERE p.user_id = $1
            ORDER BY p.created_at DESC;
        `;
        
        const { rows } = await client.query(query, [userId]);
        
        return NextResponse.json({
            success: true,
            payments: rows,
        });

    } catch (error) {
        console.error("Error fetching payment history:", error);
        return NextResponse.json(
            { success: false, error: "Failed to fetch payment history" },
            { status: 500 }
        );
    } finally {
        client.release();
    }
}