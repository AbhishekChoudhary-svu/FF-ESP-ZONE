"use client"

import { useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"

export default function VerifyEmailPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const email = searchParams.get("email")
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState("")
  const [timer, setTimer] = useState(60)
  const [verified, setVerified] = useState(false)

 
  useEffect(() => {
    if (timer === 0) return

    const interval = setInterval(() => {
      setTimer((prev) => (prev <= 1 ? 0 : prev - 1))
    }, 1000)

    return () => clearInterval(interval)
  }, [timer])

 
  useEffect(() => {
    if (verified) return

    const interval = setInterval(async () => {
      try {
        const res = await fetch("/api/auth/verifyEmail", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email,
            action: "check",
          }),
        })

        const data = await res.json()

        if (data.verified) {
          clearInterval(interval)
          setVerified(true)
          router.replace("/dashboard")
        }
      } catch (err) {
        console.error("Verification check failed:", err)
      }
    }, 10000)

    return () => clearInterval(interval)
  }, [email, verified, router])

  
  const resendVerification = async () => {
    try {
      setLoading(true)
      setMessage("")

      const res = await fetch("/api/auth/verifyEmail", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          action: "resend",
        }),
      })

      const data = await res.json()

      if (!res.ok) throw new Error(data.error || "Failed to send email")

      setMessage(data.message || "Verification email sent again!")
      setTimer(60)
    } catch (err) {
      setMessage(err.message || "Try again later")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <Card className="max-w-md w-full p-6 text-center space-y-4">
        <h1 className="text-2xl font-semibold">Verify your email</h1>

        <p className="text-sm text-muted-foreground">
          Verification link sent to <b>{email}</b>
        </p>

        {message && (
          <p className="text-sm text-primary bg-primary/10 p-2 rounded">
            {message}
          </p>
        )}

        <Button
          onClick={resendVerification}
          disabled={loading || timer > 0 || verified}
          className="w-full"
        >
          {loading
            ? "Sending..."
            : timer > 0
            ? `Resend in ${timer}s`
            : "Resend verification email"}
        </Button>

        <p className="text-xs text-muted-foreground mt-2">
          Once verified, you’ll be redirected automatically.
        </p>
      </Card>
    </div>
  )
}
