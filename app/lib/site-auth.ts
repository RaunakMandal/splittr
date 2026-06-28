import { SignJWT, jwtVerify } from "jose";

const JWT_ISSUER = "splittr";
const JWT_AUDIENCE = "splittr-api";
const TOKEN_TTL = "30d";

export const SITE_PASSWORD = process.env.SITE_PASSWORD;

function getJwtSecret(): Uint8Array {
  const secret = process.env.JWT_SECRET?.trim();
  if (!secret) {
    throw new Error("JWT_SECRET is not configured");
  }

  return new TextEncoder().encode(secret);
}

export function verifyPassword(password: string): boolean {
  return password === SITE_PASSWORD;
}

export function getBearerToken(request: Request): string | undefined {
  const header = request.headers.get("authorization");
  if (!header?.startsWith("Bearer ")) {
    return undefined;
  }

  return header.slice("Bearer ".length).trim() || undefined;
}

export async function createAuthToken(): Promise<string> {
  return new SignJWT({ role: "site-user" })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuer(JWT_ISSUER)
    .setAudience(JWT_AUDIENCE)
    .setIssuedAt()
    .setExpirationTime(TOKEN_TTL)
    .sign(getJwtSecret());
}

export async function verifyAuthToken(token: string): Promise<boolean> {
  try {
    await jwtVerify(token, getJwtSecret(), {
      issuer: JWT_ISSUER,
      audience: JWT_AUDIENCE,
    });
    return true;
  } catch {
    return false;
  }
}

export async function isAuthorizedRequest(request: Request): Promise<boolean> {
  const token = getBearerToken(request);
  if (!token) {
    return false;
  }

  return verifyAuthToken(token);
}
