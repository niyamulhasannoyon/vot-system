import { z } from "zod";

export const candidateSchema = z.object({
  id: z.string().optional(),
  name: z.string().trim().min(1, "Candidate name is required").max(100),
  nameBn: z.string().trim().max(100).optional(),
  symbolEmoji: z.string().trim().max(16).default("🗳️"),
  symbolName: z.string().trim().max(50).optional(),
  bio: z.string().trim().max(300).optional(),
  bioBn: z.string().trim().max(300).optional(),
});

export const createElectionSchema = z.object({
  title: z.string().trim().min(3, "Title must be at least 3 characters").max(120),
  titleBn: z.string().trim().max(120).optional(),
  description: z.string().trim().max(1000).optional(),
  descriptionBn: z.string().trim().max(1000).optional(),
  category: z.enum(["class", "club", "community", "poll", "general"]).default("class"),
  electionType: z.enum(["SINGLE", "MULTIPLE", "RANKED", "YES_NO"]).default("SINGLE"),
  allowNota: z.boolean().default(false),
  maxChoices: z.coerce.number().int().min(1).max(10).default(1),
  resultVisibility: z.enum(["LIVE", "AFTER_CLOSE"]).default("LIVE"),
  voterAccessType: z.enum(["JOIN_CODE", "CODE_LIST", "OPEN_POLL"]).default("JOIN_CODE"),
  startTime: z.string().datetime().or(z.date()).optional(),
  endTime: z.string().datetime().or(z.date()),
  adminPin: z.string().trim().min(4, "Admin PIN must be at least 4 digits").max(8),
  candidates: z.array(candidateSchema).min(2, "At least 2 candidates or options are required"),
  voterListRaw: z.string().optional(),
});

export const voteSubmissionSchema = z.object({
  voterCode: z.preprocess(
    (val) => {
      if (typeof val === "string") {
        const trimmed = val.trim();
        return trimmed === "" ? undefined : trimmed;
      }
      return val;
    },
    z.string().min(3, "Voter code must be at least 3 characters").max(40).optional()
  ),
  choices: z.array(z.string().min(1)).min(1, "At least one selection is required"),
  deviceId: z.string().trim().max(128).optional(),
});

export const voterVerifySchema = z.object({
  voterCode: z.string().trim().min(3, "Voter code must be at least 3 characters").max(40),
});

export const adminActionSchema = z.object({
  adminPin: z.string().trim().min(4).max(8).optional(),
  sessionToken: z.string().min(10).optional(),
  action: z
    .enum([
      "CLOSE",
      "EXTEND_HOUR",
      "EXTEND_DAY",
      "GET_CODES",
      "GET_AUDIT",
      "GET_DASHBOARD",
      "DUPLICATE",
      "AUTH_CHECK",
    ])
    .default("AUTH_CHECK"),
});

export const receiptVerificationSchema = z.object({
  receiptCode: z
    .string()
    .trim()
    .regex(/^VBD-[A-Z0-9]{4}-[A-Z0-9]{4}$/i, "Invalid receipt format (Expected: VBD-XXXX-XXXX)"),
});
