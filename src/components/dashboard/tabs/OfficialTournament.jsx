"use client"

import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

export function OfficialEventsTab() {
  const events = [
    { id: 1, name: "Monthly Championship", status: "Ongoing", prize: 50000 },
    { id: 2, name: "Season Finale", status: "Coming Soon", prize: 100000 },
    { id: 3, name: "Qualifier Round", status: "Ended", prize: 25000 },
  ]

  return (
    <div className="space-y-6">
      <h3 className="text-2xl font-bold">Official Events</h3>

      <div className="grid gap-4">
        {events.map((event) => (
          <Card key={event.id} className="p-6 bg-gradient-to-r from-primary/10 to-accent/10 border-primary/30">
            <div className="flex justify-between items-center">
              <div>
                <h4 className="text-xl font-bold mb-2">{event.name}</h4>
                <p className="text-foreground/70">
                  Prize Pool: <span className="font-bold text-accent">${event.prize.toLocaleString()}</span>
                </p>
              </div>
              <div className="text-right">
                <span
                  className={`px-4 py-2 rounded-full text-sm font-semibold ${
                    event.status === "Ongoing"
                      ? "bg-green-500/20 text-green-400"
                      : event.status === "Coming Soon"
                        ? "bg-blue-500/20 text-blue-400"
                        : "bg-gray-500/20 text-gray-400"
                  }`}
                >
                  {event.status}
                </span>
                {event.status === "Ongoing" && (
                  <Button className="mt-2 bg-gradient-to-r from-primary to-accent">Participate</Button>
                )}
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  )
}
