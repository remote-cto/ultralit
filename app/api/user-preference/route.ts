
// /api/user-preference/route.ts
import { NextRequest, NextResponse } from 'next/server';
import pool from '../../../utils/database';

export async function POST(request: NextRequest) {
  const client = await pool.connect();

  try {
    const { user_id, role, industry, language, preferred_mode, frequency } = await request.json();

    // Debug logging
    console.log("User preference update request:", {
      user_id,
      role,
      industry,
      language,
      preferred_mode,
      frequency,
    });

    // Validate required fields
    if (!user_id || !role || !industry || !language) {
      console.error("Missing required fields");
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Start transaction
    await client.query('BEGIN');
    console.log("Database transaction started");

    // Check if user preferences already exist
    console.log("Checking for existing user preferences");
    const existingPrefs = await client.query(
      'SELECT id FROM user_preferences WHERE user_id = $1',
      [user_id]
    );

    if (existingPrefs.rows.length > 0) {
      console.log("Updating existing user preferences");
      // Update existing preferences
      await client.query(`
        UPDATE user_preferences 
        SET role = $2, industry = $3, language = $4, 
            preferred_mode = $5, frequency = $6, updated_at = CURRENT_TIMESTAMP
        WHERE user_id = $1
      `, [user_id, role, industry, language, preferred_mode, frequency]);
      
      console.log("User preferences updated successfully");
    } else {
      console.log("Creating new user preferences");
      // Insert new preferences
      await client.query(`
        INSERT INTO user_preferences (user_id, role, industry, language, preferred_mode, frequency)
        VALUES ($1, $2, $3, $4, $5, $6)
      `, [user_id, role, industry, language, preferred_mode, frequency]);
      
      console.log("User preferences created successfully");
    }

    // Commit transaction
    await client.query('COMMIT');
    console.log("Transaction committed successfully");

    return NextResponse.json({
      success: true,
      message: 'User preferences saved successfully',
    });

  } catch (error) {
    console.error('Error saving user preferences:', error);

    try {
      await client.query('ROLLBACK');
      console.log("Transaction rolled back");
    } catch (rollbackError) {
      console.error("Rollback error:", rollbackError);
    }

    return NextResponse.json(
      {
        success: false,
        error: 'Failed to save user preferences',
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
