// app/api/final-api-scheduler/route.ts
import { NextRequest, NextResponse } from "next/server";
import pool from "../../../utils/database";

// Type definitions
interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
}

interface Content {
  id: number;
  title: string;
  text: string;
}

interface DeliveryRow {
  delivery_id: number;
  user_id: string;
  topic_id: number;
  delivery_day: number;
  name: string;
  email: string;
  phone?: string;
  content_id: number;
  title: string;
  content_text: string;
}

interface DatabaseClient {
  query: (text: string, params?: any[]) => Promise<{ rows: any[] }>;
  release: () => void;
}

interface SchedulerResponse {
  status: string;
  sentCount: number;
  message?: string;
  details?: string;
  errors?: Array<{
    user_id: string;
    content_id: number;
    error: string;
  }>;
}

// Mock sendMail function - replace with actual email/WhatsApp API
async function sendMail(user: User, content: Content): Promise<boolean> {
  try {
    // Replace this with actual email/WhatsApp/SMS API integration
    console.log(`Sending content "${content.title}" to ${user.email}`);
    
    // Example: Email API call
    // const emailResponse = await fetch('your-email-api-endpoint', {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify({
    //     to: user.email,
    //     subject: content.title,
    //     html: content.text
    //   })
    // });
    // return emailResponse.ok;

    // Example: WhatsApp API call
    // const whatsappResponse = await fetch('your-whatsapp-api-endpoint', {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify({
    //     to: user.phone,
    //     message: `${content.title}\n\n${content.text}`
    //   })
    // });
    // return whatsappResponse.ok;

    // Simulate successful sending for now
    await new Promise(resolve => setTimeout(resolve, 100)); // Simulate API delay
    return true;
    
  } catch (error) {
    console.error(`Failed to send content to user ${user.id}:`, error);
    return false;
  }
}

// POST method to run the scheduler
export async function POST(req: NextRequest): Promise<NextResponse> {
  const client = await pool.connect() as DatabaseClient;
  const errors: Array<{ user_id: string; content_id: number; error: string }> = [];
  let successCount = 0;

  try {
    console.log("Starting content delivery scheduler...");

    // Start transaction
    await client.query("BEGIN");

    // 1) Fetch all pending deliveries with the proper content
    const query = `
      SELECT 
          ucd.id AS delivery_id,
          ucd.user_id,
          ucd.topic_id,
          ucd.day_number AS delivery_day,
          u.name,
          u.email,
          u.phone,
          c.id AS content_id,
          c.title,
          c.content_text
      FROM user_content_delivery ucd
      JOIN users u ON u.id = ucd.user_id
      JOIN content c 
           ON c.topic_id = ucd.topic_id 
          AND c.day_number = ucd.day_number
      WHERE ucd.is_sent = false
      ORDER BY ucd.created_at ASC;
    `;

    console.log("Fetching pending deliveries...");
    const { rows } = await client.query(query);

    console.log(`Found ${rows.length} pending deliveries`);

    if (rows.length === 0) {
      await client.query("COMMIT");
      return NextResponse.json({
        status: 'success',
        sentCount: 0,
        message: 'No pending deliveries found'
      } as SchedulerResponse);
    }

    // Process each delivery
    for (const row of rows as DeliveryRow[]) {
      try {
        const user: User = { 
          id: row.user_id, 
          name: row.name, 
          email: row.email, 
          phone: row.phone 
        };
        
        const content: Content = { 
          id: row.content_id, 
          title: row.title, 
          text: row.content_text 
        };

        console.log(`Processing delivery for user ${user.email}, content "${content.title}"`);

        // 2) Send the content
        const sent = await sendMail(user, content);
        
        if (sent) {
          // 3) Update current delivery as sent
          await client.query(
            `UPDATE user_content_delivery
             SET is_sent = true, delivered_on = CURRENT_TIMESTAMP
             WHERE id = $1`,
            [row.delivery_id]
          );

          // 4) Check if next day content exists and create next delivery
          const nextDayNumber = row.delivery_day + 1;
          const nextContentRes = await client.query(
            `SELECT id FROM content
             WHERE topic_id = $1 AND day_number = $2`,
            [row.topic_id, nextDayNumber]
          );

          if (nextContentRes.rows.length > 0) {
            // Insert next day delivery if content exists
            await client.query(
              `INSERT INTO user_content_delivery(user_id, topic_id, day_number, is_sent, created_at)
               VALUES ($1, $2, $3, false, CURRENT_TIMESTAMP),               
              [row.user_id, row.topic_id, nextDayNumber]
            );
            
            console.log(`Scheduled next delivery (day ${nextDayNumber}) for user ${user.email}`);
          } else {
            console.log(`No more content available for topic ${row.topic_id} after day ${row.delivery_day}`);
          }

          // 5) Optional: Log into scheduler_log table (if it exists)
          try {
            await client.query(
              `INSERT INTO scheduler_log(user_id, content_id, action, created_at)
               VALUES ($1, $2, $3, CURRENT_TIMESTAMP)`,
              [row.user_id, row.content_id, 'sent']
            );
          } catch (logError) {
            console.log("Scheduler log insert failed (table might not exist):", logError);
          }

          successCount++;
          console.log(`✓ Successfully delivered content to ${user.email}`);

        } else {
          const errorMsg = `Failed to send content to ${user.email}`;
          console.error(errorMsg);
          errors.push({
            user_id: row.user_id,
            content_id: row.content_id,
            error: errorMsg
          });
        }

      } catch (deliveryError) {
        const errorMsg = `Error processing delivery for user ${row.user_id}: ${(deliveryError as Error).message}`;
        console.error(errorMsg);
        errors.push({
          user_id: row.user_id,
          content_id: row.content_id,
          error: errorMsg
        });
      }
    }

    // Commit transaction
    await client.query("COMMIT");
    console.log(`Scheduler completed: ${successCount} successful deliveries, ${errors.length} errors`);

    const response: SchedulerResponse = {
      status: 'success',
      sentCount: successCount,
      message: `Processed ${rows.length} deliveries. ${successCount} successful, ${errors.length} failed.`
    };

    if (errors.length > 0) {
      response.errors = errors;
    }

    return NextResponse.json(response);

  } catch (error) {
    // Rollback transaction on error
    try {
      await client.query("ROLLBACK");
      console.log("Transaction rolled back due to error");
    } catch (rollbackError) {
      console.error("Rollback error:", rollbackError);
    }

    console.error("Scheduler error:", error);
    
    return NextResponse.json({
      status: 'error',
      sentCount: successCount,
      message: 'Scheduler failed with error',
      details: process.env.NODE_ENV === "development" 
        ? (error as Error).message 
        : undefined,
      errors: errors
    } as SchedulerResponse, { status: 500 });

  } finally {
    client.release();
    console.log("Database connection released");
  }
}

// GET method to check scheduler status and statistics
export async function GET(req: NextRequest): Promise<NextResponse> {
  const client = await pool.connect() as DatabaseClient;

  try {
    const { searchParams } = new URL(req.url);
    const user_id = searchParams.get('user_id');

    // Get pending deliveries count
    let pendingQuery = "SELECT COUNT(*) as pending_count FROM user_content_delivery WHERE is_sent = false";
    let pendingParams: any[] = [];
    
    if (user_id) {
      pendingQuery += " AND user_id = $1";
      pendingParams = [user_id];
    }

    const pendingResult = await client.query(pendingQuery, pendingParams);
    
    // Get today's deliveries count
    let todayQuery = `
      SELECT COUNT(*) as today_count 
      FROM user_content_delivery 
      WHERE is_sent = true 
      AND DATE(delivered_on) = CURRENT_DATE
    `;
    let todayParams: any[] = [];
    
    if (user_id) {
      todayQuery += " AND user_id = $1";
      todayParams = [user_id];
    }

    const todayResult = await client.query(todayQuery, todayParams);

    // Get recent deliveries (last 10)
    let recentQuery = `
      SELECT 
        ucd.user_id,
        u.email,
        c.title,
        ucd.delivered_on,
        ucd.day_number
      FROM user_content_delivery ucd
      JOIN users u ON u.id = ucd.user_id
      JOIN content c ON c.topic_id = ucd.topic_id AND c.day_number = ucd.day_number
      WHERE ucd.is_sent = true
    `;
    let recentParams: any[] = [];
    
    if (user_id) {
      recentQuery += " AND ucd.user_id = $1";
      recentParams = [user_id];
    }
    
    recentQuery += " ORDER BY ucd.delivered_on DESC LIMIT 10";
    
    const recentResult = await client.query(recentQuery, recentParams);

    return NextResponse.json({
      success: true,
      statistics: {
        pending_deliveries: parseInt(pendingResult.rows[0].pending_count),
        today_deliveries: parseInt(todayResult.rows[0].today_count),
        recent_deliveries: recentResult.rows
      }
    });

  } catch (error) {
    console.error('Error fetching scheduler statistics:', error);
    return NextResponse.json({
      success: false,
      error: 'Internal server error',
      details: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined
    }, { status: 500 });
  } finally {
    client.release();
  }
}
