# FF-ESP-ZONE 🎮

A competitive Free Fire gaming platform for players to register profiles, form teams, join tournaments, and connect with the community.

---

## 🚀 Live Demo

[https://yourproject.vercel.app](https://yourproject.vercel.app)

---

## ✨ Features

### Authentication
- Email & Password login with OTP email verification
- Google OAuth via `@react-oauth/google`
- Guest session (browse without account)
- HMAC signed session cookies
- Rate limiting on all auth endpoints
- Brute force protection

### Player System
- Register a player profile with avatar, role, and highlight clips
- Upload photo clips and highlight videos via Cloudinary
- Mark yourself as Captain or Active
- View other players' profiles and clips

### Team System
- Create and manage teams with logo, tag, tier
- Invite players / send join requests
- Captain can kick members or disband team
- Leave team functionality

### Tournament System
- Free and Paid tournament listings
- Official events tab
- Tournament creation form

### Dashboard
- Recruitment board to find players
- World chat
- Profile stats (rank, playstyle, K/D, win rate)
- Edit profile details

### Admin Panel
- User management (ban, role change)
- Tournament management
- Pricing management
- Chat moderation

---

## 🛠 Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 14 (App Router) |
| Styling | Tailwind CSS |
| Database | MongoDB + Mongoose |
| Auth | Custom sessions + Google OAuth |
| Email | Resend |
| File Storage | Cloudinary |
| Deployment | Vercel |
| UI Components | shadcn/ui |

---

## 📁 Project Structure

```
src/
├── app/
│   ├── api/
│   │   ├── auth/
│   │   │   ├── login/
│   │   │   ├── signup/
│   │   │   ├── logout/
│   │   │   ├── verifyEmail/
│   │   │   ├── googleAuth/
│   │   │   └── guest/
│   │   ├── users/
│   │   ├── players/
│   │   ├── teams/
│   │   ├── team-requests/
│   │   ├── tournaments/
│   │   └── uploads/
│   ├── dashboard/
│   ├── admin/
│   ├── login/
│   ├── signup/
│   └── verifyEmail/
├── components/
│   ├── auth/
│   ├── dashboard/
│   ├── admin/
│   ├── forms/
│   └── ui/
├── context/
├── lib/
│   ├── dbConnect.js
│   ├── session.js
│   ├── rateLimit.js
│   ├── emailService.js
│   ├── cloudinary.js
│   └── googleVerify.js
├── models/
│   ├── users.model.js
│   ├── players.model.js
│   ├── teams.model.js
│   ├── teamReq.model.js
│   ├── tournaments.model.js
│   └── message.model.js
├── utils/
│   └── verifyEmailTemplate.js
└── proxy.js
```

---

## ⚙️ Environment Variables

Create a `.env.local` file in the root:

```env
# MongoDB
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/ff-esp-zone

# Session (generate with: node -e "console.log(require('crypto').randomBytes(32).toString('hex'))")
SESSION_SECRET=your_long_random_secret_here

# Google OAuth
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your_google_client_id.apps.googleusercontent.com

# Resend Email
RESEND_API_KEY=re_xxxxxxxxxxxxxxxxxx
EMAIL_FROM=FF-ESP-ZONE <noreply@yourdomain.com>

# Cloudinary
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# App URL
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

---

## 🏃 Getting Started

### Prerequisites

- Node.js 18+
- MongoDB Atlas account (free)
- Google Cloud Console project
- Resend account (free)
- Cloudinary account (free)

### Installation

```bash
# Clone the repo
git clone https://github.com/yourusername/ff-esp-zone.git
cd ff-esp-zone

# Install dependencies
npm install

# Copy env file and fill in values
cp .env.example .env.local

# Run development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

---

## 🔐 Security Features

- **HMAC signed cookies** — session cookies are cryptographically signed, tampering is detected instantly
- **bcrypt password hashing** — passwords stored with 12 rounds, never plain text
- **Hashed OTPs** — OTP codes hashed with bcrypt before storing in DB
- **Rate limiting** — all auth endpoints protected against brute force
- **Session versioning** — role/ban changes invalidate existing sessions immediately
- **Email enumeration prevention** — consistent error messages regardless of whether email exists
- **Timing attack prevention** — bcrypt always runs even for non-existent users
- **CSRF protection** — `sameSite: lax` cookies block cross-site attacks
- **Input validation** — all fields validated and length-checked server side

---

## 🗄️ Database Models

### User
```
uid, email, password (hashed), username, ffUid
role (user/admin/moderator/guest)
plan (basic/pro/elite)
emailVerified, provider, sessionVersion
otp (hashed), otpExpiresAt
rank, playstyle, bio, isBanned
```

### Player
```
userId (ref), avatar, inGameRole
isCaptain, isActive
clipPhotos[], clipVideo
stats { matchesPlayed, winRate, kills, assists, deaths }
likes
```

### Team
```
teamName, tag, logo, region, tier
status (active/inactive/disbanded)
teamCaptain (ref Player)
players[] (ref Player)
```

### TeamRequest
```
type (request/invite)
status (pending/accepted/rejected)
player (ref), team (ref)
```

---

## 🚀 Deployment

### Vercel (recommended)

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Set environment variables in Vercel dashboard
# Settings → Environment Variables → add all from .env.local
```

### Google OAuth Setup for Production

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. APIs & Services → Credentials → your OAuth Client
3. Add to **Authorized JavaScript Origins**:
   ```
   https://yourproject.vercel.app
   ```
4. Add to **Authorized Redirect URIs**:
   ```
   https://yourproject.vercel.app
   ```
5. Save and wait 5 minutes

---

## 📧 Email Setup (Resend)

1. Sign up at [resend.com](https://resend.com)
2. Create API key → add as `RESEND_API_KEY`
3. Add and verify your domain in Resend → Domains
4. Update `EMAIL_FROM` with your verified domain

**Free tier:** 3,000 emails/month, 100/day

---

## ☁️ Cloudinary Setup

1. Sign up at [cloudinary.com](https://cloudinary.com)
2. Dashboard → copy Cloud Name, API Key, API Secret
3. Add all three to environment variables

**Free tier:** 25GB storage, 25GB bandwidth/month

---

## 🐛 Known Issues / TODO

- [ ] Add password reset flow
- [ ] Tournament registration and bracket system
- [ ] Real-time world chat with WebSockets
- [ ] Player stats tracking system
- [ ] Mobile push notifications
- [ ] Team match history

---

## 📄 License

MIT License — feel free to use this project as a base for your own gaming platform.

---

## 🤝 Contributing

Pull requests are welcome. For major changes please open an issue first.

---

<p align="center">Built for the Free Fire community 🔥</p>