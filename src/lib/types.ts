export interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  fandomScore: number;
  spotifyConnected: boolean;
  walletAddress?: string;
  solanaWalletAddress?: string;
  createdAt: Date;
  eventsAttended: number;
  vouchesGiven: number;
  vouchesReceived: number;
  communityMemberships?: string[]; // Artist/event community IDs
  reputationScore?: number; // Community-specific reputation
  badgesEarned?: CommunityBadge[];
}

export interface Event {
  id: string;
  title: string;
  artist: string;
  artistImage: string;
  venue: string;
  location: string;
  date: Date;
  time: string;
  image: string;
  description: string;
  category: "concert" | "festival" | "sports" | "theater" | "comedy";
  ticketTiers: TicketTier[];
  totalTickets: number;
  soldTickets: number;
  resaleEnabled: boolean;
  resaleCap?: number; // percentage cap on original price
  artistRoyalty: number; // percentage
  status: "upcoming" | "on-sale" | "sold-out" | "past";
  minFandomScore?: number;
}

export interface TicketTier {
  id: string;
  name: string;
  price: number;
  currency: string;
  description: string;
  available: number;
  total: number;
  benefits: string[];
}

export interface Ticket {
  id: string;
  eventId: string;
  event: Event;
  tierId: string;
  tierName: string;
  ownerId: string;
  originalPrice: number;
  currentPrice: number;
  purchaseDate: Date;
  status: "active" | "used" | "transferred" | "listed";
  qrCode: string;
  tokenId?: string;
  transactionHash?: string;
}

export interface ResaleListing {
  id: string;
  ticketId: string;
  ticket: Ticket;
  sellerId: string;
  price: number;
  listedAt: Date;
  status: "active" | "sold" | "cancelled";
}

export interface Vouch {
  id: string;
  voucherId: string;
  voucheeId: string;
  eventId?: string;
  stakedAmount: number;
  status: "active" | "released" | "slashed";
  createdAt: Date;
}

export interface Transaction {
  id: string;
  type: "purchase" | "resale" | "royalty" | "refund";
  amount: number;
  currency: string;
  fromUserId?: string;
  toUserId?: string;
  ticketId?: string;
  timestamp: Date;
  transactionHash?: string;
  status: "pending" | "confirmed" | "failed";
}

// Community & Solana-powered features
export interface Community {
  id: string;
  name: string;
  artistId: string;
  artistName: string;
  artistImage: string;
  description: string;
  memberCount: number;
  tokenMintAddress?: string; // SPL token for membership
  nftCollectionAddress?: string; // NFT collection for badges
  accessRequirement: {
    type: "token" | "nft" | "fandom-score" | "free";
    minAmount?: number;
    minScore?: number;
  };
  governance: {
    proposalCount: number;
    votingPower: "token" | "reputation" | "equal";
  };
  createdAt: Date;
  isActive: boolean;
}

export interface CommunityPost {
  id: string;
  communityId: string;
  authorId: string;
  author: User;
  title: string;
  content: string;
  type: 'discussion' | 'question' | 'photo' | 'news';
  images?: string[];
  upvotes: number;
  downvotes: number;
  commentCount: number;
  isPinned: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Comment {
  id: string;
  postId: string;
  authorId: string;
  author: User;
  content: string;
  upvotes: number;
  downvotes: number;
  parentId?: string;
  depth: number;
  replies: Comment[];
  createdAt: Date;
}

export interface CommunityMember {
  id: string;
  userId: string;
  user: User;
  communityId: string;
  role: "owner" | "admin" | "moderator" | "member";
  joinedAt: Date;
  reputationPoints: number;
  votingPower: number;
  isActive: boolean;
}

export interface GovernanceProposal {
  id: string;
  communityId: string;
  proposerId: string;
  proposer: User;
  title: string;
  description: string;
  type: "feature-request" | "setlist-vote" | "merch-design" | "event-date" | "general";
  options: ProposalOption[];
  startDate: Date;
  endDate: Date;
  status: "active" | "passed" | "rejected" | "executed";
  quorumRequired: number;
  totalVotes: number;
  onChainProposalId?: string; // Solana transaction signature
}

export interface ProposalOption {
  id: string;
  text: string;
  votes: number;
  percentage: number;
}

export interface CommunityBadge {
  id: string;
  name: string;
  description: string;
  image: string;
  type: "attendance" | "contribution" | "governance" | "special";
  mintAddress?: string; // cNFT mint address
  earnedAt: Date;
  rarity: "common" | "rare" | "epic" | "legendary";
}

export interface SolanaTransaction {
  signature: string;
  type: "badge-mint" | "token-transfer" | "vote" | "tip";
  amount?: number;
  fromAddress: string;
  toAddress?: string;
  timestamp: Date;
  status: "confirmed" | "pending" | "failed";
  metadata?: Record<string, unknown>;
}
