// api/send-otp/route.ts
import { NextRequest, NextResponse } from 'next/server';
import pool from '../../../utils/database';
import nodemailer from 'nodemailer';
import { z } from 'zod';

// Validation schema
const sendOtpSchema = z.object({
  email: z.string().email('Invalid email format'),
});

// Configure nodemailer transporter
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST, // e.g., 'smtp.gmail.com'
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: true, // true for 465, false for other ports
  auth: {
    user: process.env.SMTP_USER, // your email
    pass: process.env.SMTP_PASS, // your email password or app password
  },
});

// Generate random 6-digit OTP
const generateOTP = (): string => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate input data
    const validatedData = sendOtpSchema.parse(body);
    
    // Check if user exists
    const existingUser = await pool.query(
      'SELECT id, name FROM users WHERE email = $1',
      [validatedData.email]
    );
    
    if (existingUser.rows.length === 0) {
      return NextResponse.json(
        { error: 'No account found with this email address' },
        { status: 404 }
      );
    }
    
    const user = existingUser.rows[0];
    const otp = generateOTP();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes from now
    
    // Store or update OTP in database
    const upsertOtpQuery = `
      INSERT INTO otp_codes (user_id, email, otp_code, expires_at, is_used)
      VALUES ($1, $2, $3, $4, false)
      ON CONFLICT (email) 
      DO UPDATE SET 
        otp_code = EXCLUDED.otp_code,
        expires_at = EXCLUDED.expires_at,
        is_used = false,
        created_at = CURRENT_TIMESTAMP
      RETURNING id
    `;
    
    await pool.query(upsertOtpQuery, [
      user.id,
      validatedData.email,
      otp,
      expiresAt
    ]);
    
    // Send OTP via email
    const mailOptions = {
      from: process.env.SMTP_FROM || process.env.SMTP_USER,
      to: validatedData.email,
      subject: 'Your Login OTP Code',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #1e40af;">Your Login OTP Code</h2>
          <p>Hello ${user.name},</p>
          <p>Your OTP code for login is:</p>
          <div style="background-color: #fbbf24; padding: 15px; text-align: center; font-size: 24px; font-weight: bold; letter-spacing: 3px; margin: 20px 0; border-radius: 8px;">
            ${otp}
          </div>
          <p style="color: #ef4444; font-weight: bold;">This code will expire in 10 minutes.</p>
          <p>If you didn't request this code, please ignore this email.</p>
          <hr style="margin: 30px 0;">
          <p style="font-size: 12px; color: #6b7280;">This is an automated email, please do not reply.</p>
        </div>
      `
    };
    
    await transporter.sendMail(mailOptions);
    
    return NextResponse.json({
      message: 'OTP sent successfully',
      email: validatedData.email
    }, { status: 200 });
    
  } catch (error) {
    console.error('Send OTP error:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { 
          error: 'Validation failed',
          details: error.issues 
        },
        { status: 400 }
      );
    }
    
    // Handle nodemailer errors
    if (error && typeof error === 'object' && 'code' in error) {
      console.error('Email sending error:', error);
      return NextResponse.json(
        { error: 'Failed to send email. Please try again.' },
        { status: 500 }
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
  return NextResponse.json({ message: 'Send OTP endpoint is working' });
}