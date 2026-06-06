import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import { Player } from "@/models/players.model";
import { User } from "@/models/users.model";
import { verifySession } from "@/lib/session";

// Basic UPI format: something@something (letters, digits, dots, hyphens)
const UPI_RE = /^[\w.\-]{2,}@[\w]{2,}$/;

export async function PATCH(req) {
  try {
    await dbConnect();

    const raw = req.cookies.get("session")?.value;
    if (!raw) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const session = verifySession(raw);
    if (!session?.uid) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { upiId } = await req.json();
    if (!upiId || !UPI_RE.test(upiId.trim())) {
      return NextResponse.json({ error: "Invalid UPI ID format" }, { status: 400 });
    }

    const user = await User.findOne({ uid: session.uid }).lean();
    if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

    const player = await Player.findOneAndUpdate(
      { userId: user._id },
      { upiId: upiId.trim().toLowerCase() },
      { new: true }
    );

    if (!player) return NextResponse.json({ error: "Player profile not found" }, { status: 404 });

    return NextResponse.json({ success: true, upiId: player.upiId });
  } catch (err) {
    console.error("PATCH /api/players/upi error:", err);
    return NextResponse.json({ error: err.message || "Server error" }, { status: 500 });
  }
}