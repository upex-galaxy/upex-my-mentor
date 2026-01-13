/**
 * Minimal Layout - Route Group (minimal)
 *
 * This layout applies to pages that should NOT have the standard Navbar/Footer.
 * Pages in this group: Login, Signup, Password Reset, Checkout, API Docs.
 */

interface MinimalLayoutProps {
  children: React.ReactNode
}

export default function MinimalLayout({ children }: MinimalLayoutProps) {
  return <>{children}</>
}
