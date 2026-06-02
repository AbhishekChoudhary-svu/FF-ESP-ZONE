import { RateLimiterMemory } from "rate-limiter-flexible"

const loginLimiter = new RateLimiterMemory({
  points: 5,
  duration: 60 * 15, // 5 attempts per 15 minutes per IP
})

const signupLimiter = new RateLimiterMemory({
  points: 5,
  duration: 60 * 60, // 5 signups per hour per IP
})

const otpLimiter = new RateLimiterMemory({
  points: 3,
  duration: 60 * 60, // 3 resend requests per hour per email
})

const otpVerifyLimiter = new RateLimiterMemory({
  points: 5,
  duration: 60 * 15, // 5 wrong OTP attempts per 15 minutes per IP
})

export async function checkLoginLimit(ip) {
  try {
    await loginLimiter.consume(ip)
  } catch {
    throw new Error("Too many login attempts. Try again in 15 minutes.")
  }
}

export async function resetLoginLimit(ip) {
  await loginLimiter.delete(ip)
}

export async function checkSignupLimit(ip) {
  try {
    await signupLimiter.consume(ip)
  } catch {
    throw new Error("Too many signup attempts. Try again in 1 hour.")
  }
}

export async function checkOtpLimit(email) {
  try {
    await otpLimiter.consume(email)
  } catch {
    throw new Error("Too many OTP requests. Try again in 1 hour.")
  }
}

export async function checkOtpVerifyLimit(ip) {
  try {
    await otpVerifyLimiter.consume(ip)
  } catch {
    throw new Error("Too many OTP attempts. Try again in 15 minutes.")
  }
}

export async function resetOtpVerifyLimit(ip) {
  await otpVerifyLimiter.delete(ip)
}

const apiLimiter = new RateLimiterMemory({
  points: 10,
  duration: 60 * 10, // 10 requests per 10 minutes per IP
})

export async function checkApiLimit(ip) {
  try {
    await apiLimiter.consume(ip)
  } catch {
    throw new Error("Too many requests. Slow down.")
  }
}

const guestLimiter = new RateLimiterMemory({
  points: 5,
  duration: 60 * 60, // 5 guest accounts per hour
})

export async function checkGuestLimit(ip) {
  try {
    await guestLimiter.consume(ip)
  } catch {
    throw new Error(
      "Too many guest accounts created. Try again later."
    )
  }
}