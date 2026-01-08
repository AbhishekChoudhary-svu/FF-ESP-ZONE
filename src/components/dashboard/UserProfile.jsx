"use client"

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"

export function UserProfile({ user, onEditClick }) {
  return (
    <Card className="bg-gradient-to-r from-primary/20 to-accent/20 border-primary/30 p-8">
      <div className="flex justify-between items-start">
        <div className="flex gap-6">
          <div className="w-24 h-24 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center text-3xl font-bold">
            {user?.username?.charAt(0).toUpperCase()}
          </div>

          <div>
            <h2 className="text-3xl font-bold mb-2">{user?.username}</h2>
            <p className="text-foreground/70 mb-4">Free Fire UID: {user?.ffUid}</p>

            <div className="grid grid-cols-3 gap-6">
              <div>
                <p className="text-sm text-foreground/60">Rank</p>
                <p className="text-lg font-semibold">{user?.rank || "Beginner"}</p>
              </div>
              <div>
                <p className="text-sm text-foreground/60">Playstyle</p>
                <p className="text-lg font-semibold">{user?.playstyle || "Aggressive"}</p>
              </div>
              <div>
                <p className="text-sm text-foreground/60">Tournaments</p>
                <p className="text-lg font-semibold">{user?.tournamentsJoined || 0}</p>
              </div>
            </div>

            {user?.bio && <p className="text-sm text-foreground/70 mt-4 italic">"{user.bio}"</p>}
          </div>
        </div>

        <Button onClick={onEditClick} variant="secondary">
          Edit Profile
        </Button>
      </div>
    </Card>
  )
}
