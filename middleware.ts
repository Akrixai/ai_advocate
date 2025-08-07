import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { verifyJWT } from './lib/auth/jwt'

// Paths that don't require authentication
const publicPaths = [
  '/',
  '/about',
  '/contact',
  '/terms',
  '/privacy',
  '/auth/login',
  '/auth/register',
  '/auth/forgot-password',
  '/api/auth/login',
  '/api/auth/register',
  '/api/auth/forgot-password',
]

// API paths that should be public
const publicApiPaths = [
  '/api/auth/login',
  '/api/auth/register',
  '/api/auth/forgot-password',
]

// Check if the path is public
function isPublicPath(path: string) {
  return publicPaths.some(publicPath => path === publicPath || path.startsWith(publicPath))
}

export function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname
  
  // Allow public paths
  if (isPublicPath(path)) {
    return NextResponse.next()
  }

  // Check for API routes
  if (path.startsWith('/api/')) {
    // Skip auth check for public API paths (already checked in isPublicPath)
    if (publicApiPaths.includes(path)) {
      return NextResponse.next()
    }
    
    // For protected API routes, check Authorization header
    const authHeader = request.headers.get('authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
    }

    try {
      const token = authHeader.substring(7)
      
      // Validate token format before verification
      if (!token || !token.match(/^[A-Za-z0-9-_=]+\.[A-Za-z0-9-_=]+\.[A-Za-z0-9-_.+/=]*$/)) {
        return NextResponse.json({ message: 'Invalid token format' }, { status: 401 })
      }
      
      const payload = verifyJWT(token)
      
      // Add user info to request headers for downstream use
      const requestHeaders = new Headers(request.headers)
      requestHeaders.set('x-user-id', payload.userId)
      requestHeaders.set('x-user-email', payload.email)
      requestHeaders.set('x-user-type', payload.userType)
      
      return NextResponse.next({
        request: {
          headers: requestHeaders,
        },
      })
    } catch (error) {
      console.error('Token verification error:', error)
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
    }
  }

  // For non-API routes, check for token in cookies or localStorage (client-side)
  // Since localStorage is client-side only, we can't access it in middleware
  // Instead, we'll redirect to login if no token is found in cookies
  
  // Redirect to login page
  const url = new URL('/auth/login', request.url)
  url.searchParams.set('from', request.nextUrl.pathname)
  return NextResponse.redirect(url)
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}