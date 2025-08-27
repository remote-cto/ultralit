// app/api/verify-payment/route.ts
import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import pool from "../../../utils/database";

// Type definitions
interface PaymentVerificationRequest {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
  user_id: string;
  plan_name: string;
  amount: number | string; // Allow both number and string
  preferences?: UserPreferences;
  currency?: string;
  is_upgrade?: boolean;
  previous_plan?: string | null;
}

interface UserPreferences {
  role?: string;
  industry?: string;
  language?: string;
  preferred_mode?: string;
  frequency?: string;
  topics?: Array<{
    id?: number;
    topic_id?: number;
  }>;
}

interface User {
  id: string;
  name: string;
  email: string;
}

interface DatabaseClient {
  query: (text: string, params?: any[]) => Promise<{ rows: any[] }>;
  release: () => void;
}

export async function POST(req: NextRequest): Promise<NextResponse> {
  const client = await pool.connect() as DatabaseClient;

  try {
    const body = await req.json() as PaymentVerificationRequest;
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      user_id,
      plan_name,
      amount: rawAmount,
      preferences,
      currency = "INR",
      is_upgrade = false,
      previous_plan = null,
    } = body;

    // Convert amount to number if it's a string
    const amount = typeof rawAmount === 'string' ? parseFloat(rawAmount) : rawAmount;

    // Debug logging
    console.log("Payment verification request:", {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature: razorpay_signature?.substring(0, 10) + "...",
      user_id,
      plan_name,
      amount: typeof rawAmount === 'string' ? `${rawAmount} (converted to ${amount})` : amount,
      is_upgrade,
      previous_plan,
    });

    // Validate required fields with improved amount validation
    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature || !user_id || !plan_name || 
        (typeof amount !== 'number' || isNaN(amount))) {
      console.error("Missing required payment verification fields", {
        razorpay_order_id: !!razorpay_order_id,
        razorpay_payment_id: !!razorpay_payment_id,
        razorpay_signature: !!razorpay_signature,
        user_id: !!user_id,
        plan_name: !!plan_name,
        amount: { value: rawAmount, type: typeof rawAmount, converted: amount, isValid: typeof amount === 'number' && !isNaN(amount) }
      });
      return NextResponse.json(
        { success: false, error: "Missing required payment verification fields" },
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
    const signatureBody = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(signatureBody.toString())
      .digest("hex");

    console.log("Signature verification:", {
      body: signatureBody,
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

    try {
      // Get user details
      const userResult = await client.query(
        "SELECT id, name, email FROM users WHERE id = $1",
        [user_id]
      );

      if (userResult.rows.length === 0) {
        await client.query("ROLLBACK");
        console.error("User not found:", user_id);
        return NextResponse.json(
          { success: false, error: "User not found" },
          { status: 404 }
        );
      }

      const user = userResult.rows[0] as User;
      console.log("User found:", user.email);

      // Check if payment already exists (prevent duplicate processing)
      const existingPayment = await client.query(
        "SELECT id FROM payments WHERE razorpay_payment_id = $1",
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

      // Check for existing active subscription
      const existingSubResult = await client.query(
        "SELECT * FROM subscriptions WHERE user_id = $1 AND status = 'active' AND is_active = true",
        [user_id]
      );

      let subscriptionId: number;
      const now = new Date();
      const nextRenewalDate = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000); // 30 days from now

      if (existingSubResult.rows.length > 0 && is_upgrade) {
        // Handle upgrade/downgrade - Update existing subscription
        const existingSubscription = existingSubResult.rows[0];
        subscriptionId = existingSubscription.id;

        console.log("Updating existing subscription for upgrade/downgrade...");
        
        // Update the existing subscription
        await client.query(`
          UPDATE subscriptions 
          SET plan_name = $1, 
              amount = $2, 
              status = 'active',
              next_renewal_date = $3,
              updated_at = CURRENT_TIMESTAMP
          WHERE id = $4
        `, [plan_name, amount, nextRenewalDate, subscriptionId]);

        // Log the plan change in subscription history
        await client.query(`
          INSERT INTO subscription_history 
          (subscription_id, user_id, action, previous_plan, new_plan, amount, created_at)
          VALUES ($1, $2, 'upgrade', $3, $4, $5, CURRENT_TIMESTAMP)
        `, [subscriptionId, user_id, previous_plan, plan_name, amount]);

        console.log("Subscription updated for upgrade/downgrade");

      } else {
        // Deactivate any existing subscriptions first
        if (existingSubResult.rows.length > 0) {
          await client.query(
            "UPDATE subscriptions SET status = 'replaced', is_active = false WHERE user_id = $1 AND status = 'active'",
            [user_id]
          );
          console.log("Existing subscriptions deactivated");
        }

        // Create new subscription
        const subscriptionInsert = `
          INSERT INTO subscriptions (
            user_id, plan_name, status, start_date, next_renewal_date,
            amount, currency, is_active, auto_renewal
          )
          VALUES (
            $1, $2, 'active', CURRENT_TIMESTAMP,
            CASE 
              WHEN $2 = 'Free Trial' THEN CURRENT_TIMESTAMP + interval '7 days'
              ELSE CURRENT_TIMESTAMP + interval '30 days'
            END,
            $3, $4, true, true
          )
          RETURNING id
        `;

        console.log("Creating new subscription...");
        const subscriptionResult = await client.query(subscriptionInsert, [
          user_id,
          plan_name,
          amount,
          currency,
        ]);

        subscriptionId = subscriptionResult.rows[0].id;

        // Log the new subscription
        await client.query(`
          INSERT INTO subscription_history 
          (subscription_id, user_id, action, new_plan, amount, created_at)
          VALUES ($1, $2, 'new_subscription', $3, $4, CURRENT_TIMESTAMP)
        `, [subscriptionId, user_id, plan_name, amount]);

        console.log("New subscription created with ID:", subscriptionId);
      }

      // Insert payment record
      const paymentInsert = `
        INSERT INTO payments (
          user_id, subscription_id, razorpay_payment_id, razorpay_order_id, 
          amount, currency, status, payment_method, created_at, updated_at
        )
        VALUES ($1, $2, $3, $4, $5, $6, 'completed', 'razorpay', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
        RETURNING id
      `;

      console.log("Inserting payment record...");
      const paymentResult = await client.query(paymentInsert, [
        user_id,
        subscriptionId,
        razorpay_payment_id,
        razorpay_order_id,
        amount,
        currency,
      ]);

      console.log("Payment record inserted with ID:", paymentResult.rows[0].id);

      // Handle user preferences if provided and not an upgrade
      if (preferences && !is_upgrade) {
        // Check if preferences already exist
        const prefResult = await client.query(
          "SELECT id FROM user_preferences WHERE user_id = $1",
          [user_id]
        );

        if (prefResult.rows.length === 0) {
          // Insert new preferences
          await client.query(`
            INSERT INTO user_preferences 
            (user_id, role, industry, language, preferred_mode, frequency, created_at, updated_at)
            VALUES ($1, $2, $3, $4, $5, $6, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
          `, [
            user_id,
            preferences.role || null,
            preferences.industry || null, 
            preferences.language || null,
            preferences.preferred_mode || null,
            preferences.frequency || null,
          ]);
          console.log("User preferences saved");
        }
      }

      // Insert entries into user_content_delivery table
      // Only for new subscriptions (not upgrades) to avoid duplicates
      if (!is_upgrade) {
        if (preferences?.topics && Array.isArray(preferences.topics) && preferences.topics.length > 0) {
          console.log("Setting up content delivery schedule for selected topics...");
          
          // Extract topic IDs from user's selected topics
          const selectedTopicIds = preferences.topics
            .map(topic => topic.id || topic.topic_id)
            .filter((id): id is number => typeof id === 'number'); // Type guard to filter out non-numbers
          
          if (selectedTopicIds.length > 0) {
            // Prepare batch insert for user_content_delivery
            const contentDeliveryInserts = selectedTopicIds.map(topicId => [
              user_id,
              topicId,
              1, // day_number starts at 1
              false // is_sent = false
            ]);

            // Batch insert
            const valuesPlaceholder = contentDeliveryInserts
              .map((_, index) => `($${index * 4 + 1}, $${index * 4 + 2}, $${index * 4 + 3}, $${index * 4 + 4})`)
              .join(', ');

            const flattenedValues = contentDeliveryInserts.flat();

            const contentDeliveryInsert = `
              INSERT INTO user_content_delivery 
              (user_id, topic_id, day_number, is_sent)
              VALUES ${valuesPlaceholder}
            `;

            await client.query(contentDeliveryInsert, flattenedValues);
            
            console.log(`Content delivery schedule created for ${selectedTopicIds.length} selected topics`);
          } else {
            console.log("No valid topic IDs found in user preferences");
          }
        } else {
          console.log("No topics selected in user preferences - skipping content delivery setup");
        }
      } else {
        console.log("Skipping content delivery setup for upgrade/plan change");
      }

      // Commit transaction
      await client.query("COMMIT");
      console.log("Transaction committed successfully");

      return NextResponse.json({
        success: true,
        payment_id: paymentResult.rows[0].id,
        subscription_id: subscriptionId,
        message: is_upgrade 
          ? "Plan updated successfully!" 
          : "Payment verified and subscription activated successfully",
        data: {
          subscription_id: subscriptionId,
          plan_name,
          amount,
          user_id,
          payment_id: razorpay_payment_id,
          is_upgrade,
          previous_plan,
        },
      });

    } catch (dbError) {
      // Rollback transaction on database error
      await client.query("ROLLBACK");
      console.error("Database error during payment verification:", dbError);
      
      return NextResponse.json(
        {
          success: false,
          error: "Database error during payment processing",
          details: process.env.NODE_ENV === "development" 
            ? (dbError as Error).message 
            : undefined,
        },
        { status: 500 }
      );
    }

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

// GET method to retrieve payment history
export async function GET(req: NextRequest): Promise<NextResponse> {
  const client = await pool.connect() as DatabaseClient;
  
  try {
    const { searchParams } = new URL(req.url);
    const user_id = searchParams.get('user_id');

    if (!user_id) {
      return NextResponse.json({
        success: false,
        error: 'Missing user_id parameter'
      }, { status: 400 });
    }

    const query = `
      SELECT 
        p.*,
        s.plan_name,
        s.status as subscription_status
      FROM payments p
      LEFT JOIN subscriptions s ON p.subscription_id = s.id
      WHERE p.user_id = $1
      ORDER BY p.created_at DESC
    `;
    
    const result = await client.query(query, [user_id]);

    return NextResponse.json({
      success: true,
      payments: result.rows,
      count: result.rows.length
    });

  } catch (error) {
    console.error('Error fetching payment history:', error);
    return NextResponse.json({
      success: false,
      error: 'Internal server error',
      details: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined
    }, { status: 500 });
  } finally {
    client.release();
  }
}