// app/api/getplans/route.ts
import { NextRequest, NextResponse } from "next/server";
import pool from "../../../utils/database";

export async function GET(req: NextRequest) {
  const client = await pool.connect();

  try {
    const result = await client.query(
      `SELECT id, name, display_name, description, amount, currency, 
              duration_days, max_topics, features, is_trial, is_active, 
              sort_order, created_at, updated_at
       FROM plans 
       WHERE is_active = TRUE 
       ORDER BY sort_order ASC, amount ASC`
    );

    return NextResponse.json({
      success: true,
      plans: result.rows,
    });
  } catch (error) {
    console.error("Error fetching plans:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch plans" },
      { status: 500 }
    );
  } finally {
    client.release();
  }
}

// // Optional: If you need to create/update plans (admin functionality)
// export async function POST(request: NextRequest) {
//   const client = await pool.connect();
  
//   try {
//     const body = await request.json();
//     const { 
//       name, 
//       display_name, 
//       description, 
//       amount, 
//       currency = 'INR', 
//       duration_days = 30, 
//       max_topics = null,
//       features, 
//       is_trial = false,
//       is_active = true,
//       sort_order = 0
//     } = body;

//     if (!name || !display_name || !amount) {
//       return NextResponse.json(
//         { success: false, error: "Plan name, display_name, and amount are required" },
//         { status: 400 }
//       );
//     }

//     const insertQuery = `
//       INSERT INTO plans (
//         name, display_name, description, amount, currency, 
//         duration_days, max_topics, features, is_trial, is_active, 
//         sort_order, created_at, updated_at
//       )
//       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, NOW(), NOW())
//       RETURNING id, name, display_name, description, amount, currency, 
//                 duration_days, max_topics, features, is_trial, is_active, sort_order
//     `;

//     const { rows } = await client.query(insertQuery, [
//       name, display_name, description, amount, currency, 
//       duration_days, max_topics, features, is_trial, is_active, sort_order
//     ]);

//     return NextResponse.json({
//       success: true,
//       plan: rows[0],
//       message: "Plan created successfully"
//     });

//   } catch (error) {
//     console.error("Error creating plan:", error);
    
//     // Handle unique constraint violation
//     if (error.code === '23505') {
//       return NextResponse.json(
//         { success: false, error: "Plan name already exists" },
//         { status: 409 }
//       );
//     }
    
//     return NextResponse.json(
//       { success: false, error: "Failed to create plan" },
//       { status: 500 }
//     );
//   } finally {
//     client.release();
//   }
// }