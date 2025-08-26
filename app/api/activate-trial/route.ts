import { NextRequest, NextResponse } from "next/server";
import pool from "../../../utils/database";

// Define interfaces for type safety
interface UserPreferences {
  role?: string;
  industry?: string;
  language?: string;
  preferred_mode?: string;
  frequency?: string;
  topics?: Array<{
    id?: number;
    topic_id?: number;
    [key: string]: any;
  }>;
}

interface RequestBody {
  user_id: string | number;
  plan_name: string;
  preferences?: UserPreferences;
}

interface DatabaseRow {
  id: number;
  plan_name?: string;
  status?: string;
  start_date?: string;
  [key: string]: any;
}

export async function POST(req: NextRequest) {
  const client = await pool.connect();

  try {
    const body: RequestBody = await req.json();
    const {
      user_id,
      plan_name,
      preferences,
    } = body;

    // Debug logging
    console.log("Free trial activation request:", {
      user_id,
      plan_name,
      preferences,
    });

    // Validate required fields with proper type checking
    if (!user_id || !plan_name || typeof plan_name !== 'string') {
      console.error("Missing or invalid required fields");
      return NextResponse.json(
        { success: false, error: "Missing or invalid required fields" },
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
      "SELECT id, plan_name, status, start_date FROM subscriptions WHERE user_id = $1 AND status = 'active' AND is_active = true",
      [user_id]
    );

    if (existingSubscription.rows.length > 0) {
      await client.query("ROLLBACK");
      const currentSubscription = existingSubscription.rows[0] as DatabaseRow;
      console.log("User already has active subscription:", currentSubscription);
      return NextResponse.json(
        { 
          success: false, 
          error: "You already have an active subscription",
          current_plan: currentSubscription.plan_name
        },
        { status: 400 }
      );
    }

    // Check if user has already used a free trial
    const previousTrial = await client.query(
      "SELECT id FROM subscriptions WHERE user_id = $1 AND plan_name = 'Free Trial'",
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
      INSERT INTO payments (
        user_id, razorpay_payment_id, razorpay_order_id, amount, currency,
        status, payment_method, created_at
      )
      VALUES ($1, $2, $3, $4, $5, 'completed', $6, NOW())
      RETURNING id
    `;

    console.log("Inserting trial payment record...");
    const trialResult = await client.query(trialInsert, [
      user_id,
      trialId, // razorpay_payment_id
      trialId, // razorpay_order_id (same as payment_id for trials)
      0, // amount (free)
      "INR", // currency
      "free_trial", // payment_method
    ]);

    const trialPaymentId = (trialResult.rows[0] as DatabaseRow).id;
    console.log("Trial payment record inserted with ID:", trialPaymentId);

    // Create user subscription for free trial
    const subscriptionInsert = `
      INSERT INTO subscriptions (
        user_id, plan_name, status, start_date, next_renewal_date, end_date,
        amount, currency, is_active, auto_renewal, trial_end_date
      )
      VALUES (
        $1, $2, 'active', NOW(), NOW() + interval '7 days', NOW() + interval '7 days',
        $3, $4, true, false, NOW() + interval '7 days'
      )
      RETURNING id
    `;

    console.log("Creating free trial subscription...");
    const subscriptionResult = await client.query(subscriptionInsert, [
      user_id,
      plan_name,
      0, // amount
      "INR", // currency
    ]);

    const subscriptionId = (subscriptionResult.rows[0] as DatabaseRow).id;
    console.log("Free trial subscription created with ID:", subscriptionId);

    // Update payment record with subscription ID
    await client.query(
      "UPDATE payments SET subscription_id = $1 WHERE id = $2",
      [subscriptionId, trialPaymentId]
    );

    console.log("Payment record updated with subscription ID");

    // Store user preferences if provided
    if (preferences && typeof preferences === 'object' && Object.keys(preferences).length > 0) {
      const preferencesInsert = `
        INSERT INTO user_preferences (
          user_id, role, industry, language, preferred_mode, frequency
        )
        VALUES ($1, $2, $3, $4, $5, $6)
        ON CONFLICT (user_id) DO UPDATE SET
          role = EXCLUDED.role,
          industry = EXCLUDED.industry,
          language = EXCLUDED.language,
          preferred_mode = EXCLUDED.preferred_mode,
          frequency = EXCLUDED.frequency,
          updated_at = CURRENT_TIMESTAMP
      `;

      await client.query(preferencesInsert, [
        user_id,
        preferences.role || null,
        preferences.industry || null,
        preferences.language || null,
        preferences.preferred_mode || null,
        preferences.frequency || null,
      ]);

      console.log("User preferences saved");
    }

    // Add subscription history record
    await client.query(
      `INSERT INTO subscription_history (
        subscription_id, user_id, action, new_plan, amount, reason
      ) VALUES ($1, $2, 'new_subscription', $3, $4, 'Free trial activation')`,
      [subscriptionId, user_id, plan_name, 0]
    );

    console.log("Subscription history record created");

    // Insert entries into user_content_delivery table for selected topics only
    if (preferences?.topics && Array.isArray(preferences.topics) && preferences.topics.length > 0) {
      console.log("Setting up content delivery schedule for selected topics...");
      
      // Extract topic IDs from user's selected topics with proper type checking
      const selectedTopicIds = preferences.topics
        .map(topic => {
          if (typeof topic === 'object' && topic !== null) {
            return topic.id || topic.topic_id;
          }
          return null;
        })
        .filter((id): id is number => typeof id === 'number' && !isNaN(id)); // Type guard
      
      if (selectedTopicIds.length > 0) {
        // Prepare batch insert for user_content_delivery with proper typing
        const contentDeliveryInserts: Array<[string | number, number, number, boolean]> = selectedTopicIds.map(topicId => [
          user_id,
          topicId,
          1, // day_number starts at 1
          false // is_sent = false
        ]);

        // Create parameterized query with proper indexing
        const valuesPlaceholders: string[] = [];
        const flattenedValues: (string | number | boolean)[] = [];
        
        contentDeliveryInserts.forEach((values, index) => {
          const baseIndex = index * 4;
          valuesPlaceholders.push(`($${baseIndex + 1}, $${baseIndex + 2}, $${baseIndex + 3}, $${baseIndex + 4})`);
          flattenedValues.push(...values);
        });

        const contentDeliveryInsert = `
          INSERT INTO user_content_delivery 
          (user_id, topic_id, day_number, is_sent)
          VALUES ${valuesPlaceholders.join(', ')}
        `;

        await client.query(contentDeliveryInsert, flattenedValues);
        
        console.log(`Content delivery schedule created for ${selectedTopicIds.length} selected topics`);
      } else {
        console.log("No valid topic IDs found in user preferences");
      }
    } else {
      console.log("No topics selected in user preferences - skipping content delivery setup");
    }

    // Commit transaction
    await client.query("COMMIT");
    console.log("Transaction committed successfully");

    // Calculate trial expiration date
    const trialExpiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

    return NextResponse.json({
      success: true,
      payment_id: trialPaymentId,
      subscription_id: subscriptionId,
      message: "Free trial activated successfully",
      trial_expires_at: trialExpiresAt.toISOString(),
      plan_details: {
        name: plan_name,
        duration_days: 7,
        amount: 0,
        currency: "INR",
      },
    });

  } catch (error) {
    console.error("Free trial activation error:", error);

    try {
      await client.query("ROLLBACK");
      console.log("Transaction rolled back");
    } catch (rollbackError) {
      console.error("Rollback error:", rollbackError);
    }

    // Proper error handling with type checking
    const errorMessage = error instanceof Error ? error.message : "Unknown error occurred";
    
    return NextResponse.json(
      {
        success: false,
        error: "Free trial activation failed",
        details: process.env.NODE_ENV === "development" ? errorMessage : undefined,
      },
      { status: 500 }
    );
  } finally {
    client.release();
    console.log("Database connection released");
  }
}