import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Simple in-memory rate limiter
const rateLimit = new Map<string, { count: number; resetTime: number }>();

function checkRateLimit(ip: string, limit: number = 30, windowMs: number = 60000): boolean {
  const now = Date.now();
  const record = rateLimit.get(ip);

  if (!record || now > record.resetTime) {
    rateLimit.set(ip, { count: 1, resetTime: now + windowMs });
    return true;
  }

  if (record.count >= limit) {
    return false;
  }

  record.count++;
  return true;
}

export function middleware(request: NextRequest) {
  const origin = request.headers.get('origin') || 'http://localhost:5173';
  const ip = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || '127.0.0.1';

  // Rate limiting for API routes
  if (request.nextUrl.pathname.startsWith('/api/')) {
    // Stricter limit for auth routes
    if (request.nextUrl.pathname.startsWith('/api/auth/')) {
      if (!checkRateLimit(ip, 10, 60000)) {
        return new NextResponse('Too many requests', { 
          status: 429,
          headers: { 'Retry-After': '60' }
        });
      }
    }
    // General API rate limit
    else if (!checkRateLimit(ip, 60, 60000)) {
      return new NextResponse('Too many requests', { 
        status: 429,
        headers: { 'Retry-After': '60' }
      });
    }
  }

  // Handle preflight OPTIONS request
  if (request.method === 'OPTIONS') {
    return new NextResponse(null, {
      status: 204,
      headers: {
        'Access-Control-Allow-Origin': origin,
        'Access-Control-Allow-Credentials': 'true',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, PATCH, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization, Cookie',
        'Access-Control-Max-Age': '86400',
      },
    });
  }

  const response = NextResponse.next();

  // Security Headers
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-XSS-Protection', '1; mode=block');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
  response.headers.set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  
  // CORS
  response.headers.set('Access-Control-Allow-Origin', origin);
  response.headers.set('Access-Control-Allow-Credentials', 'true');
  response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
  response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization, Cookie');

  return response;
}

export const config = {
  matcher: '/api/:path*',
};