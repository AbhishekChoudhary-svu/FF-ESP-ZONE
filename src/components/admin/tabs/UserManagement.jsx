"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Shield,
  ShieldAlert,
  Search,
  Filter,
  ArrowUpDown,
  Loader2,
  UserCheck,
  Ban,
} from "lucide-react";
import toast from "react-hot-toast";

export default function UserManagement() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilter] = useState("all");
  const [sortBy, setSortBy] = useState("newest");
  const [actionId, setActionId] = useState(null);

  const fetchUsers = async () => {
    setLoading(true);

    try {
      const res = await fetch("/api/admin/users");
      const data = await res.json();

      if (data.success) {
        setUsers(data.users);
      } else {
        toast.error("Load Failed", data.error || "Failed to load users");
      }
    } catch (err) {
      console.error(err);

      toast.error("Load Failed", "Failed to load users");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleBan = async (uid, isBanned) => {
    setActionId(uid);

    try {
      const res = await fetch("/api/admin/users", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          uid,
          action: isBanned ? "unban" : "ban",
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(
          isBanned ? "Unban Failed" : "Ban Failed",
          data.error || "Operation failed",
        );
        return;
      }

      toast.announcement(
        isBanned ? "User Unbanned" : "User Banned",
        isBanned
          ? "User access has been restored"
          : "User access has been restricted",
      );

      fetchUsers();
    } catch (err) {
      console.error(err);

      toast.error("System Error", "Something went wrong");
    } finally {
      setActionId(null);
    }
  };

  const handleRoleChange = async (uid, role) => {
    setActionId(uid);

    try {
      const res = await fetch("/api/admin/users", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          uid,
          action: "role",
          role,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(
          "Role Update Failed",
          data.error || "Failed to update role",
        );
        return;
      }

      toast.team("Role Updated", `User role changed to ${role}`);

      fetchUsers();
    } catch (err) {
      console.error(err);

      toast.error("System Error", "Something went wrong");
    } finally {
      setActionId(null);
    }
  };

  const filtered = users
    .filter((u) => {
      const matchSearch =
        u.username?.toLowerCase().includes(search.toLowerCase()) ||
        u.email?.toLowerCase().includes(search.toLowerCase());
      const matchFilter =
        filterStatus === "all"
          ? true
          : filterStatus === "banned"
            ? u.isBanned
            : filterStatus === "admin"
              ? u.role === "admin"
              : filterStatus === "moderator"
                ? u.role === "moderator"
                : !u.isBanned && u.role === "user";
      return matchSearch && matchFilter;
    })
    .sort((a, b) => {
      if (sortBy === "newest")
        return new Date(b.createdAt) - new Date(a.createdAt);
      if (sortBy === "tournaments")
        return (b.tournamentsJoined || 0) - (a.tournamentsJoined || 0);
      return (a.username || "").localeCompare(b.username || "");
    });

  return (
    <div className="space-y-6 font-sans text-foreground">
      {/* Header */}
      <div className="flex justify-between items-center border-b border-border pb-4">
        <div>
          <h3 className="text-xl font-bold font-display tracking-wider text-primary flex items-center gap-2 uppercase">
            <Shield className="h-5 w-5 text-primary shrink-0" />
            Identity Directory
          </h3>
          <p className="text-[11px] text-muted-foreground font-semibold uppercase tracking-widest mt-1">
            Real-time verification indices // platform node registry
          </p>
        </div>
        <span className="px-2.5 py-0.5 bg-primary/10 border border-primary/20 text-accent font-display text-[10px] font-black tracking-widest uppercase rounded-sm">
          {filtered.length} Nodes Loaded
        </span>
      </div>

      {/* Filters */}
      <div className="grid md:grid-cols-3 gap-3 bg-card/40 p-3 border border-border/80 rounded-sm">
        <div className="relative flex items-center">
          <Search className="absolute left-3 h-4 w-4 text-muted-foreground/60 pointer-events-none" />
          <Input
            placeholder="Search network moniker or hash..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 bg-background border border-border rounded-sm text-foreground placeholder-muted-foreground text-sm font-semibold tracking-wide focus-visible:ring-primary/50 focus-visible:border-primary/50 h-9"
          />
        </div>
        <div className="relative flex items-center">
          <Filter className="absolute left-3 h-3.5 w-3.5 text-muted-foreground/60 pointer-events-none z-10" />
          <Select value={filterStatus} onValueChange={setFilter}>
            <SelectTrigger className="bg-background border border-border rounded-sm text-xs font-bold uppercase tracking-wider text-muted-foreground h-9 pl-9 cursor-pointer focus:ring-0">
              <SelectValue placeholder="Filter Status" />
            </SelectTrigger>
            <SelectContent className="bg-card border border-border rounded-sm text-xs uppercase font-display font-bold">
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="active">Active Node</SelectItem>
              <SelectItem value="banned">Blacklisted</SelectItem>
              <SelectItem value="admin">Admin Tier</SelectItem>
              <SelectItem value="moderator">Moderator Tier</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="relative flex items-center">
          <ArrowUpDown className="absolute left-3 h-3.5 w-3.5 text-accent pointer-events-none z-10" />
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="bg-background border border-primary/20 rounded-sm text-xs font-bold uppercase tracking-wider text-accent h-9 pl-9 cursor-pointer focus:ring-0">
              <SelectValue placeholder="Sort Parameters" />
            </SelectTrigger>
            <SelectContent className="bg-card border border-border rounded-sm text-xs uppercase font-display font-bold">
              <SelectItem value="newest">Sequence: Newest</SelectItem>
              <SelectItem value="tournaments">Sequence: Most Active</SelectItem>
              <SelectItem value="name">Sequence: Alpha</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Table */}
      {loading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="w-5 h-5 animate-spin text-primary" />
          <span className="ml-2 text-xs text-muted-foreground uppercase tracking-widest font-bold">
            Loading nodes...
          </span>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-sm border border-border/80 bg-card/20">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-border bg-background/50 font-display text-[10px] font-bold tracking-widest text-muted-foreground uppercase">
                <th className="py-3 px-4">Operator</th>
                <th className="py-3 px-4">Network Route</th>
                <th className="py-3 px-4">Role Class</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-center">Engagement</th>
                <th className="py-3 px-4 text-right">Directives</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/40 text-xs font-semibold">
              {filtered.map((u) => (
                <tr
                  key={u.uid}
                  className={`hover:bg-primary/5 transition-colors duration-150 group ${u.isBanned ? "opacity-60" : ""}`}
                >
                  <td className="py-3 px-4 text-white font-display text-sm tracking-wide group-hover:text-primary transition-colors">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-sm bg-primary/10 border border-primary/20 flex items-center justify-center flex-shrink-0">
                        <span className="text-xs font-black text-primary">
                          {u.username?.charAt(0)?.toUpperCase()}
                        </span>
                      </div>
                      {u.username}
                    </div>
                  </td>
                  <td className="py-3 px-4 text-muted-foreground font-mono">
                    {u.email}
                  </td>
                  <td className="py-3 px-4">
                    <select
                      value={u.role}
                      disabled={actionId === u.uid}
                      onChange={(e) => handleRoleChange(u.uid, e.target.value)}
                      className="appearance-none px-2 py-1 bg-background border border-border rounded-sm text-muted-foreground text-[10px] font-bold uppercase tracking-wider focus:outline-none focus:border-primary/50 cursor-pointer transition-colors disabled:opacity-50"
                    >
                      <option value="user">User</option>
                      <option value="moderator">Moderator</option>
                      <option value="admin">Admin</option>
                    </select>
                  </td>
                  <td className="py-3 px-4">
                    <span
                      className={`inline-flex items-center gap-1.5 px-2 py-0.5 border text-[10px] font-black font-display tracking-widest uppercase rounded-sm ${
                        u.isBanned
                          ? "bg-destructive/5 border-destructive/20 text-destructive"
                          : "bg-green-500/5 border-green-500/20 text-green-400"
                      }`}
                    >
                      <span
                        className={`w-1 h-1 rounded-full ${u.isBanned ? "bg-destructive" : "bg-green-500"}`}
                      />
                      {u.isBanned ? "Blacklisted" : "Active"}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-center font-display text-sm font-bold text-white">
                    {u.tournamentsJoined ?? 0}{" "}
                    <span className="text-[10px] text-muted-foreground font-sans font-normal">
                      MTCH
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex gap-2 justify-end">
                      <Button
                        size="sm"
                        onClick={() => handleBan(u.uid, u.isBanned)}
                        disabled={actionId === u.uid}
                        className={`h-7 text-[10px] uppercase font-display tracking-wider rounded-sm cursor-pointer border transition-all duration-150 disabled:opacity-50 ${
                          u.isBanned
                            ? "bg-green-500/10 border-green-500/30 text-green-400 hover:bg-green-500 hover:text-white"
                            : "bg-destructive/10 border-destructive/30 text-destructive hover:bg-destructive hover:text-white"
                        }`}
                      >
                        {actionId === u.uid ? (
                          <Loader2 className="w-3 h-3 animate-spin" />
                        ) : u.isBanned ? (
                          <>
                            <UserCheck className="h-3 w-3 mr-1" />
                            Restore
                          </>
                        ) : (
                          <>
                            <ShieldAlert className="h-3 w-3 mr-1" />
                            Blacklist
                          </>
                        )}
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {!loading && filtered.length === 0 && (
        <div className="text-center py-16 bg-card/20 border border-border rounded-sm">
          <p className="text-sm font-bold uppercase tracking-widest text-muted-foreground">
            📡 Zero matching identities found inside current parameter indices
          </p>
          <p className="text-xs text-muted-foreground/60 uppercase tracking-wider mt-1">
            Alter tracking strings or status toggle to rebuild directory mapping
          </p>
        </div>
      )}
    </div>
  );
}
