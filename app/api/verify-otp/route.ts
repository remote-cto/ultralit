// api/verify-otp/route.ts
import { NextRequest, NextResponse } from 'next/server';
import pool from '../../../utils/database';
import { z } from 'zod';

// Validation schema
const verifyOtpSchema = z.object({
  email: z.string().email('Invalid email format'),
  otp: z.string().length(6, 'OTP must be 6 digits'),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate input data
    const validatedData = verifyOtpSchema.parse(body);
    
    // Check OTP in database
    const otpQuery = `
      SELECT 
        oc.id,
        oc.user_id,
        oc.otp_code,
        oc.expires_at,
        oc.is_used,
        u.id as user_id,
        u.name,
        u.email,
        u.phone,
        u.zip_code,
        u.country,
        u.user_type
      FROM otp_codes oc
      JOIN users u ON oc.user_id = u.id
      WHERE oc.email = $1 
      ORDER BY oc.created_at DESC
      LIMIT 1
    `;
    
    const otpResult = await pool.query(otpQuery, [validatedData.email]);
    
    if (otpResult.rows.length === 0) {
      return NextResponse.json(
        { error: 'No OTP found for this email. Please request a new OTP.' },
        { status: 404 }
      );
    }
    
    const otpRecord = otpResult.rows[0];
    
    // Check if OTP is already used
    if (otpRecord.is_used) {
      return NextResponse.json(
        { error: 'This OTP has already been used. Please request a new OTP.' },
        { status: 400 }
      );
    }
    
    // Check if OTP is expired
    const now = new Date();
    const expiresAt = new Date(otpRecord.expires_at);
    
    if (now > expiresAt) {
      // Mark OTP as used to prevent reuse
      await pool.query(
        'UPDATE otp_codes SET is_used = true WHERE id = $1',
        [otpRecord.id]
      );
      
      return NextResponse.json(
        { error: 'OTP has expired. Please request a new OTP.' },
        { status: 400 }
      );
    }
    
    // Verify OTP code
    if (otpRecord.otp_code !== validatedData.otp) {
      return NextResponse.json(
        { error: 'Invalid OTP. Please check and try again.' },
        { status: 400 }
      );
    }
    
    // Mark OTP as used
    await pool.query(
      'UPDATE otp_codes SET is_used = true WHERE id = $1',
      [otpRecord.id]
    );
    
    // Update user's last login timestamp
    await pool.query(
      'UPDATE users SET last_login = CURRENT_TIMESTAMP WHERE id = $1',
      [otpRecord.user_id]
    );
    
    // Return success response with user data (excluding sensitive information)
    return NextResponse.json({
      message: 'Login successful',
      user: {
        id: otpRecord.user_id,
        name: otpRecord.name,
        email: otpRecord.email,
        phone: otpRecord.phone,
        zipCode: otpRecord.zip_code,
        country: otpRecord.country,
        userType: otpRecord.user_type
      }
    }, { status: 200 });
    
  } catch (error) {
    console.error('Verify OTP error:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { 
          error: 'Validation failed',
          details: error.issues 
        },
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

// Optional: Handle GET request
export async function GET() {
  return NextResponse.json({ message: 'Verify OTP endpoint is working' });
}