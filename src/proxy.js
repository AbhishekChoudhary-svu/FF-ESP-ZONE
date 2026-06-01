import { NextResponse } from "next/server";
import { verifySession } from "@/lib/session";
import dbConnect from "@/lib/dbConnect";
import { User } from "@/models/users.model";

export async function proxy(req) {
  const { pathname } = req.nextUrl;
  const isDashboard = pathname.startsWith("/dashboard");
  const isAdmin = pathname.startsWith("/admin");

  if (!isDashboard && !isAdmin) return NextResponse.next();

  const raw = req.cookies.get("session")?.value;
  console.log("1. raw cookie:", raw ? "exists" : "MISSING");

  if (!raw) return NextResponse.redirect(new URL("/login", req.url));

  const session = verifySession(raw);
  console.log("2. verified session:", session);

  if (!session?.uid || !session?.email) {
    console.log("3. REDIRECTING — bad session");
    return NextResponse.redirect(new URL("/login", req.url));
  }

  try {
    await dbConnect();
    const user = await User.findOne({ uid: session.uid }).lean();
    console.log(
      "4. user from DB:",
      user
        ? {
            role: user.role,
            sessionVersion: user.sessionVersion,
            banned: user.isBanned,
            verified: user.emailVerified,
          }
        : "NOT FOUND",
    );

    if (!user) return NextResponse.redirect(new URL("/login", req.url));

    console.log(
      "5. version check:",
      user.sessionVersion ?? 1,
      "vs cookie:",
      session.sessionVersion,
    );
    if ((user.sessionVersion ?? 1) !== session.sessionVersion) {
      console.log("6. REDIRECTING — version mismatch");
      return NextResponse.redirect(new URL("/login", req.url));
    }

    if (user.isBanned) {
      console.log("7. REDIRECTING — banned");
      return NextResponse.redirect(new URL("/banned", req.url));
    }

    if (!user.emailVerified) {
      return NextResponse.redirect(
        new URL(
          `/login`,
          req.url,
        ),
      );
    }

    if (isAdmin && user.role !== "admin") {
      console.log("9. REDIRECTING — not admin");
      return NextResponse.redirect(new URL("/dashboard", req.url));
    }

    console.log("10. ACCESS GRANTED");
    return NextResponse.next();
  } catch (err) {
    console.error("Middleware DB error:", err);
    return NextResponse.redirect(new URL("/login", req.url));
  }
}

export const config = {
  matcher: ["/dashboard/:path*", "/admin/:path*"],
};
