<div align="center">

# FF-ESP-ZONE

**A competitive Free Fire esports platform built for the Indian gaming community**

[![Next.js](https://img.shields.io/badge/Next.js-15-black?style=flat-square&logo=next.js)](https://nextjs.org)
[![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-green?style=flat-square&logo=mongodb)](https://mongodb.com)
[![Socket.IO](https://img.shields.io/badge/Socket.IO-4.x-black?style=flat-square&logo=socket.io)](https://socket.io)
[![Vercel](https://img.shields.io/badge/Deployed-Vercel-black?style=flat-square&logo=vercel)](https://vercel.com)
[![License](https://img.shields.io/badge/License-MIT-orange?style=flat-square)](LICENSE)

[Live Demo](https://ffespzone.vercel.app) · [Report Bug](https://github.com/yourusername/ff-esp-zone/issues) · [Request Feature](https://github.com/yourusername/ff-esp-zone/issues)

</div>

---

## Overview

FF-ESP-ZONE is a full-stack competitive gaming platform where Free Fire players can register profiles, form teams, compete in tournaments, and track their stats. Built with Next.js 15 App Router, MongoDB, a custom authentication system, and a standalone Socket.IO server for real-time world chat — deployed on Vercel at zero cost.

---

## Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [Authentication](#authentication)
- [Tournament System](#tournament-system)
- [Point System](#point-system)
- [Payment System](#payment-system)
- [World Chat (Socket.IO)](#world-chat-socketio)
- [Admin Panel](#admin-panel)
- [Database Models](#database-models)
- [API Reference](#api-reference)
- [Security](#security)
- [Deployment](#deployment)
- [Roadmap](#roadmap)

---

## Features

<table>
<tr>
<td>

**🔐 Authentication**
- Email + Password with OTP verification
- Google OAuth (implicit flow via `@react-oauth/google`)
- Guest sessions
- HMAC-signed session cookies
- Session version invalidation
- Rate limiting + brute force protection

</td>
<td>

**👤 Player System**
- Player profiles with avatar and clips
- Highlight video uploads via Cloudinary
- In-game role selection
- Lifetime stats tracking
- Tournament history

</td>
</tr>
<tr>
<td>

**🛡 Team System**
- Create teams with logo, tag and tier
- Captain / IGL management
- Join requests and invitations
- Kick, leave and disband flows
- Max 6 players per team

</td>
<td>

**🏆 Tournament System**
- Free and paid tournament types
- BR and CS game modes
- Solo, Duo and Squad team modes
- Room credentials publishing
- Match result submission
- Auto stat updates

</td>
</tr>
<tr>
<td>

**💬 World Chat**
- Real-time global chat via Socket.IO
- Production-grade standalone chat server
- Per-user identity from session cookie
- Guest read + write access
- Message persistence in MongoDB
- Admin moderation (delete, ban sender)

</td>
<td>

**💰 Payments**
- Razorpay integration for paid tournaments
- UPI fallback with transaction ID
- Webhook verification
- Payment model with status tracking

</td>
</tr>
<tr>
<td>

**⚙️ Admin Panel**
- Embedded in dashboard (no separate URL)
- User management: ban, unban, roles
- Tournament management and status control
- Prize distribution viewer
- Chat moderation
- Platform settings

</td>
<td></td>
</tr>
</table>

---

## Tech Stack

| Category | Technology |
|---|---|
| Framework | Next.js 15 (App Router) |
| Language | JavaScript |
| Styling | Tailwind CSS |
| Components | shadcn/ui |
| Database | MongoDB + Mongoose |
| Authentication | Custom HMAC sessions + Google OAuth (`@react-oauth/google`) |
| Real-time Chat | Socket.IO (standalone Node.js server) |
| Email | Resend |
| File Storage | Cloudinary |
| Payments | Razorpay |
| Rate Limiting | rate-limiter-flexible |
| Deployment | Vercel (Next.js) + separate host for Socket.IO server |

---

## Project Structure

```
ff-esp-zone/
├── public/                          # Static assets
├── chat-server/                     # Standalone Socket.IO server
│   ├── index.js                     # Entry point — HTTP + Socket.IO setup
│   ├── config/
│   │   └── db.js                    # MongoDB connection for chat server
│   ├── middleware/
│   │   └── auth.js                  # Socket handshake session verification
│   ├── handlers/
│   │   └── chatHandler.js           # Socket event handlers (send, delete, typing)
│   ├── models/
│   │   └── message.model.js         # Shared message schema
│   └── package.json
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   ├── admin/
│   │   │   │   ├── chat/            # Chat moderation (REST — delete message, ban)
│   │   │   │   ├── tournaments/     # Admin tournament control
│   │   │   │   └── users/           # User management
│   │   │   ├── auth/
│   │   │   │   ├── googleAuth/      # Google OAuth exchange
│   │   │   │   ├── guest/           # Guest session
│   │   │   │   ├── login/           # Email/password login
│   │   │   │   ├── logout/          # Session clear
│   │   │   │   ├── signup/          # Registration + OTP send
│   │   │   │   └── verifyEmail/     # OTP verify + resend
│   │   │   ├── official-events/     # Events CRUD + [id]
│   │   │   ├── payments/
│   │   │   │   └── razorpay/        # Payment + webhooks
│   │   │   ├── players/             # Player CRUD + allPlayers
│   │   │   ├── team-requests/       # Accept, reject, invite, kick, leave, disband
│   │   │   ├── teams/               # Team CRUD + allTeams
│   │   │   ├── tournaments/
│   │   │   │   ├── free/            # Free tournament create + list
│   │   │   │   ├── paid/            # Paid tournament create + list
│   │   │   │   ├── join/            # Join tournament
│   │   │   │   └── [id]/
│   │   │   │       ├── route.js     # Get, patch, delete
│   │   │   │       └── results/     # Submit + get match results
│   │   │   ├── uploads/             # Avatar, logo, photo, video
│   │   │   └── users/               # User profile get + patch
│   │   ├── admin/                   # Admin page (middleware protected)
│   │   ├── dashboard/               # Main dashboard
│   │   ├── login/
│   │   ├── signup/
│   │   ├── verifyEmail/
│   │   ├── layout.js
│   │   └── globals.css
│   ├── components/
│   │   ├── admin/                   # AdminDashboard + tabs
│   │   ├── auth/                    # LoginForm, SignupForm, VerifyEmailPage
│   │   ├── dashboard/
│   │   │   ├── tabs/                # FreeTournament, PaidTournament, OfficialEvents,
│   │   │   │                        #   Recruitment, WorldChat
│   │   │   ├── tournament-card/
│   │   │   │   ├── dialogs/         # Join, Manage, MatchResults, RazorpayJoin, Status, ViewDetails
│   │   │   │   └── shared/          # Shared primitives
│   │   │   └── user-profile/
│   │   │       ├── dialogs/         # EditPlayer, EditTeam, TeamDetails, Applications, ViewClips
│   │   │       └── shared/          # GuestBanner, primitives, useUploads
│   │   ├── forms/                   # CreateTournament, EditProfile
│   │   └── ui/                      # shadcn/ui components
│   ├── context/
│   │   └── ThemeProvider.jsx        # Global context: user, player, team, requests
│   ├── lib/
│   │   ├── cloudinary.js            # Upload helpers
│   │   ├── dbConnect.js             # MongoDB connection
│   │   ├── emailService.js          # Resend wrapper
│   │   ├── rateLimit.js             # All rate limiters
│   │   ├── session.js               # signSession + verifySession
│   │   └── socket.js                # Socket.IO client singleton
│   ├── models/
│   │   ├── matchResult.model.js
│   │   ├── message.model.js
│   │   ├── officialEvent.model.js
│   │   ├── payment.model.js
│   │   ├── players.model.js
│   │   ├── teamReq.model.js
│   │   ├── teams.model.js
│   │   ├── tournaments.model.js
│   │   └── users.model.js
│   ├── utils/
│   │   └── verifyEmailTemplate.js   # Gaming-themed OTP email
│   └── proxy.js                     # Next.js middleware
└── tailwind.config.js
```

---

## Getting Started

### Prerequisites

- Node.js 18+
- MongoDB Atlas account
- Google Cloud Console project with OAuth credentials
- Resend account
- Cloudinary account
- Razorpay account (for paid tournaments)

### Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/ff-esp-zone.git
cd ff-esp-zone

# Install Next.js dependencies
npm install

# Install chat server dependencies
cd chat-server && npm install && cd ..

# Copy environment file
cp .env.example .env.local
# Edit .env.local with your values

# Start Next.js dev server
npm run dev

# In a separate terminal — start the Socket.IO chat server
cd chat-server && node index.js
```

Visit [http://localhost:3000](http://localhost:3000)
Socket.IO server runs on [http://localhost:4000](http://localhost:4000) by default.

### First Admin Setup

After creating your account, run this in MongoDB Atlas shell or Compass:

```js
db.users.updateOne(
  { email: "your@email.com" },
  {
    $set: { role: "admin" },
    $inc: { sessionVersion: 1 }
  }
)
```

Log out and back in — the Admin tab will appear in your dashboard.

---

## Environment Variables

Create `.env.local` in the project root:

```env
# ── Database ──────────────────────────────────────────────────
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/ff-esp-zone

# ── Session ───────────────────────────────────────────────────
# Generate: node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
SESSION_SECRET=your_64_character_hex_string_here

# ── Google OAuth ───────────────────────────────────────────────
NEXT_PUBLIC_GOOGLE_CLIENT_ID=xxxxxxxxxx.apps.googleusercontent.com

# ── Email (Resend) ─────────────────────────────────────────────
RESEND_API_KEY=re_xxxxxxxxxxxxxxxxxxxx
EMAIL_FROM=FF-ESP-ZONE <noreply@yourdomain.com>

# ── Cloudinary ─────────────────────────────────────────────────
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# ── Razorpay ───────────────────────────────────────────────────
RAZORPAY_KEY_ID=rzp_live_xxxxxxxxxxxx
RAZORPAY_KEY_SECRET=your_razorpay_secret
RAZORPAY_WEBHOOK_SECRET=your_webhook_secret
NEXT_PUBLIC_RAZORPAY_KEY_ID=rzp_live_xxxxxxxxxxxx

# ── App ────────────────────────────────────────────────────────
NEXT_PUBLIC_APP_URL=https://ffespzone.vercel.app

# ── Socket.IO Chat Server ──────────────────────────────────────
NEXT_PUBLIC_CHAT_SERVER_URL=https://your-chat-server.up.railway.app
```

Chat server `.env` (inside `chat-server/`):

```env
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/ff-esp-zone
SESSION_SECRET=same_secret_as_nextjs_app
PORT=4000
CLIENT_ORIGIN=https://ffespzone.vercel.app
```

> **Important:** `SESSION_SECRET` must be identical in both the Next.js app and the chat server so the chat server can verify session cookies issued by Next.js.

---

## Authentication

### Flow Diagram

```
Email/Password
──────────────
User fills form → POST /api/auth/signup
  → bcrypt hash password (rounds 12)
  → generate 6-digit OTP → bcrypt hash OTP (rounds 8)
  → save user (emailVerified: false)
  → send OTP email via Resend
  → redirect to /verifyEmail

User enters OTP → POST /api/auth/verifyEmail (action: verify)
  → bcrypt.compare(input, hashedOTP)
  → set emailVerified: true, clear OTP
  → redirect to /login

User logs in → POST /api/auth/login
  → find user by email
  → bcrypt.compare(password, hash) — always runs (timing attack prevention)
  → check emailVerified, isBanned
  → signSession({ uid, email, sessionVersion })
  → set httpOnly cookie

Google OAuth
────────────
User clicks Google → @react-oauth/google useGoogleLogin (implicit flow)
  → receive access_token
  → fetch https://www.googleapis.com/oauth2/v3/userinfo
  → POST /api/auth/googleAuth { userInfo }
  → find or create user by userInfo.sub
  → signSession → set cookie

Guest
─────
User clicks Guest → POST /api/auth/guest
  → create user (provider: guest, no email/ffUid)
  → cleanup guests older than 24h
  → signSession → set cookie
```

### Session Security

The session cookie stores only identity — never role:

```json
{
  "uid": "google_sub_or_uuid",
  "email": "user@email.com",
  "sessionVersion": 1
}
```

Every protected request hits MongoDB to fetch current role, ban status and session version. Stale cookies are rejected instantly.

### Rate Limits

| Endpoint | Limit |
|---|---|
| Login | 5 attempts / 15 min / IP |
| Signup | 5 attempts / hour / IP |
| OTP Verify | 5 wrong attempts / 15 min / IP |
| OTP Resend | 3 requests / hour / email |
| Guest Login | 3 sessions / hour / IP |
| Profile Update | 10 requests / 10 min / IP |

---

## Tournament System

### Creation Rules

| Tournament Type | Who Can Create |
|---|---|
| Free | Any team captain |
| Paid | Admin or Moderator only |

### Slot Auto-Calculation

Slots are calculated automatically from `gameMode` + `teamMode` in the pre-save hook:

| Game Mode | Team Mode | Slots | Per Slot | Total Players |
|---|---|---|---|---|
| BR | Squad | 12 | 4 | 48 |
| BR | Duo | 24 | 2 | 48 |
| BR | Solo | 48 | 1 | 48 |
| CS | Squad | 2 | 4 | 8 |

### Join Rules

| Team Mode | Who Can Register |
|---|---|
| Squad | Team captain only (registers all 4 members) |
| Duo | Captain registers with 1 partner |
| Solo | Any individual player |

### Status Lifecycle

```
draft ──→ upcoming ──→ ongoing ──→ completed
  │           │            │
  └───────────┴────────────┴──→ cancelled
```

Free tournaments auto-publish (skip `draft`).
Paid tournaments start as `draft` and require admin/mod to publish.

### Match Flow

```
1. Organizer creates tournament
2. Players register before registrationDeadline
3. Organizer publishes roomId + roomPassword
4. Match is played
5. Organizer submits results (placement, kills, prize per team)
6. System auto-calculates points and updates all player stats
7. Tournament marked as completed
```

---

## Point System

### BR Squad / Duo

| Placement | Points |
|---|---|
| 🥇 1st | 12 |
| 🥈 2nd | 9 |
| 🥉 3rd | 8 |
| 4th | 7 |
| 5th | 6 |
| 6th | 5 |
| 7th | 4 |
| 8th | 3 |
| 9th | 2 |
| 10th | 1 |
| Each Kill | +1 |

**Score = Placement Points + Kill Points**

### BR Solo

| Placement | Points |
|---|---|
| 🥇 1st | 15 |
| 🥈 2nd | 12 |
| 🥉 3rd | 10 |
| 4th | 8 |
| 5th | 7 |
| 6th | 6 |
| 7th | 5 |
| 8th | 4 |
| 9th | 3 |
| 10th | 2 |
| Each Kill | +1 |

### CS Squad

| Result | Points |
|---|---|
| Match Win | 3 |
| Each Round Won | +1 |
| Match Loss | 0 |

**Tiebreakers:** Match Wins → Round Difference → Head-to-Head

---

## Payment System

Paid tournament entry fees are collected via Razorpay:

```
Player clicks Join → RazorpayJoinDialog opens
  → POST /api/payments/razorpay (create order)
  → Razorpay checkout opens
  → Player pays
  → Razorpay webhook → POST /api/payments/razorpay/webhooks
  → Verify webhook signature
  → Update payment status → join tournament
```

UPI fallback is also available — player pays manually and submits transaction ID for admin verification.

---

## World Chat (Socket.IO)

The World Chat is a real-time global chatroom available to all logged-in users (including guests). It is powered by a **standalone Socket.IO server** — a separate Node.js process that runs independently from the Next.js app.

### Why a Standalone Server?

Vercel's serverless runtime does not support persistent WebSocket connections. The chat server is extracted into its own Node.js/Express process hosted on a platform that supports long-lived connections (Railway, Render, Fly.io, etc.).

### Architecture

```
Browser (Next.js client)
  │
  │  WebSocket (socket.io-client)
  ▼
Chat Server (Node.js + Express + Socket.IO)   ←──  chat-server/
  │  ┌─────────────────────────────────────┐
  │  │  Handshake: reads session cookie    │
  │  │  → verifySession(cookie)            │
  │  │  → fetch user from MongoDB          │
  │  │  → attach user to socket            │
  │  └─────────────────────────────────────┘
  │
  ├── MongoDB (message persistence)
  └── Emits to all connected clients
```

### Folder Structure

```
chat-server/
├── index.js               # createServer + io setup, CORS, port listen
├── config/
│   └── db.js              # Mongoose connect (same MONGODB_URI)
├── middleware/
│   └── auth.js            # io.use() — verifies session cookie before connection
├── handlers/
│   └── chatHandler.js     # Per-socket event handlers
└── models/
    └── message.model.js   # Message schema (shared logic with Next.js app)
```

### Socket Events

#### Client → Server

| Event | Payload | Description |
|---|---|---|
| `message:send` | `{ text: string }` | Send a new chat message |
| `message:delete` | `{ messageId: string }` | Delete a message (admin/mod or own message) |
| `typing:start` | — | Broadcast typing indicator |
| `typing:stop` | — | Clear typing indicator |

#### Server → Client

| Event | Payload | Description |
|---|---|---|
| `message:new` | `MessageObject` | New message broadcast to all clients |
| `message:deleted` | `{ messageId: string }` | Notify all clients a message was removed |
| `message:history` | `MessageObject[]` | Last 50 messages sent on connection |
| `typing:update` | `{ username: string, isTyping: boolean }` | Typing indicator broadcast |
| `online:count` | `number` | Connected user count, emitted on join/leave |
| `error` | `{ message: string }` | Server-side error feedback |

### Message Object

```json
{
  "_id": "ObjectId",
  "text": "GG bro!",
  "sender": {
    "uid": "uuid-or-google-sub",
    "username": "AbhiSniper",
    "avatar": "https://res.cloudinary.com/...",
    "role": "user"
  },
  "createdAt": "2025-06-08T12:34:56.000Z"
}
```

### Connection Handshake

The chat server verifies identity on the Socket.IO handshake using the same HMAC session cookie issued by Next.js:

```js
// chat-server/middleware/auth.js
import { verifySession } from "../lib/session.js";
import User from "../models/users.model.js";

export const socketAuthMiddleware = async (socket, next) => {
  const rawCookie = socket.handshake.headers.cookie;
  const session = verifySession(rawCookie);   // HMAC verify + parse

  if (!session) return next(new Error("Unauthorized"));

  const user = await User.findOne({
    uid: session.uid,
    sessionVersion: session.sessionVersion,
    isBanned: false,
  });

  if (!user) return next(new Error("Session invalid or banned"));

  socket.user = {
    uid: user.uid,
    username: user.username,
    role: user.role,
  };

  next();
};
```

### Client Integration (Next.js)

```js
// src/lib/socket.js — singleton so the connection is reused across re-renders
import { io } from "socket.io-client";

let socket;

export const getSocket = () => {
  if (!socket) {
    socket = io(process.env.NEXT_PUBLIC_CHAT_SERVER_URL, {
      withCredentials: true,   // sends the session cookie
      transports: ["websocket"],
    });
  }
  return socket;
};
```

### Message Persistence

Messages are stored in MongoDB via the `Message` model. On connection the server emits the last 50 messages to the newly connected client. Messages are never auto-deleted; admins and moderators can delete individual messages via the `message:delete` event or through the Admin panel's Chat Mod tab (REST fallback via `/api/admin/chat`).

### Chat Rate Limiting

| Action | Limit |
|---|---|
| `message:send` | 1 message / second / socket |
| New connections | 10 connections / minute / IP |

Violations disconnect the socket; repeat offenders are flagged in the `message:send` handler.

---

## Admin Panel

The admin panel is embedded inside the user dashboard. No separate URL is exposed to the public.

Only `role: "admin"` or `role: "moderator"` users see the Admin tab. The middleware also protects `/admin` directly.

### Tabs

| Tab | Who | Capabilities |
|---|---|---|
| Users | Admin + Mod | Search, filter, ban, unban, change role |
| Tournaments | Admin + Mod | View all, change status, delete |
| Prizes | Admin + Mod | View completed tournament results and prize breakdown |
| Chat Mod | Admin + Mod | View all messages, delete, ban sender |
| Settings | Admin only | Maintenance mode, guest login toggle, site announcement |

### Role Hierarchy

```
admin ──→ can manage everyone including other admins
moderator ──→ can manage users and tournaments, cannot promote to admin
user ──→ standard access
guest ──→ read-only browse access (can also send chat messages)
```

---

## Database Models

### User

```
uid              String   unique — Google sub or crypto.randomUUID()
email            String   unique sparse (null for guests)
password         String   bcrypt hashed (empty for Google/guest)
emailVerified    Boolean
provider         String   password | google | guest
username         String   unique
ffUid            String   unique sparse (null for guests)
role             String   user | admin | moderator | guest
plan             String   basic | pro | elite
isBanned         Boolean
banReason        String
sessionVersion   Number   incremented to invalidate sessions
otp              String   bcrypt hashed, cleared after verify
otpExpiresAt     Date
```

### Player

```
userId           ObjectId → User
avatar           String   Cloudinary URL
teamId           ObjectId → Team
inGameRole       String   Rusher | Support | Sniper | Nader
isCaptain        Boolean
isActive         Boolean
stats            {
  matchesPlayed  Number
  wins           Number
  kills          Number
  deaths         Number
  assists        Number
  winRate        Number   percentage 0-100
  totalPoints    Number
}
clipPhotos       String[] max 2 Cloudinary URLs
clipVideo        String   Cloudinary URL
tournamentHistory [{
  tournamentName, kills, placement, points, prize, date
}]
likes            Number
likedBy          ObjectId[]
```

### Team

```
teamName         String   unique
tag              String   unique max 5 chars uppercase
logo             String   Cloudinary URL
teamCaptain      ObjectId → Player
players          ObjectId[] → Player (max 6)
region           String
tier             String   Amateur | Semi-Pro | Pro
status           String   active | inactive | disbanded
```

### Tournament

```
name, description, rules, bannerImage
tournamentType   String   free | paid
gameMode         String   BR | CS
teamMode         String   Solo | Duo | Squad
totalSlots       Number   auto-calculated
playersPerSlot   Number   auto-calculated
totalPlayers     Number   auto-calculated
filledSlots      Number
entryFee         Number
prizePool        Number
prizeDistribution [{placement, prize, description}]
registrationDeadline, startDate, endDate   Date
roomId, roomPassword, roomPublishedAt
organizer        ObjectId → User
organizerRole    String
status           String   draft | upcoming | ongoing | completed | cancelled
isPublished      Boolean
participants     [{player, team, members[], paymentId, paymentStatus, placement, kills}]
results          [{placement, player, team, kills, prize}]
```

### Message

```
text             String   max 500 chars
sender           {
  uid            String   → matches User.uid
  username       String
  avatar         String   Cloudinary URL
  role           String
}
createdAt        Date     indexed for pagination
isDeleted        Boolean  soft-delete flag
deletedBy        String   uid of admin/mod who removed it
```

### MatchResult

```
tournament       ObjectId → Tournament
gameMode, teamMode
pointSystem      {placementPoints Map, killPointValue, winPoints, roundPointValue}
results          [{
  player, team
  placement, kills, assists, deaths
  matchWins, matchLosses, roundsWon, roundsLost
  placementPoints, killPoints, totalPoints
  prize, isDisqualified, disqualifyReason
}]
submittedBy      ObjectId → User
notes            String
```

### Payment

```
tournament       ObjectId → Tournament
player           ObjectId → Player
user             ObjectId → User
razorpayOrderId  String
razorpayPaymentId String
amount           Number
currency         String   INR
status           String   created | paid | failed | refunded
```

---

## API Reference

### Authentication

| Method | Endpoint | Description | Auth |
|---|---|---|---|
| POST | `/api/auth/signup` | Register with email/password | — |
| POST | `/api/auth/login` | Login with email/password | — |
| POST | `/api/auth/logout` | Clear session cookie | — |
| POST | `/api/auth/verifyEmail` | Verify OTP or resend | — |
| POST | `/api/auth/googleAuth` | Google OAuth exchange | — |
| POST | `/api/auth/guest` | Create guest session | — |

### Users & Players

| Method | Endpoint | Description | Auth |
|---|---|---|---|
| GET | `/api/users` | Get current user | Session |
| PATCH | `/api/users` | Update profile | Session |
| GET | `/api/players/allPlayers` | List active players | — |
| GET | `/api/players/[id]` | Get player by user ID | — |
| POST | `/api/players/[id]` | Create player profile | Session |
| PATCH | `/api/players/[id]` | Update player profile | Session |

### Teams

| Method | Endpoint | Description | Auth |
|---|---|---|---|
| GET | `/api/teams/allTeams` | List active teams | — |
| GET | `/api/teams/[playerid]` | Get team by player | — |
| POST | `/api/teams/[playerid]` | Create team | Session + Captain |
| PATCH | `/api/teams/[playerid]` | Update team | Session + Captain |

### Team Requests

| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/team-requests/request` | Player requests to join team |
| POST | `/api/team-requests/invite` | Captain invites player |
| PATCH | `/api/team-requests/accept` | Accept request/invite |
| PATCH | `/api/team-requests/reject` | Reject request/invite |
| PATCH | `/api/team-requests/kick` | Captain kicks member |
| PATCH | `/api/team-requests/leave` | Player leaves team |
| DELETE | `/api/team-requests/disband` | Captain disbands team |

### Tournaments

| Method | Endpoint | Description | Auth |
|---|---|---|---|
| GET | `/api/tournaments/free` | List free tournaments | — |
| POST | `/api/tournaments/free` | Create free tournament | Captain |
| GET | `/api/tournaments/paid` | List paid tournaments | — |
| POST | `/api/tournaments/paid` | Create paid tournament | Admin/Mod |
| POST | `/api/tournaments/join` | Join a tournament | Session |
| GET | `/api/tournaments/[id]` | Get tournament details | — |
| PATCH | `/api/tournaments/[id]` | Update tournament | Organizer/Admin |
| DELETE | `/api/tournaments/[id]` | Delete tournament | Admin |
| POST | `/api/tournaments/[id]/results` | Submit match results | Organizer/Admin |
| GET | `/api/tournaments/[id]/results` | Get match results | — |

### Official Events

| Method | Endpoint | Description | Auth |
|---|---|---|---|
| GET | `/api/official-events` | List published events | — |
| POST | `/api/official-events` | Create event | Admin/Mod |
| GET | `/api/official-events/[id]` | Get event + view++ | — |
| PATCH | `/api/official-events/[id]` | Update event | Admin/Mod |
| DELETE | `/api/official-events/[id]` | Delete event | Admin |

### Admin

| Method | Endpoint | Description | Auth |
|---|---|---|---|
| GET | `/api/admin/users` | List all users | Admin/Mod |
| PATCH | `/api/admin/users` | Ban/unban/role change | Admin/Mod |
| GET | `/api/admin/tournaments` | List all tournaments | Admin/Mod |
| GET | `/api/admin/chat` | List recent messages | Admin/Mod |
| DELETE | `/api/admin/chat` | Delete message | Admin/Mod |

### Payments

| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/payments/razorpay` | Create Razorpay order |
| POST | `/api/payments/razorpay/webhooks` | Razorpay webhook handler |

> **Note:** World Chat communication uses Socket.IO events directly, not REST endpoints. See [World Chat (Socket.IO)](#world-chat-socketio) for the full event reference.

---

## Security

| Threat | Protection |
|---|---|
| Password breach | bcrypt rounds 12 — cracking a hash takes years |
| OTP interception | bcrypt rounds 8 — OTP deleted after use |
| Session forgery | HMAC-SHA256 signed cookie — tampering detected instantly |
| Role escalation | Role fetched from DB on every request — never from cookie |
| Stale sessions | sessionVersion in DB — role/ban changes take effect immediately |
| Timing attacks | bcrypt always runs even when user doesn't exist |
| Email enumeration | Same error message for wrong email and wrong password |
| Brute force | rate-limiter-flexible — lockout after 5 failed attempts |
| CSRF | sameSite: lax cookie — cross-site POST requests rejected |
| Razorpay tampering | Webhook signature verified with HMAC-SHA256 |
| Admin impersonation | /admin and /dashboard protected by middleware |
| ObjectId injection | Player lookups always via user._id, never raw uid string |
| Socket impersonation | Chat server re-verifies HMAC cookie on every WebSocket handshake |
| Chat spam | Per-socket rate limiter — 1 message/second; excess disconnects socket |
| Chat ban evasion | Ban check runs on each Socket.IO handshake via DB lookup |

---

## Deployment

### Deploy Next.js to Vercel

```bash
npm i -g vercel
vercel
# Set all env vars from .env.local in Vercel Dashboard → Settings → Environment Variables
```

### Deploy Chat Server

The Socket.IO server needs a platform that supports persistent connections. Recommended options:

**Railway (easiest)**
```bash
cd chat-server
railway init
railway up
# Set MONGODB_URI, SESSION_SECRET, CLIENT_ORIGIN, PORT in Railway dashboard
```

**Render**
```
New Web Service → connect repo → Root Directory: chat-server
Build Command: npm install
Start Command: node index.js
Add env vars in Render dashboard
```

**Fly.io**
```bash
cd chat-server
fly launch
fly secrets set MONGODB_URI=... SESSION_SECRET=... CLIENT_ORIGIN=...
fly deploy
```

After deploying the chat server, set `NEXT_PUBLIC_CHAT_SERVER_URL` in Vercel to point to your deployed chat server URL.

### Google Cloud Console Setup

Navigate to APIs & Services → Credentials → your OAuth 2.0 Client:

```
Authorized JavaScript Origins:
  http://localhost:3000
  https://ffespzone.vercel.app

Authorized Redirect URIs:
  http://localhost:3000
  https://ffespzone.vercel.app
```

### MongoDB Atlas Setup

```
1. Create free M0 cluster at mongodb.com/atlas
2. Database Access → Add database user (username + password)
3. Network Access → Add IP address → 0.0.0.0/0 (allow all — required for Vercel + chat server)
4. Connect → Drivers → copy connection string
5. Replace <password> with your DB password → paste as MONGODB_URI in both envs
```

### Razorpay Setup

```
1. Create account at razorpay.com
2. Settings → API Keys → Generate Key (live or test)
3. Copy Key ID → RAZORPAY_KEY_ID and NEXT_PUBLIC_RAZORPAY_KEY_ID
4. Copy Key Secret → RAZORPAY_KEY_SECRET
5. Webhooks → Add webhook URL: https://ffespzone.vercel.app/api/payments/razorpay/webhooks
6. Select event: payment.captured
7. Copy webhook secret → RAZORPAY_WEBHOOK_SECRET
```

### Resend Setup

```
1. Sign up at resend.com
2. Domains → Add Domain → follow DNS instructions
3. API Keys → Create API Key → copy to RESEND_API_KEY
4. Set EMAIL_FROM: FF-ESP-ZONE <noreply@yourdomain.com>
```

---

## Free Tier Summary

| Service | Free Limit | FF-ESP-ZONE Usage |
|---|---|---|
| Vercel | 100 GB bandwidth/month | Next.js hosting + serverless functions |
| MongoDB Atlas M0 | 512 MB storage | All data including chat messages |
| Resend | 3,000 emails/month | OTP + notifications |
| Cloudinary | 25 GB storage + bandwidth | Avatars, clips, logos |
| Google OAuth | Unlimited | Sign in with Google |
| Railway / Render | Free tier available | Socket.IO chat server |

**Monthly cost: ₹0** until you reach production scale.

---

## Roadmap

- [x] Real-time world chat via Socket.IO
- [ ] Password reset via email OTP
- [ ] Push notifications for tournament updates
- [ ] Leaderboard with global and regional rankings
- [ ] Tournament bracket visualization
- [ ] Player profile public pages
- [ ] Mobile app (React Native)
- [ ] Automatic tournament status transitions via cron
- [ ] Private team chat rooms (Socket.IO namespace per team)
- [ ] Chat reactions and message threading

---

## Contributing

Pull requests are welcome. For major changes please open an issue first.

```bash
git checkout -b feature/your-feature
git commit -m "feat: add your feature"
git push origin feature/your-feature
# open pull request
```

---

## License

MIT License — see [LICENSE](LICENSE) for details.

---

<div align="center">

Built with ❤️ for the Free Fire community

**FF-ESP-ZONE** — Where Indian esports begins 🔥

</div>