"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import Link from "next/link"

export function SignupForm() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [ffUid, setFfUid] = useState("")
  const [username, setUsername] = useState("")
  const [error, setError] = useState("")

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError("")

    if (password !== confirmPassword) {
      setError("Passwords do not match")
      return
    }

    // Mock signup - in production, call your auth API
    try {
      const response = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, username, ffUid }),
      })

      if (!response.ok) {
        throw new Error("Signup failed")
      }

      // Redirect to dashboard
      window.location.href = "/dashboard"
    } catch (err) {
      setError("An error occurred during signup")
    }
  }

  return (
    <Card className="p-6 border-border">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-2">Username</label>
          <Input placeholder="Enter username" value={username} onChange={(e) => setUsername(e.target.value)} required />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Email</label>
          <Input
            type="email"
            placeholder="your@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Free Fire UID</label>
          <Input placeholder="Your Free Fire ID" value={ffUid} onChange={(e) => setFfUid(e.target.value)} required />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Password</label>
          <Input
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Confirm Password</label>
          <Input
            type="password"
            placeholder="••••••••"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
          />
        </div>

        {error && <div className="text-destructive text-sm bg-destructive/10 p-3 rounded">{error}</div>}

        <Button type="submit" className="w-full">
          Create Account
        </Button>

        <p className="text-center text-sm text-muted-foreground">
          Already have an account?{" "}
          <Link href="/login" className="text-primary hover:underline">
            Sign in
          </Link>
        </p>
      </form>
    </Card>
  )
}
