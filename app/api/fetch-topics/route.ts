// app/api/fetch-topics/route.ts - Updated for Per-Topic Pricing

import { NextRequest, NextResponse } from 'next/server';
import pool from '../../../utils/database';

export async function GET(request: NextRequest) {
  const client = await pool.connect();

  try {
    const { searchParams } = new URL(request.url);
    const domainId = searchParams.get('domain_id');
    const categoryId = searchParams.get('category_id');
    const isMicrolearning = searchParams.get('is_microlearning');
    const isTrending = searchParams.get('is_trending');

    // Debug logging
    console.log("Fetching topics request:", {
      domainId,
      categoryId,
      isMicrolearning,
      isTrending,
    });

    // Validate query parameters (your existing validation is good)
    if (domainId && isNaN(parseInt(domainId))) {
        return NextResponse.json(
            { success: false, error: "Invalid domain_id parameter" },
            { status: 400 }
        );
    }
    if (categoryId && isNaN(parseInt(categoryId))) {
        return NextResponse.json(
            { success: false, error: "Invalid category_id parameter" },
            { status: 400 }
        );
    }

    // --- THIS IS THE ONLY CHANGE NEEDED ---
    // We add price, currency, and access_duration_days to the SELECT statement.
    let query = `
      SELECT 
        id, name, description, topic_type, domain_id, category_id, 
        is_microlearning, is_trending, 
        price, currency, access_duration_days 
      FROM topics 
      WHERE is_active = true
    `;
    
    const queryParams: any[] = [];
    let paramCounter = 1;

    if (domainId) {
      query += ` AND domain_id = $${paramCounter}`;
      queryParams.push(parseInt(domainId));
      paramCounter++;
    }

    if (categoryId) {
      query += ` AND category_id = $${paramCounter}`;
      queryParams.push(parseInt(categoryId));
      paramCounter++;
    }

    if (isMicrolearning === 'true') {
      query += ` AND is_microlearning = true`;
    }

    if (isTrending === 'true') {
      query += ` AND is_trending = true`;
    }

    query += ` ORDER BY name ASC`;
    
    console.log("Executing topics query with parameters:", queryParams);
    const result = await client.query(query, queryParams);
    
    console.log(`Successfully fetched ${result.rows.length} topics with pricing`);

    return NextResponse.json({
      success: true,
      topics: result.rows,
    });

  } catch (error) {
    console.error('Error fetching topics:', error);
    
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch topics',
        details: process.env.NODE_ENV === 'development' 
          ? (error as Error).message 
          : undefined,
      },
      { status: 500 }
    );
  } finally {
    client.release();
    console.log('Database connection released');
  }
}