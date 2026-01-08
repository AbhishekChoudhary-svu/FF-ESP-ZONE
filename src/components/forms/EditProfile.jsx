"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"

export function EditProfileForm({ user, onClose }) {
  const [formData, setFormData] = useState({
    username: user?.username || "",
    email: user?.email || "",
    ffUid: user?.ffUid || "",
    bio: user?.bio || "",
    rank: user?.rank || "Beginner",
    playstyle: user?.playstyle || "Aggressive",
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
      const response = await fetch("/api/users/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      })

      if (!response.ok) {
        throw new Error("Failed to update profile")
      }

      onClose?.()
      window.location.reload()
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className="p-6 border-border">
      <h2 className="text-2xl font-bold mb-6">Edit Profile</h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-2">Username</label>
          <Input name="username" value={formData.username} onChange={handleChange} required />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Email</label>
          <Input type="email" name="email" value={formData.email} onChange={handleChange} required />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Free Fire UID</label>
          <Input name="ffUid" value={formData.ffUid} onChange={handleChange} required />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Bio</label>
          <Input name="bio" placeholder="Tell about yourself" value={formData.bio} onChange={handleChange} />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">Rank</label>
            <select
              name="rank"
              value={formData.rank}
              onChange={handleChange}
              className="w-full px-3 py-2 rounded-md border border-border bg-background text-foreground"
            >
              <option>Beginner</option>
              <option>Intermediate</option>
              <option>Advanced</option>
              <option>Professional</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Playstyle</label>
            <select
              name="playstyle"
              value={formData.playstyle}
              onChange={handleChange}
              className="w-full px-3 py-2 rounded-md border border-border bg-background text-foreground"
            >
              <option>Aggressive</option>
              <option>Defensive</option>
              <option>Balanced</option>
              <option>Sniper</option>
            </select>
          </div>
        </div>

        {error && <div className="text-red-500 text-sm">{error}</div>}

        <div className="flex gap-3">
          <Button type="submit" disabled={loading} className="flex-1">
            {loading ? "Saving..." : "Save Changes"}
          </Button>
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
        </div>
      </form>
    </Card>
  )
}
