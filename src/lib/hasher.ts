import crypto from "node:crypto";
import bcrypt from "bcryptjs";

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
 * from the ballot hash and sequence number.
 */
export function generateReceiptCode(ballotHash?: string, sequenceNumber?: number): string {
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
 * Cryptographically secure 6-character Join Code (e.g. "CR-2024" or "BD8429")
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
  // Check if bcrypt hash
  if (storedHash.startsWith("$2a$") || storedHash.startsWith("$2b$") || storedHash.startsWith("$2y$")) {
    return bcrypt.compare(trimmed, storedHash);
  }
  // Fallback to legacy SHA-256 for backwards compatibility with previous seeds
  const legacySalt = "votebd-secure-admin-salt";
  const legacyHash = sha256(`${legacySalt}:${trimmed}`);
  return legacyHash === storedHash;
}
