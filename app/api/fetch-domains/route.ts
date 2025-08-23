// /api/fetch-categories/route.ts
import { NextRequest, NextResponse } from 'next/server';
import pool from '../../../utils/database';

export async function GET() {
  const client = await pool.connect();

  try {
    // Debug logging
    console.log("Fetching categories request");

    const query = `
      SELECT id, name, description, parent_id, is_active
      FROM categories 
      WHERE is_active = true
      ORDER BY parent_id NULLS FIRST, name ASC
    `;
    
    console.log("Executing categories query");
    const result = await client.query(query);
    
    console.log(`Successfully fetched ${result.rows.length} categories`);

    return NextResponse.json({
      success: true,
      categories: result.rows,
    });

  } catch (error) {
    console.error('Error fetching categories:', error);
    
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch categories',
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