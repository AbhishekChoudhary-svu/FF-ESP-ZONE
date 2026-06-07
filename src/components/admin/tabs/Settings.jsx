"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Settings, Cpu, Loader2 } from "lucide-react"
import toast from "react-hot-toast"

const TOGGLES = [
  {
    key:   "maintenanceMode",
    label: "Maintenance Mode",
    desc:  "Block all non-admin access to the platform",
    warn:  true,
  },
  {
    key:   "allowGuestLogin",
    label: "Allow Guest Login",
    desc:  "Let users browse without authentication",
    warn:  false,
  },
  {
    key:   "announcementActive",
    label: "Show Announcement Banner",
    desc:  "Broadcast site-wide alert to all operators",
    warn:  false,
  },
]

export default function SettingsTab() {
  const [form, setForm] = useState({
    maintenanceMode:    false,
    allowGuestLogin:    true,
    maxTeamSize:        6,
    announcementText:   "",
    announcementActive: false,
  })
  const [loading, setLoading] = useState(false)

  const handleSave = async () => {
    setLoading(true)
    try {
      const res  = await fetch("/api/admin/settings", {
        method: "PATCH", headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      })
      const data = await res.json()
      if (!res.ok) { toast.error(data.error || "Failed"); return }
      toast.success("System parameters committed")
    } catch { toast.error("Something went wrong") }
    finally   { setLoading(false) }
  }

  return (
    <div className="space-y-6 font-sans text-foreground">

      {/* Header */}
      <div className="flex justify-between items-center border-b border-border pb-4">
        <div>
          <h3 className="text-xl font-bold font-display tracking-wider text-primary flex items-center gap-2 uppercase">
            <Settings className="h-5 w-5 text-primary shrink-0" />
            System Configuration Matrix
          </h3>
          <p className="text-[11px] text-muted-foreground font-semibold uppercase tracking-widest mt-1">
            Platform variables // global enforcement parameters
          </p>
        </div>
      </div>

      {/* Warning Banner */}
      <Card className="p-4 border border-destructive/20 bg-destructive/5 rounded-sm">
        <p className="text-xs text-destructive font-bold uppercase tracking-wider flex items-center gap-2">
          <span>⚠️</span> Configuration changes propagate to all platform nodes immediately
        </p>
      </Card>

      {/* Toggle Controls */}
      <div className="space-y-3">
        <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-1">
          <Cpu className="h-3 w-3" /> Toggle Directives
        </p>
        {TOGGLES.map(s => (
          <div
            key={s.key}
            className={`flex items-center justify-between p-4 rounded-sm border transition-all duration-150 ${
              form[s.key] && s.warn
                ? "bg-destructive/5 border-destructive/30"
                : "bg-card/30 border-border/80 hover:border-border"
            }`}
          >
            <div>
              <p className={`text-sm font-bold font-display tracking-wide uppercase ${form[s.key] && s.warn ? "text-destructive" : "text-white"}`}>
                {s.label}
              </p>
              <p className="text-[11px] text-muted-foreground">{s.desc}</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer flex-shrink-0 ml-4">
              <input
                type="checkbox"
                checked={form[s.key]}
                onChange={e => setForm(p => ({ ...p, [s.key]: e.target.checked }))}
                className="sr-only peer"
              />
              <div className="w-10 h-5 bg-card border border-border peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-5 peer-checked:bg-primary after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all" />
            </label>
          </div>
        ))}
      </div>

      {/* Announcement text */}
      {form.announcementActive && (
        <div>
          <Label className="text-[10px] font-display font-bold tracking-widest text-muted-foreground uppercase mb-1.5 block">
            Broadcast Message Content
          </Label>
          <textarea
            value={form.announcementText}
            onChange={e => setForm(p => ({ ...p, announcementText: e.target.value }))}
            placeholder="Enter platform-wide announcement payload..."
            rows={3}
            className="w-full px-3 py-2 bg-background border border-border rounded-sm text-foreground placeholder-muted-foreground text-sm font-semibold focus:outline-none focus:border-primary/50 transition-colors resize-none"
          />
        </div>
      )}

      {/* Max team size */}
      <div>
        <Label className="text-[10px] font-display font-bold tracking-widest text-muted-foreground uppercase mb-1.5 block">
          Maximum Unit Capacity Per Operation
        </Label>
        <Input
          type="number" min="2" max="10"
          value={form.maxTeamSize}
          onChange={e => setForm(p => ({ ...p, maxTeamSize: Number(e.target.value) }))}
          className="bg-background border border-border rounded-sm text-foreground text-sm font-semibold focus-visible:ring-primary/50 focus-visible:border-primary/50 h-9"
        />
        <p className="text-[10px] text-muted-foreground uppercase tracking-wider mt-1">
          Current: <span className="text-accent font-bold">{form.maxTeamSize} operators</span> per squad
        </p>
      </div>

      {/* Commit button */}
      <Button
        onClick={handleSave}
        disabled={loading}
        className="w-full h-10 bg-gradient-to-r from-primary to-accent text-white font-display font-black text-xs uppercase tracking-widest rounded-sm disabled:opacity-50 transition-all duration-150 hover:opacity-90 hover:shadow-[0_0_20px_rgba(255,107,0,0.3)] cursor-pointer"
      >
        {loading
          ? <span className="flex items-center justify-center gap-2"><Loader2 className="w-3.5 h-3.5 animate-spin" /> Committing Parameters...</span>
          : "💾 Commit System Parameters"
        }
      </Button>
    </div>
  )
}