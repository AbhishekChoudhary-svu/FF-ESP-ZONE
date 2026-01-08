import { LoginForm } from "@/components/auth/LoginForm"

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-20">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold mb-2">Welcome Back</h1>
          <p className="text-muted-foreground">Sign in to your FF-ESP-ZONE account</p>
        </div>
        <LoginForm />
      </div>
    </div>
  )
}
