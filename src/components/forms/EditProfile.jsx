"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"

export function EditProfileForm({ user, onClose }) {
  const [formData, setFormData] = useState({
    username: user?.username || "",
    ffUid: user?.ffUid || "",
    bio: user?.bio || "",
    rank: user?.rank || "Beginner",
    playstyle: user?.playstyle || "Primary Rusher",
  })

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    try {
      const res = await fetch("/api/users", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      })

      const data = await res.json()

      if (!res.ok) throw new Error(data.error || "Update failed")

      onClose()
      window.location.reload()
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
  <Card className="rounded-2xl border border-border bg-card/80 backdrop-blur-md p-6 shadow-sm">
  <form onSubmit={handleSubmit} className="space-y-5">

    {/* Username */}
    <div className="space-y-1.5">
      <label className="text-sm font-medium text-foreground">
        Username
      </label>
      <Input
        name="username"
        value={formData.username}
        onChange={handleChange}
        className="bg-background border-border transition-all focus-visible:ring-2 focus-visible:ring-primary/60"
        placeholder="Username..."
      />
    </div>

    {/* Free Fire UID */}
    <div className="space-y-1.5">
      <label className="text-sm font-medium text-foreground">
        Free Fire UID
      </label>
      <Input
        name="ffUid"
        value={formData.ffUid}
        onChange={handleChange}
        className="bg-background border-border transition-all focus-visible:ring-2 focus-visible:ring-primary/60"
        placeholder="123456789.."
      />
    </div>

    {/* Bio (Textarea) */}
    <div className="space-y-1.5">
      <label className="text-sm font-medium text-foreground">
        Bio
      </label>
      <textarea
        name="bio"
        value={formData.bio}
        onChange={handleChange}
        rows={3}
        className="w-full resize-none rounded-md border border-border bg-background px-3 py-2 text-sm transition-all focus:outline-none focus:ring-2 focus:ring-primary/60"
        placeholder="Tell us about your playstyle..."
      />
    </div>

    {/* Rank & Playstyle */}
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      <div className="space-y-1.5">
        <label className="text-sm font-medium text-foreground">
          Rank
        </label>
        <select
          name="rank"
          value={formData.rank}
          onChange={handleChange}
          className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm transition-all focus:outline-none focus:ring-2 focus:ring-primary/60"
        >
          <option>Beginner</option>
          <option>Intermediate</option>
          <option>Advanced</option>
          <option>Professional</option>
        </select>
      </div>

      <div className="space-y-1.5">
        <label className="text-sm font-medium text-foreground">
          Playstyle
        </label>
        <select
          name="playstyle"
          value={formData.playstyle}
          onChange={handleChange}
          className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm transition-all focus:outline-none focus:ring-2 focus:ring-primary/60"
        >
          <option>Primary Rusher</option>
          <option>Secondary Rusher</option>
          <option>Assaulter / Nader</option>
          <option>Sniper</option>
        </select>
      </div>
    </div>

    {/* Error */}
    {error && (
      <p className="text-sm text-destructive">
        {error}
      </p>
    )}

    {/* Actions */}
    <div className="flex gap-3 pt-3">
      <Button
        type="submit"
        className="flex-1 rounded-lg transition-all"
        disabled={loading}
      >
        {loading ? "Saving..." : "Save Changes"}
      </Button>

      <Button
        type="button"
        variant="outline"
        onClick={onClose}
        className="rounded-lg"
      >
        Cancel
      </Button>
    </div>

  </form>
</Card>


  )
}
