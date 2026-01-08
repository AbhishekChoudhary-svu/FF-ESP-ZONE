import { SignupForm } from "@/components/auth/SignupForm"

export default function SignupPage() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-20">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold mb-2">Join FF-ESP-ZONE</h1>
          <p className="text-muted-foreground">Create your account to start competing</p>
        </div>
        <SignupForm />
      </div>
    </div>
  )
}
