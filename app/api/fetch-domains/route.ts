// /api/fetch-domains/route.ts
import { NextRequest, NextResponse } from 'next/server';
import pool from '../../../utils/database';

export async function GET() {
  const client = await pool.connect();

  try {
    // Debug logging
    console.log("Fetching domains request");

    const query = `
      SELECT id, name, description, is_active
      FROM domains 
      WHERE (is_active = true OR is_active IS NULL)
      ORDER BY name ASC
    `;
    
    console.log("Executing domains query");
    const result = await client.query(query);
    
    console.log(`Successfully fetched ${result.rows.length} domains`);

    return NextResponse.json({
      success: true,
      domains: result.rows,
    });

  } catch (error) {
    console.error('Error fetching domains:', error);
    
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch domains',
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