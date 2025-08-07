import jwt from "jsonwebtoken"
import type { NextRequest } from "next/server"

export interface JWTPayload {
  userId: string
  email: string
  userType: "lawyer" | "admin"
}

export function verifyToken(token: string): JWTPayload {
  try {
    return jwt.verify(token, process.env.JWT_SECRET!) as JWTPayload
  } catch (error) {
    throw new Error("Invalid token")
  }
}

export function getTokenFromRequest(request: NextRequest): string {
  const authHeader = request.headers.get("authorization")
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    throw new Error("No token provided")
  }
  return authHeader.substring(7)
}

export function generateToken(payload: JWTPayload): string {
  return jwt.sign(payload, process.env.JWT_SECRET!, { expiresIn: "7d" })
}
