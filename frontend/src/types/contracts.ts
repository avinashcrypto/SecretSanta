// Contract addresses and ABIs
export const CONTRACT_ADDRESSES = {
  SECRET_SANTA: import.meta.env.VITE_CONTRACT_ADDRESS || '',
} as const;

// Game phases const
export const GamePhase = {
  Registration: 0,
  Matching: 1,
  GiftSubmission: 2,
  WaitingReveal: 3,
  Revealed: 4,
} as const;

export type GamePhase = typeof GamePhase[keyof typeof GamePhase];

// Participant type
export interface Participant {
  address: string;
  index: number;
  hasSubmittedGift: boolean;
}

// Game info type
export interface GameInfo {
  phase: GamePhase;
  numParticipants: number;
  regDeadline: bigint;
  subDeadline: bigint;
  revTime: bigint;
}

// Revealed match type
export interface RevealedMatch {
  recipient: string;
  giftValue: bigint;
  metadataURI: string;
}
