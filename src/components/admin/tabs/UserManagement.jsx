"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export function UserManagementTab() {
  const [searchTerm, setSearchTerm] = useState("")
  const [filterStatus, setFilterStatus] = useState("all")
  const [sortBy, setSortBy] = useState("newest")

  // Mock user data
  const users = [
    { id: 1001, name: "Alex Gamer", email: "alex@email.com", status: "active", joined: "2024-01-15", tournaments: 5 },
    { id: 1002, name: "Pro Player", email: "pro@email.com", status: "active", joined: "2024-01-20", tournaments: 12 },
    {
      id: 1003,
      name: "Rookie User",
      email: "rookie@email.com",
      status: "active",
      joined: "2024-02-01",
      tournaments: 2,
    },
    {
      id: 1004,
      name: "Banned User",
      email: "banned@email.com",
      status: "banned",
      joined: "2023-12-01",
      tournaments: 0,
    },
    {
      id: 1005,
      name: "Inactive Pro",
      email: "inactive@email.com",
      status: "inactive",
      joined: "2024-01-10",
      tournaments: 8,
    },
  ]

  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesFilter = filterStatus === "all" || user.status === filterStatus
    return matchesSearch && matchesFilter
  })

  const sortedUsers = [...filteredUsers].sort((a, b) => {
    if (sortBy === "newest") return new Date(b.joined) - new Date(a.joined)
    if (sortBy === "tournaments") return b.tournaments - a.tournaments
    return a.name.localeCompare(b.name)
  })

  return (
    <div className="space-y-6 p-6">
      <div className="flex justify-between items-center">
        <h3 className="text-2xl font-bold">User Management</h3>
        <span className="px-3 py-1 bg-primary/20 text-primary rounded-full text-sm font-semibold">
          {sortedUsers.length} Users
        </span>
      </div>

      {/* Filters and Search */}
      <div className="grid md:grid-cols-3 gap-4 p-4 bg-card/50 rounded-lg border border-border/50">
        <Input
          placeholder="Search by name or email..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="bg-background/50"
        />
        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="bg-background/50">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="inactive">Inactive</SelectItem>
            <SelectItem value="banned">Banned</SelectItem>
          </SelectContent>
        </Select>
        <Select value={sortBy} onValueChange={setSortBy}>
          <SelectTrigger className="bg-background/50">
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="newest">Newest</SelectItem>
            <SelectItem value="tournaments">Most Active</SelectItem>
            <SelectItem value="name">Name (A-Z)</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Users Table */}
      <div className="overflow-x-auto rounded-lg border border-border/50">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border/50 bg-primary/10">
              <th className="text-left py-3 px-4 font-semibold">User ID</th>
              <th className="text-left py-3 px-4 font-semibold">Name</th>
              <th className="text-left py-3 px-4 font-semibold">Email</th>
              <th className="text-left py-3 px-4 font-semibold">Status</th>
              <th className="text-left py-3 px-4 font-semibold">Tournaments</th>
              <th className="text-left py-3 px-4 font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody>
            {sortedUsers.map((user) => (
              <tr key={user.id} className="border-b border-border/50 hover:bg-primary/5 transition-colors duration-200">
                <td className="py-3 px-4 font-mono text-accent">#{user.id}</td>
                <td className="py-3 px-4 font-medium">{user.name}</td>
                <td className="py-3 px-4 text-muted-foreground">{user.email}</td>
                <td className="py-3 px-4">
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      user.status === "active"
                        ? "bg-green-900/30 text-green-400"
                        : user.status === "banned"
                          ? "bg-red-900/30 text-red-400"
                          : "bg-yellow-900/30 text-yellow-400"
                    }`}
                  >
                    {user.status.charAt(0).toUpperCase() + user.status.slice(1)}
                  </span>
                </td>
                <td className="py-3 px-4 text-center font-semibold">{user.tournaments}</td>
                <td className="py-3 px-4 flex gap-2">
                  <Button size="sm" variant="outline" className="hover:bg-primary/20 bg-transparent">
                    View
                  </Button>
                  {user.status !== "banned" && (
                    <Button size="sm" variant="destructive" className="hover:bg-destructive/80">
                      Ban
                    </Button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {sortedUsers.length === 0 && (
        <div className="text-center py-12">
          <p className="text-muted-foreground">No users found matching your filters</p>
        </div>
      )}
    </div>
  )
}
