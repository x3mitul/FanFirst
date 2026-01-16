'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Users, Lock, Coins, Image as ImageIcon } from 'lucide-react';
import { Community } from '@/lib/types';
import { cn } from '@/lib/utils';

interface CommunityCardProps {
  community: Community;
  isMember?: boolean;
}

export function CommunityCard({ community, isMember = false }: CommunityCardProps) {
  // Provide defaults for properties that may not exist in database data
  const accessRequirement = community.accessRequirement || { type: 'free' as const };
  const governance = community.governance || { proposalCount: 0, votingPower: 'equal' };

  const getAccessBadge = () => {
    switch (accessRequirement.type) {
      case 'token':
        return (
          <div className="flex items-center gap-1 text-xs bg-[#14F195] text-black px-2 py-1 font-bold">
            <Coins className="w-3 h-3" />
            {accessRequirement.minAmount || 0} TOKENS
          </div>
        );
      case 'nft':
        return (
          <div className="flex items-center gap-1 text-xs bg-[#ff4500] text-white px-2 py-1 font-bold">
            <ImageIcon className="w-3 h-3" />
            NFT HOLDER
          </div>
        );
      case 'fandom-score':
        return (
          <div className="flex items-center gap-1 text-xs bg-[#6d28d9] text-white px-2 py-1 font-bold">
            <Lock className="w-3 h-3" />
            SCORE {accessRequirement.minScore || 0}+
          </div>
        );
      case 'free':
      default:
        return (
          <div className="text-xs bg-white text-black px-2 py-1 font-bold">
            FREE ACCESS
          </div>
        );
    }
  };

  return (
    <Link
      href={`/community/${community.id}`}
      className="group block bg-zinc-900 border-4 border-white transition-all hover:shadow-[8px_8px_0px_0px_rgba(204,255,0,1)]"
    >
      {/* Artist Image */}
      <div className="relative aspect-square overflow-hidden border-b-4 border-white">
        <Image
          src={community.artistImage}
          alt={community.artistName}
          fill
          className="object-cover grayscale group-hover:grayscale-0 transition-all duration-300"
        />
        <div className="absolute top-4 right-4">
          {getAccessBadge()}
        </div>
        {isMember && (
          <div className="absolute top-4 left-4 bg-[#ccff00] text-black px-3 py-1 font-bold text-xs">
            MEMBER
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-6">
        <div className="flex items-start justify-between mb-2">
          <div>
            <h3 className="text-2xl font-bold tracking-tight text-white mb-1 uppercase">
              {community.name}
            </h3>
            <p className="text-sm text-zinc-400 font-mono">{community.artistName}</p>
          </div>
        </div>

        <p className="text-sm text-zinc-300 mb-4 line-clamp-2">
          {community.description}
        </p>

        {/* Stats */}
        <div className="flex items-center gap-6 text-sm">
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-[#ccff00]" />
            <span className="font-bold text-white">
              {community.memberCount.toLocaleString()}
            </span>
            <span className="text-zinc-400">members</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-[#ccff00] rounded-full" />
            <span className="font-bold text-white">
              {governance.proposalCount}
            </span>
            <span className="text-zinc-400">proposals</span>
          </div>
        </div>

        {/* Status */}
        <div className="mt-4 pt-4 flex items-center justify-between">
          <div className={cn(
            "text-xs font-bold tracking-wider",
            community.isActive ? "text-[#ccff00]" : "text-zinc-500"
          )}>
            {community.isActive ? "● ACTIVE" : "● INACTIVE"}
          </div>
          <div className="text-xs font-mono text-zinc-500">
            {governance.votingPower?.toUpperCase() || 'EQUAL'} VOTING
          </div>
        </div>
      </div>
    </Link>
  );
}
