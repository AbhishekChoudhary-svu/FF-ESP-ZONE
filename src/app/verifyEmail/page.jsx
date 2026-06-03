import { Suspense } from "react"
import VerifyEmailPage from "../../components/auth/verifyEmailPage"

export default function Page() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#07080b] flex items-center justify-center">
        <p className="text-[#ffaa00] font-['Orbitron'] text-sm uppercase tracking-widest animate-pulse">
          Initializing...
        </p>
      </div>
    }>
      <VerifyEmailPage />
    </Suspense>
  )
}