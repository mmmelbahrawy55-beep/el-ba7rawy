import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  
  // Define protected paths
  const isApiProtected = pathname.startsWith('/api/') && 
    ['POST', 'PUT', 'DELETE', 'PATCH'].includes(request.method) &&
    !pathname.startsWith('/api/orders') && // Allow order creation
    !pathname.startsWith('/api/auth') && // Allow login
    !pathname.startsWith('/api/marketing') // Allow marketing AI interactions

  const isAdminPath = pathname.startsWith('/admin')

  // Check for auth token in cookies
  const token = request.cookies.get('admin_token')

  if (isAdminPath || isApiProtected) {
    if (!token && isAdminPath && pathname !== '/admin') {
      // If no token and trying to access admin dashboard directly (not the login page)
      // Note: My current admin/page.tsx handles login internally, but middleware can still help
    }
    
    if (isApiProtected && !token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/admin/:path*', '/api/:path*'],
}
