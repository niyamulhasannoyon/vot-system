import crypto from "node:crypto";

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
export function generateReceiptCode(ballotHash: string, sequenceNumber: number): string {
  const hex = ballotHash.substring(0, 8).toUpperCase();
  const part1 = hex.substring(0, 4);
  const part2 = hex.substring(4, 8);
  return `VBD-${part1}-${part2}`;
}

/**
 * Generates a clean 6-character uppercase alphanumeric Join Code (e.g., "BD-842" or "VOTE99")
 */
export function generateJoinCode(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // Removed ambiguous chars I, O, 0, 1
  let code = "";
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

/**
 * Generates single-use voter codes (e.g. VTR-8941)
 */
export function generateVoterCode(prefix = "V"): string {
  const num = Math.floor(1000 + Math.random() * 9000);
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ";
  const char1 = chars.charAt(Math.floor(Math.random() * chars.length));
  const char2 = chars.charAt(Math.floor(Math.random() * chars.length));
  return `${prefix}-${char1}${char2}${num}`;
}

/**
 * Hashes an admin management PIN/passcode.
 */
export function hashAdminPin(pin: string): string {
  const salt = "votebd-secure-admin-salt";
  return sha256(`${salt}:${pin.trim()}`);
}

/**
 * Verifies if entered PIN matches the stored hash.
 */
export function verifyAdminPin(enteredPin: string, storedHash: string): boolean {
  return hashAdminPin(enteredPin) === storedHash;
}
