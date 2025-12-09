import { createServerClient } from '@supabase/ssr'
import { NextResponse } from 'next/server'

import type { NextRequest } from 'next/server'
import type { Database } from '@/types/supabase'

export async function middleware(req: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request: req,
  })

  const supabase = createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return req.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => req.cookies.set(name, value))
          supabaseResponse = NextResponse.next({
            request: req,
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // IMPORTANT: Use getUser() instead of getSession() for security
  // getSession() reads from cookies which can be spoofed
  // getUser() validates the JWT with Supabase Auth server
  const {
    data: { user },
  } = await supabase.auth.getUser()

  // Define public routes that don't require authentication
  const publicRoutes = ['/', '/login', '/signup']
  const isPublicRoute = publicRoutes.includes(req.nextUrl.pathname)
  const isMentorsRoute = req.nextUrl.pathname.startsWith('/mentors')
  const isPasswordResetRoute = req.nextUrl.pathname.startsWith('/password-reset')
  const isAdminRoute = req.nextUrl.pathname.startsWith('/admin')

  // if user is not signed in and the current path is not a public route, redirect the user to /login
  if (!user && !isPublicRoute && !isMentorsRoute && !isPasswordResetRoute) {
    const redirectUrl = new URL('/login', req.url)
    // Preserve the original URL so user can be redirected back after login
    redirectUrl.searchParams.set('redirectTo', req.nextUrl.pathname)
    // IMPORTANT: Copy cookies to the redirect response
    const redirectResponse = NextResponse.redirect(redirectUrl)
    supabaseResponse.cookies.getAll().forEach((cookie) => {
      redirectResponse.cookies.set(cookie.name, cookie.value, cookie)
    })
    return redirectResponse
  }

  // For admin routes, verify user has admin role
  if (isAdminRoute && user) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (profile?.role !== 'admin') {
      // Non-admin users are redirected to dashboard
      const redirectResponse = NextResponse.redirect(new URL('/dashboard', req.url))
      supabaseResponse.cookies.getAll().forEach((cookie) => {
        redirectResponse.cookies.set(cookie.name, cookie.value, cookie)
      })
      return redirectResponse
    }
  }

  // if user is signed in and the current path is /login or /signup, redirect the user to /dashboard
  if (user && (req.nextUrl.pathname === '/login' || req.nextUrl.pathname === '/signup')) {
    const redirectResponse = NextResponse.redirect(new URL('/dashboard', req.url))
    // IMPORTANT: Copy cookies to the redirect response
    supabaseResponse.cookies.getAll().forEach((cookie) => {
      redirectResponse.cookies.set(cookie.name, cookie.value, cookie)
    })
    return redirectResponse
  }

  return supabaseResponse
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * Feel free to modify this pattern to include more paths.
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
}
