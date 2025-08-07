import jwt from "jsonwebtoken"

export interface JWTPayload {
  userId: string // user ID
  email: string
  userType: "lawyer" | "admin"
  iat?: number
  exp?: number
}

export function verifyJWT(token: string): JWTPayload {
  // Validate token format before verification
  if (!token || typeof token !== 'string') {
    console.error("JWT verification error: Token is missing or not a string")
    throw new Error("Token is missing or invalid")
  }

  // Check token format (should be in JWT format with 3 parts separated by dots)
  if (!token.match(/^[A-Za-z0-9-_=]+\.[A-Za-z0-9-_=]+\.[A-Za-z0-9-_.+/=]*$/)) {
    console.error("JWT verification error: Token format is invalid")
    throw new Error("Token format is invalid")
  }

  try {
    if (!process.env.JWT_SECRET) {
      console.error("JWT verification error: JWT_SECRET is not defined")
      throw new Error("Server configuration error")
    }
    
    const decoded = jwt.verify(token, process.env.JWT_SECRET) as JWTPayload
    return decoded
  } catch (error) {
    console.error("JWT verification error:", error)
    throw error
  }
}

export function generateJWT(payload: Omit<JWTPayload, "iat" | "exp">): string {
  // Adding a check for required fields in the payload
  if (!payload.userId || !payload.email || !payload.userType) {
    throw new Error("Missing required fields in JWT payload")
  }
  return jwt.sign(payload, process.env.JWT_SECRET!, { expiresIn: "7d" })
}