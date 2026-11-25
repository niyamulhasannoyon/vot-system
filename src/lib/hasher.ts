import crypto from "node:crypto";
import bcrypt from "bcryptjs";

const globalForSecret = globalThis as unknown as {
  __votebdSessionSecret?: string;
};

function getSessionSecret(): string {
  const envSecret = process.env.SESSION_SECRET?.trim();
  if (envSecret && envSecret.length >= 16) {
    return envSecret;
  }
  if (!globalForSecret.__votebdSessionSecret) {
    globalForSecret.__votebdSessionSecret = crypto.randomBytes(32).toString("hex");
  }
  return globalForSecret.__votebdSessionSecret;
}

/**
 * Computes a SHA-256 hash from a string.
 */
export function sha256(data: string): string {
  return crypto.createHash("sha256").update(data).digest("hex");
}

/**
 * Generates the genesis block hash for an election.
 */
export function createGenesisHash(electionId: string, createdAt: Date): string {
  return sha256(`GENESIS:${electionId}:${createdAt.toISOString()}`);
}

/**
 * Generates the next tamper-evident ballot hash in the sequence chain.
 */
export function calculateBallotHash(
  prevHash: string,
  sequenceNumber: number,
  choiceData: string,
  castAt: Date
): string {
  const payload = `${prevHash}|${sequenceNumber}|${choiceData}|${castAt.toISOString()}`;
  return sha256(payload);
}

/**
 * Generates an anonymous, public receipt verification code (e.g. VBD-74AB-92EF)
 * from the ballot hash.
 */
export function generateReceiptCode(ballotHash?: string): string {
  if (ballotHash) {
    const hex = ballotHash.substring(0, 8).toUpperCase();
    const part1 = hex.substring(0, 4);
    const part2 = hex.substring(4, 8);
    return `VBD-${part1}-${part2}`;
  }
  const randomBytes = crypto.randomBytes(4).toString("hex").toUpperCase();
  return `VBD-${randomBytes.substring(0, 4)}-${randomBytes.substring(4, 8)}`;
}

/**
 * Cryptographically secure 6-character Join Code (e.g. "BD8429")
 * Uses crypto.randomInt to eliminate predictability.
 */
export function generateJoinCode(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // Removed ambiguous chars I, O, 0, 1
  let code = "";
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(crypto.randomInt(0, chars.length));
  }
  return code;
}

/**
 * Generates single-use voter codes (e.g. V-XY8924) using CSPRNG.
 */
export function generateVoterCode(prefix = "V"): string {
  const num = crypto.randomInt(1000, 9999);
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ";
  const char1 = chars.charAt(crypto.randomInt(0, chars.length));
  const char2 = chars.charAt(crypto.randomInt(0, chars.length));
  return `${prefix}-${char1}${char2}${num}`;
}

/**
 * Generates a collision-resistant anonymous guest ticket code for open join-code elections.
 */
export function generateGuestVoterCode(): string {
  return `GUEST-${crypto.randomBytes(5).toString("hex").toUpperCase()}`;
}

/**
 * Hashes an admin management PIN with bcrypt (Salt rounds = 10).
 */
export async function hashAdminPin(pin: string): Promise<string> {
  return bcrypt.hash(pin.trim(), 10);
}

/**
 * Synchronous hash version for seed script.
 */
export function hashAdminPinSync(pin: string): string {
  return bcrypt.hashSync(pin.trim(), 10);
}

/**
 * Verifies if entered PIN matches the stored hash (supports bcrypt and legacy SHA-256).
 */
export async function verifyAdminPin(enteredPin: string, storedHash: string): Promise<boolean> {
  const trimmed = enteredPin.trim();
  if (storedHash.startsWith("$2a$") || storedHash.startsWith("$2b$") || storedHash.startsWith("$2y$")) {
    return bcrypt.compare(trimmed, storedHash);
  }
  const legacySalt = "votebd-secure-admin-salt";
  const legacyHash = sha256(`${legacySalt}:${trimmed}`);
  return legacyHash === storedHash;
}

/**
 * Creates an HMAC-SHA256 signed, expiring admin session token scoped to an election.
 */
export function createAdminSessionToken(
  electionId: string,
  adminKeyHash: string,
  ttlMs: number = 2 * 60 * 60 * 1000
): string {
  const now = Date.now();
  const payload = Buffer.from(
    JSON.stringify({ eid: electionId, iat: now, exp: now + ttlMs })
  ).toString("base64url");
  const signingKey = crypto
    .createHmac("sha256", getSessionSecret())
    .update(adminKeyHash)
    .digest();
  const signature = crypto
    .createHmac("sha256", signingKey)
    .update(payload)
    .digest("base64url");
  return `${payload}.${signature}`;
}

/**
 * Verifies an HMAC-SHA256 signed admin session token in constant time.
 */
export function verifyAdminSessionToken(
  token: string,
  electionId: string,
  adminKeyHash: string
): boolean {
  if (!token || !token.includes(".")) return false;
  const parts = token.split(".");
  if (parts.length !== 2) return false;

  const [payloadB64, providedSig] = parts;
  if (!payloadB64 || !providedSig) return false;

  try {
    const signingKey = crypto
      .createHmac("sha256", getSessionSecret())
      .update(adminKeyHash)
      .digest();
    const expectedSig = crypto
      .createHmac("sha256", signingKey)
      .update(payloadB64)
      .digest("base64url");

    const providedBuf = Buffer.from(providedSig);
    const expectedBuf = Buffer.from(expectedSig);
    if (
      providedBuf.length !== expectedBuf.length ||
      !crypto.timingSafeEqual(providedBuf, expectedBuf)
    ) {
      return false;
    }

    const decoded = JSON.parse(
      Buffer.from(payloadB64, "base64url").toString("utf8")
    ) as { eid?: string; exp?: number };

    if (decoded.eid !== electionId) return false;
    if (typeof decoded.exp !== "number" || Date.now() > decoded.exp) return false;

    return true;
  } catch {
    return false;
  }
}
