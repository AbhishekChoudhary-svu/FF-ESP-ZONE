import { useEffect, useState } from "react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { DarkDialog, PrimaryBtn, UploadZone, labelCls, inputCls } from "../shared/primitives"
import { useLogoUpload } from "../shared/useUploads"

const STATUSES = ["active", "inactive", "disbanded"]
const TIERS    = ["Amateur", "Semi-Pro", "Pro"]

export function EditTeamDialog({ open, onOpenChange, hasTeam, team, playerId, onSuccess }) {
  const [teamName, setTeamName] = useState("")
  const [tag, setTag]           = useState("")
  const [status, setStatus]     = useState("active")
  const [tier, setTier]         = useState("Amateur")

  const { logo, logoPreview, handleLogoChange, removeLogo, resetLogo } = useLogoUpload()

  // Sync from context when team data arrives or dialog opens
  useEffect(() => {
    if (!team) return
    setTeamName(team.teamName || "")
    setTag(team.tag || "")
    setStatus(team.status || "active")
    setTier(team.tier || "Amateur")
    resetLogo(team.logo || null)   // ← sync logo
  }, [team, open]) // ← re-run when dialog opens too

  const handleSubmit = async (e) => {
    e.preventDefault()
    const payload = { teamName, tag, logo, status, tier }
    const res = await fetch(`/api/teams/${playerId}`, {
      method:  hasTeam ? "PATCH" : "POST",
      headers: { "Content-Type": "application/json" },
      body:    JSON.stringify(payload),
    })
    const data = await res.json()
    if (data.success) {
      onOpenChange(false)
      onSuccess?.()
    }
  }

  return (
    <DarkDialog open={open} onOpenChange={onOpenChange} title={hasTeam ? "Edit Team Details" : "Create Team"}>
      <form onSubmit={handleSubmit} className="space-y-4">

        <div>
          <span className={labelCls}>Team Logo</span>
          <div className="flex items-center gap-4">
            <UploadZone preview={logoPreview} accept="image/*" label="Upload Logo" circle onFile={handleLogoChange} onRemove={removeLogo} />
            <p className="text-[11px] text-[#4a5060]">PNG / JPG<br />Square recommended</p>
          </div>
        </div>

        <div>
          <label className={labelCls}>Team Name</label>
          <Input value={teamName} onChange={(e) => setTeamName(e.target.value)} placeholder="Enter team name" required className={inputCls} />
        </div>

        <div>
          <label className={labelCls}>Team Tag</label>
          <Input value={tag} onChange={(e) => setTag(e.target.value.toUpperCase())} maxLength={5} placeholder="TSM" required className={inputCls} />
        </div>

        <div>
          <label className={labelCls}>Status</label>
          <SelectField value={status} onChange={setStatus} options={STATUSES} />
        </div>

        <div>
          <label className={labelCls}>Tier</label>
          <SelectField value={tier} onChange={setTier} options={TIERS} />
        </div>

        <PrimaryBtn type="submit" className="w-full">
          {hasTeam ? "⚙ Update Team" : "🛡 Create Team"}
        </PrimaryBtn>
      </form>
    </DarkDialog>
  )
}

function SelectField({ value, onChange, options }) {
  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger className="bg-[#0f1318] border border-[#2a2e3a] text-[#d0d5df] font-['Rajdhani']"><SelectValue /></SelectTrigger>
      <SelectContent className="bg-[#0f1318] border border-[#2a2e3a] text-[#d0d5df] font-['Rajdhani']">
        {options.map((o) => <SelectItem key={o} value={o}>{o}</SelectItem>)}
      </SelectContent>
    </Select>
  )
}