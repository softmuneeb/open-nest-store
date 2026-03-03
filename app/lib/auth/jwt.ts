import { SignJWT, jwtVerify } from 'jose';

function getSecret(jwtSecret: string): Uint8Array {
  return new TextEncoder().encode(jwtSecret);
}

export async function signJwt(
  payload: Record<string, unknown>,
  jwtSecret: string,
  expiresIn = '7d'
): Promise<string> {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(expiresIn)
    .sign(getSecret(jwtSecret));
}

export async function verifyJwt(
  token: string,
  jwtSecret: string
): Promise<Record<string, unknown>> {
  const { payload } = await jwtVerify(token, getSecret(jwtSecret));
  return payload as Record<string, unknown>;
}

export function extractBearerToken(authHeader: string | null): string | null {
  if (!authHeader || !authHeader.startsWith('Bearer ')) return null;
  return authHeader.slice(7).trim() || null;
}
