export interface ElectionOption {
  id: string;
  electionId: string;
  name: string;
  nameBn: string | null;
  symbolEmoji: string | null;
  symbolName: string | null;
  bio: string | null;
  bioBn: string | null;
  photoUrl: string | null;
  orderIndex: number;
  votes: number | null;
  percentage: number | null;
  bordaScore?: number | null;
}

export interface BallotActivityItem {
  sequenceNumber: number;
  castAt: string;
  receiptCode: string;
}

export interface ElectionDetail {
  id: string;
  slug: string;
  title: string;
  titleBn: string | null;
  description: string | null;
  descriptionBn: string | null;
  category: string;
  electionType: "SINGLE" | "MULTIPLE" | "RANKED" | "YES_NO" | string;
  status: "DRAFT" | "ACTIVE" | "PAUSED" | "CLOSED" | string;
  joinCode: string;
  allowNota: boolean;
  notaVotes: number | null;
  maxChoices: number;
  resultVisibility: "LIVE" | "AFTER_CLOSE" | string;
  resultsHidden: boolean;
  voterAccessType: "JOIN_CODE" | "CODE_LIST" | "OPEN_POLL" | string;
  startTime: string;
  endTime: string;
  hasStarted: boolean;
  totalEligibleVoters: number;
  totalBallotsCast: number;
  turnoutPercentage: number | null;
  options: ElectionOption[];
  recentBallotActivity: BallotActivityItem[];
}

export interface VoterRosterItem {
  voterCode: string;
  identifier: string | null;
  hasVoted: boolean;
  votedAt: string | null;
}

export interface AuditLogItem {
  id: string;
  electionId: string;
  eventType: string;
  details: string | null;
  timestamp: string;
}

export interface ChainBlockItem {
  sequenceNumber: number;
  receiptCode: string;
  shortHash: string;
  castAt: string;
  isTarget: boolean;
}

export interface VerificationResult {
  verified: boolean;
  receiptCode: string;
  sequenceNumber: number;
  totalBallotsInElection: number;
  castAt: string;
  electionTitle: string;
  electionTitleBn: string | null;
  electionSlug: string;
  electionJoinCode: string;
  isHashValid: boolean;
  isChainValid: boolean;
  ballotHash: string;
  prevHash: string;
  prevHashTruncated: string;
  ballotHashTruncated: string;
  genesisHashTruncated: string;
  chainBlocks: ChainBlockItem[];
  error?: string;
}
