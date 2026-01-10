import { NextResponse } from "next/server"

export async function POST(req) {
  try {
    const response = NextResponse.json({ success: true, message: "Logged out successfully" })

    
    response.cookies.set("session", "", {
      path: "/",       
      httpOnly: true, 
      secure: process.env.NODE_ENV === "production",
      maxAge: 0,      
    })

    return response
  } catch (err) {
    console.error("Logout API error:", err)
    return NextResponse.json({ error: "Server error" }, { status: 500 })
  }
}
