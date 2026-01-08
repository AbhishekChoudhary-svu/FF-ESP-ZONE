import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"


export function PlayerCard({ player }) {
  return (
    <Card className="p-4 border-border hover:border-primary/50 transition-colors">
      <div className="flex items-start justify-between mb-3">
        <div>
          <h4 className="font-bold text-sm mb-1">{player.name}</h4>
          <span className="px-2 py-1 bg-accent/20 text-accent rounded text-xs font-semibold">{player.role}</span>
        </div>
        <button className="text-2xl">❤️</button>
      </div>

      <div className="space-y-2 mb-4 text-sm">
        <div className="flex justify-between">
          <span className="text-muted-foreground">K/D Ratio</span>
          <span className="font-semibold text-primary">{player.kdRatio}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">Likes</span>
          <span className="font-semibold">{player.likes}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">Matches</span>
          <span className="font-semibold">{player.matches}</span>
        </div>
      </div>

      <Button size="sm" className="w-full">
        Send Request
      </Button>
    </Card>
  )
}
