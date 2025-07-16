import { NextRequest, NextResponse } from 'next/server';
import { LRUCache } from 'lru-cache';
import { getToken } from 'next-auth/jwt';

// Protected routes that require authentication
const PROTECTED_ROUTES = [
  '/dashboards',
  '/clients',
  '/client-analytics',
  '/add-client',
  '/edit-client',
  '/budgets',
  '/client-tags',
];

// Admin-only routes
const ADMIN_ONLY_ROUTES = [
  '/dashboards',
  '/clients',
  '/add-client',
  '/edit-client',
  '/budgets',
  '/client-tags',
  '/api/admin',
];

// Rate limiting configuration
interface RateLimitConfig {
  max: number;
  windowMs: number;
}

// Rate limit configurations for different endpoints
const RATE_LIMITS: Record<string, RateLimitConfig> = {
  '/api/google-ads': { max: 30, windowMs: 15 * 60 * 1000 }, // 30 requests per 15 minutes
  '/api/facebook-ads': { max: 30, windowMs: 15 * 60 * 1000 }, // 30 requests per 15 minutes
  '/api/dashboard': { max: 60, windowMs: 15 * 60 * 1000 }, // 60 requests per 15 minutes
  '/api': { max: 100, windowMs: 15 * 60 * 1000 }, // Default: 100 requests per 15 minutes
};

// Rate limiting storage
interface RateLimitEntry {
  count: number;
  resetTime: number;
}

const rateLimitCache = new LRUCache<string, RateLimitEntry>({
  max: 1000,
  ttl: 60 * 60 * 1000, // 1 hour TTL
});

/**
 * Get client IP address
 */
function getClientIP(request: NextRequest): string {
  // Check various headers for the real IP
  const forwarded = request.headers.get('x-forwarded-for');
  const realIP = request.headers.get('x-real-ip');
  const cfConnectingIP = request.headers.get('cf-connecting-ip');
  
  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }
  
  if (realIP) {
    return realIP;
  }
  
  if (cfConnectingIP) {
    return cfConnectingIP;
  }
  
  // Fallback for unknown client
  return 'unknown';
}

/**
 * Get rate limit configuration for a path
 */
function getRateLimitConfig(pathname: string): RateLimitConfig {
  // Find the most specific matching rule
  const matchingPath = Object.keys(RATE_LIMITS)
    .filter(path => pathname.startsWith(path))
    .sort((a, b) => b.length - a.length)[0]; // Get the longest match
  
  return RATE_LIMITS[matchingPath] || RATE_LIMITS['/api'];
}

/**
 * Check rate limit for a client
 */
function checkRateLimit(clientIP: string, pathname: string): {
  allowed: boolean;
  limit: number;
  remaining: number;
  resetTime: number;
} {
  const config = getRateLimitConfig(pathname);
  const key = `${clientIP}:${pathname}`;
  const now = Date.now();
  
  let entry = rateLimitCache.get(key);
  
  if (!entry || now >= entry.resetTime) {
    // Create new entry or reset expired entry
    entry = {
      count: 1,
      resetTime: now + config.windowMs,
    };
    rateLimitCache.set(key, entry);
    
    return {
      allowed: true,
      limit: config.max,
      remaining: config.max - 1,
      resetTime: entry.resetTime,
    };
  }
  
  // Increment count
  entry.count++;
  rateLimitCache.set(key, entry);
  
  const allowed = entry.count <= config.max;
  const remaining = Math.max(0, config.max - entry.count);
  
  return {
    allowed,
    limit: config.max,
    remaining,
    resetTime: entry.resetTime,
  };
}

/**
 * Validate API key for internal requests
 */
function validateAPIKey(request: NextRequest): boolean {
  const authHeader = request.headers.get('authorization');
  const apiKey = process.env.API_KEY;
  
  if (!apiKey) {
    console.warn('API_KEY not configured in environment variables');
    return false;
  }
  
  if (!authHeader) {
    return false;
  }
  
  // Support both "Bearer token" and "token" formats
  const token = authHeader.startsWith('Bearer ') 
    ? authHeader.slice(7) 
    : authHeader;
    
  return token === apiKey;
}

/**
 * Check if request is from localhost (development)
 */
function isLocalhost(request: NextRequest): boolean {
  const host = request.headers.get('host');
  return host?.includes('localhost') || host?.includes('127.0.0.1') || false;
}

/**
 * Log API request for monitoring
 */
function logAPIRequest(request: NextRequest, clientIP: string, status: string): void {
  if (process.env.DEBUG_API_CALLS === 'true') {
    console.log(JSON.stringify({
      timestamp: new Date().toISOString(),
      method: request.method,
      url: request.url,
      clientIP,
      userAgent: request.headers.get('user-agent'),
      status,
    }));
  }
}

/**
 * Handle authentication for protected routes
 */
async function handleAuthentication(request: NextRequest): Promise<NextResponse> {
  const { pathname } = request.nextUrl;
  
  const token = await getToken({ 
    req: request, 
    secret: process.env.NEXTAUTH_SECRET 
  });

  // Check if route requires authentication
  const isProtectedRoute = PROTECTED_ROUTES.some(route => pathname.startsWith(route));
  const isClientPortal = pathname.startsWith('/portal/');
  
  if ((isProtectedRoute || isClientPortal) && !token) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('callbackUrl', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Role-based access control
  if (token) {
    const userRole = token.role as string;
    
    // Admin-only routes
    const isAdminRoute = ADMIN_ONLY_ROUTES.some(route => pathname.startsWith(route));
    if (isAdminRoute && userRole !== 'admin') {
      return NextResponse.redirect(new URL('/access-denied', request.url));
    }
    
    // Client portal access
    if (pathname.startsWith('/portal/')) {
      const clientSlug = pathname.split('/portal/')[1]?.split('/')[0];
      
      if (userRole === 'client') {
        // Check if client is accessing their own portal
        const userClientSlug = token.clientSlug as string;
        if (clientSlug !== userClientSlug) {
          return NextResponse.redirect(new URL('/access-denied', request.url));
        }
      }
      // Admins can access any client portal
    }
    
    // Redirect authenticated users away from login page (unless forcing logout)
    if (pathname === '/login' || pathname === '/sign-in') {
      const { searchParams } = new URL(request.url);
      const forceLogin = searchParams.get('force') === 'true';
      
      if (!forceLogin) {
        if (userRole === 'admin') {
          return NextResponse.redirect(new URL('/dashboards', request.url));
        } else {
          const clientSlug = token.clientSlug as string;
          return NextResponse.redirect(new URL(`/portal/${clientSlug}`, request.url));
        }
      }
    }
  }

  return NextResponse.next();
}

/**
 * Main middleware function
 */
export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const clientIP = getClientIP(request);
  
  // Handle authentication for protected routes
  if (!pathname.startsWith('/api/')) {
    return await handleAuthentication(request);
  }
  
  // Skip rate limiting for localhost in development
  const isDevelopment = process.env.NODE_ENV === 'development';
  const skipRateLimit = isDevelopment && isLocalhost(request);
  
  try {
    // Rate limiting check
    if (!skipRateLimit) {
      const rateLimitResult = checkRateLimit(clientIP, pathname);
      
      if (!rateLimitResult.allowed) {
        logAPIRequest(request, clientIP, 'RATE_LIMITED');
        
        return new NextResponse(
          JSON.stringify({
            success: false,
            error: 'RATE_LIMIT_EXCEEDED',
            message: 'Too many requests. Please try again later.',
            timestamp: new Date().toISOString(),
          }),
          {
            status: 429,
            headers: {
              'Content-Type': 'application/json',
              'X-RateLimit-Limit': rateLimitResult.limit.toString(),
              'X-RateLimit-Remaining': rateLimitResult.remaining.toString(),
              'X-RateLimit-Reset': new Date(rateLimitResult.resetTime).toISOString(),
              'Retry-After': Math.ceil((rateLimitResult.resetTime - Date.now()) / 1000).toString(),
            },
          }
        );
      }
      
      // Add rate limit headers to successful responses
      const response = NextResponse.next();
      response.headers.set('X-RateLimit-Limit', rateLimitResult.limit.toString());
      response.headers.set('X-RateLimit-Remaining', rateLimitResult.remaining.toString());
      response.headers.set('X-RateLimit-Reset', new Date(rateLimitResult.resetTime).toISOString());
    }
    
    // API key validation for protected endpoints
    if (pathname.startsWith('/api/google-ads') || 
        pathname.startsWith('/api/facebook-ads') || 
        pathname.startsWith('/api/dashboard')) {
      
      const isValidAPIKey = validateAPIKey(request);
      
      if (!isValidAPIKey && !skipRateLimit) {
        logAPIRequest(request, clientIP, 'UNAUTHORIZED');
        
        return new NextResponse(
          JSON.stringify({
            success: false,
            error: 'UNAUTHORIZED',
            message: 'Invalid or missing API key',
            timestamp: new Date().toISOString(),
          }),
          {
            status: 401,
            headers: {
              'Content-Type': 'application/json',
            },
          }
        );
      }
    }
    
    // Security headers
    const response = NextResponse.next();
    
    // Add security headers
    response.headers.set('X-Content-Type-Options', 'nosniff');
    response.headers.set('X-Frame-Options', 'DENY');
    response.headers.set('X-XSS-Protection', '1; mode=block');
    response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
    
    // CORS headers for API routes
    if (pathname.startsWith('/api/')) {
      response.headers.set('Access-Control-Allow-Origin', '*');
      response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
      response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    }
    
    logAPIRequest(request, clientIP, 'ALLOWED');
    return response;
    
  } catch (error) {
    console.error('Middleware error:', error);
    logAPIRequest(request, clientIP, 'ERROR');
    
    return new NextResponse(
      JSON.stringify({
        success: false,
        error: 'MIDDLEWARE_ERROR',
        message: 'Internal server error',
        timestamp: new Date().toISOString(),
      }),
      {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );
  }
}

/**
 * Configure which paths the middleware should run on
 */
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     * - assets folder
     */
    '/((?!_next/static|_next/image|favicon.ico|public|assets).*)',
  ],
};

/**
 * Get rate limit stats (for monitoring dashboard)
 */
export function getRateLimitStats() {
  return {
    cacheSize: rateLimitCache.size,
    cacheMax: rateLimitCache.max,
    calculatedSize: rateLimitCache.calculatedSize,
  };
}