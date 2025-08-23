import { NextRequest, NextResponse } from 'next/server';
import pool from "../../../utils/database";




export async function GET(req: NextRequest) {
  try {
    const client = await pool.connect();
    
    const query = `
      SELECT id, name, description, parent_id, is_active
      FROM categories 
      WHERE is_active = true
      ORDER BY parent_id NULLS FIRST, name ASC
    `;
    
    const result = await client.query(query);
    client.release();

    return NextResponse.json({
      success: true,
      categories: result.rows,
    });
  } catch (error) {
    console.error('Error fetching categories:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch categories' },
      { status: 500 }
    );
  }
}