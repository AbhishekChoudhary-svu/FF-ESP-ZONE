"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Settings, Cpu, Loader2, Megaphone } from "lucide-react";
import { useToast } from "@/components/ui/GameToast";

const TOGGLES = [
  {
    key: "maintenanceMode",
    label: "Maintenance Mode",
    desc: "Block all non-admin access to the platform",
    warn: true,
  },
  {
    key: "allowGuestLogin",
    label: "Allow Guest Login",
    desc: "Let users browse without authentication",
    warn: false,
  },
  {
    key: "announcementActive",
    label: "Show Announcement Banner",
    desc: "Broadcast site-wide alert to all operators",
    warn: false,
  },
];

export default function SettingsTab() {
  const toast = useToast();
  // ── Existing state ────────────────────────────────────────────────────────
  const [form, setForm] = useState({
    maintenanceMode: false,
    allowGuestLogin: true,
    maxTeamSize: 6,
    announcementText: "",
    announcementActive: false,
  });
  const [loading, setLoading] = useState(false);

  // ── NEW: broadcast state ──────────────────────────────────────────────────
  const [broadcastForm, setBroadcastForm] = useState({
    title: "",
    message: "",
    type: "announcement",
  });
  const [broadcasting, setBroadcasting] = useState(false);

  // ── Existing save handler ─────────────────────────────────────────────────
  const handleSave = async () => {
    setLoading(true);

    try {
      const res = await fetch("/api/admin/settings", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(form),
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error("Save Failed", data.error || "Failed to save settings");
        return;
      }

      toast.announcement(
        "Settings Updated",
        "System parameters committed successfully",
      );
    } catch (err) {
      console.error(err);

      toast.error("System Error", "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  // ── NEW: broadcast handler ────────────────────────────────────────────────
  const handleBroadcast = async () => {
    if (!broadcastForm.title.trim() || !broadcastForm.message.trim()) {
      toast.error("Validation Error", "Title and message are required");
      return;
    }

    setBroadcasting(true);

    try {
      const res = await fetch("/api/notifications/broadcast", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(broadcastForm),
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(
          "Broadcast Failed",
          data.error || "Failed to send notification",
        );
        return;
      }

      toast.announcement(
        "Broadcast Sent",
        "Notification delivered to all users",
      );

      setBroadcastForm({
        title: "",
        message: "",
        type: "announcement",
      });
    } catch (err) {
      console.error(err);

      toast.error("System Error", "Something went wrong");
    } finally {
      setBroadcasting(false);
    }
  };

  const inputCls =
    "w-full px-3 py-2 bg-background border border-border rounded-sm text-foreground placeholder-muted-foreground text-sm font-semibold focus:outline-none focus:border-primary/50 transition-colors";

  return (
    <div className="space-y-6 font-sans text-foreground">
      {/* ── Header ─────────────────────────────────────────────────────────── */}
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

      {/* ── Warning banner ─────────────────────────────────────────────────── */}
      <Card className="p-4 border border-destructive/20 bg-destructive/5 rounded-sm">
        <p className="text-xs text-destructive font-bold uppercase tracking-wider flex items-center gap-2">
          <span>⚠️</span> Configuration changes propagate to all platform nodes
          immediately
        </p>
      </Card>

      {/* ── Toggle controls ────────────────────────────────────────────────── */}
      <div className="space-y-3">
        <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-1">
          <Cpu className="h-3 w-3" /> Toggle Directives
        </p>
        {TOGGLES.map((s) => (
          <div
            key={s.key}
            className={`flex items-center justify-between p-4 rounded-sm border transition-all duration-150 ${
              form[s.key] && s.warn
                ? "bg-destructive/5 border-destructive/30"
                : "bg-card/30 border-border/80 hover:border-border"
            }`}
          >
            <div>
              <p
                className={`text-sm font-bold font-display tracking-wide uppercase ${
                  form[s.key] && s.warn ? "text-destructive" : "text-white"
                }`}
              >
                {s.label}
              </p>
              <p className="text-[11px] text-muted-foreground">{s.desc}</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer flex-shrink-0 ml-4">
              <input
                type="checkbox"
                checked={form[s.key]}
                onChange={(e) =>
                  setForm((p) => ({ ...p, [s.key]: e.target.checked }))
                }
                className="sr-only peer"
              />
              <div className="w-10 h-5 bg-card border border-border peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-5 peer-checked:bg-primary after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all" />
            </label>
          </div>
        ))}
      </div>

      {/* ── Announcement text ──────────────────────────────────────────────── */}
      {form.announcementActive && (
        <div>
          <Label className="text-[10px] font-display font-bold tracking-widest text-muted-foreground uppercase mb-1.5 block">
            Broadcast Message Content
          </Label>
          <textarea
            value={form.announcementText}
            onChange={(e) =>
              setForm((p) => ({ ...p, announcementText: e.target.value }))
            }
            placeholder="Enter platform-wide announcement payload..."
            rows={3}
            className={`${inputCls} resize-none`}
          />
        </div>
      )}

      {/* ── Max team size ──────────────────────────────────────────────────── */}
      <div>
        <Label className="text-[10px] font-display font-bold tracking-widest text-muted-foreground uppercase mb-1.5 block">
          Maximum Unit Capacity Per Operation
        </Label>
        <Input
          type="number"
          min="2"
          max="10"
          value={form.maxTeamSize}
          onChange={(e) =>
            setForm((p) => ({ ...p, maxTeamSize: Number(e.target.value) }))
          }
          className="bg-background border border-border rounded-sm text-foreground text-sm font-semibold focus-visible:ring-primary/50 focus-visible:border-primary/50 h-9"
        />
        <p className="text-[10px] text-muted-foreground uppercase tracking-wider mt-1">
          Current:{" "}
          <span className="text-accent font-bold">
            {form.maxTeamSize} operators
          </span>{" "}
          per squad
        </p>
      </div>

      {/* ── Commit button ──────────────────────────────────────────────────── */}
      <Button
        onClick={handleSave}
        disabled={loading}
        className="w-full h-10 bg-gradient-to-r from-primary to-accent text-white font-display font-black text-xs uppercase tracking-widest rounded-sm disabled:opacity-50 transition-all duration-150 hover:opacity-90 hover:shadow-[0_0_20px_rgba(255,107,0,0.3)] cursor-pointer"
      >
        {loading ? (
          <span className="flex items-center justify-center gap-2">
            <Loader2 className="w-3.5 h-3.5 animate-spin" /> Committing
            Parameters...
          </span>
        ) : (
          "💾 Commit System Parameters"
        )}
      </Button>

      {/* ── NEW: Broadcast notification section ────────────────────────────── */}
      <div className="border-t border-border/50 pt-6">
        <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-1 mb-3">
          <Megaphone className="h-3 w-3" /> Notification Broadcast
        </p>

        <div className="space-y-3 p-4 bg-card/20 border border-border/80 rounded-sm">
          <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
            ◆ Broadcast to All Users
          </p>

          <div>
            <Label className="text-[10px] font-bold tracking-widest text-muted-foreground uppercase mb-1 block">
              Title
            </Label>
            <input
              placeholder="Notification title..."
              value={broadcastForm.title}
              onChange={(e) =>
                setBroadcastForm((p) => ({ ...p, title: e.target.value }))
              }
              className={inputCls}
            />
          </div>

          <div>
            <Label className="text-[10px] font-bold tracking-widest text-muted-foreground uppercase mb-1 block">
              Message
            </Label>
            <textarea
              placeholder="Notification message..."
              value={broadcastForm.message}
              onChange={(e) =>
                setBroadcastForm((p) => ({ ...p, message: e.target.value }))
              }
              rows={2}
              className={`${inputCls} resize-none`}
            />
          </div>

          <div>
            <Label className="text-[10px] font-bold tracking-widest text-muted-foreground uppercase mb-1 block">
              Type
            </Label>
            <select
              value={broadcastForm.type}
              onChange={(e) =>
                setBroadcastForm((p) => ({ ...p, type: e.target.value }))
              }
              className={inputCls}
            >
              <option value="announcement">📣 Announcement</option>
              <option value="tournament">🎮 Tournament</option>
              <option value="result">🏆 Result</option>
              <option value="prize">💰 Prize</option>
            </select>
          </div>

          <Button
            onClick={handleBroadcast}
            disabled={broadcasting}
            className="w-full h-9 bg-gradient-to-r from-primary to-accent text-white font-display font-black text-xs uppercase tracking-widest rounded-sm disabled:opacity-50 transition-all hover:opacity-90 active:scale-[.98] cursor-pointer"
          >
            {broadcasting ? (
              <span className="flex items-center justify-center gap-2">
                <Loader2 className="w-3.5 h-3.5 animate-spin" /> Sending...
              </span>
            ) : (
              "📣 Broadcast to All Users"
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
