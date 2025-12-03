import { UserPlus } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Navbar } from '@/components/layout/navbar'
import { SignupForm } from '@/components/auth/signup-form'

interface SignupPageProps {
  searchParams: Promise<{ role?: string }>
}

export default async function SignupPage({ searchParams }: SignupPageProps) {
  const params = await searchParams
  const roleParam = params.role

  // Validate role param - only accept 'mentor' or 'student'
  const defaultRole =
    roleParam === 'mentor' || roleParam === 'student' ? roleParam : undefined

  return (
    <div data-testid="signupPage" className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 flex items-center justify-center p-4 bg-gradient-to-br from-purple-50 via-fuchsia-50 to-violet-50">
        <Card data-testid="signup_card" className="w-full max-w-md shadow-lg">
          <CardHeader className="space-y-1 text-center">
            <div className="mx-auto mb-4 h-12 w-12 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center">
              <UserPlus className="h-6 w-6 text-white" />
            </div>
            <CardTitle className="text-2xl">Únete a la comunidad</CardTitle>
            <CardDescription>
              Conecta con expertos verificados o comparte tu conocimiento
            </CardDescription>
          </CardHeader>
          <CardContent>
            <SignupForm defaultRole={defaultRole} />
          </CardContent>
        </Card>
      </main>
    </div>
  )
}

export const metadata = {
  title: 'Crear Cuenta | Upex My Mentor',
  description: 'Únete a la comunidad de mentoría tech. Registrate como mentor o estudiante.',
}
