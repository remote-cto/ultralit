// api/register/route.ts
import { NextRequest, NextResponse } from 'next/server';
import pool from '../../../utils/database'; 

import { z } from 'zod';

// Validation schema
const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email format'),
  phone: z.string().optional(),
  profession: z.string().optional(),
  zipCode: z.string().optional(),
  country: z.string().optional(),
  userType: z.number().min(1).max(2).default(1), // 1 = Individual, 2 = Corporate
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate input data
    const validatedData = registerSchema.parse(body);
    
    // Check if user already exists
    const existingUser = await pool.query(
      'SELECT id FROM users WHERE email = $1',
      [validatedData.email]
    );
    
    if (existingUser.rows.length > 0) {
      return NextResponse.json(
        { error: 'User with this email already exists' },
        { status: 400 }
      );
    }
    
    // Insert new user
    const insertUserQuery = `
      INSERT INTO users (name, email, phone, zip_code, country, user_type)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING id, name, email, phone, zip_code, country, user_type, created_at
    `;
    
    const result = await pool.query(insertUserQuery, [
      validatedData.name,
      validatedData.email,
      validatedData.phone || null,
      validatedData.zipCode || null,
      validatedData.country || null,
      validatedData.userType
    ]);
    
    const newUser = result.rows[0];
    
    // Create default user preferences if profession is provided
    if (validatedData.profession) {
      const insertPreferenceQuery = `
        INSERT INTO user_preference (user_id, profession, language, selection, active)
        VALUES ($1, $2, $3, $4, $5)
        RETURNING id
      `;
      
      await pool.query(insertPreferenceQuery, [
        newUser.id,
        validatedData.profession,
        'en', 
        'knowledge', 
        true
      ]);
    }
    
    // Return success response (excluding sensitive data)
    return NextResponse.json({
      message: 'User registered successfully',
      user: {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        phone: newUser.phone,
        zipCode: newUser.zip_code,
        country: newUser.country,
        userType: newUser.user_type,
        createdAt: newUser.created_at
      }
    }, { status: 201 });
    
  } catch (error) {
    console.error('Registration error:', error);
    
  
if (error instanceof z.ZodError) {
  return NextResponse.json(
    { 
      error: 'Validation failed',
      details: error.issues 
    },
    { status: 400 }
  );
}
    
  
   // Handle database errors
if (error && typeof error === 'object' && 'code' in error && error.code === '23505') { 
  return NextResponse.json(
    { error: 'User with this email already exists' },
    { status: 400 }
  );
}
    // Generic error response
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Optional: Handle GET request to check if endpoint is working
export async function GET() {
  return NextResponse.json({ message: 'Registration endpoint is working' });
}