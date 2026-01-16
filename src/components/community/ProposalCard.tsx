'use client';

import { GovernanceProposal } from '@/lib/types';
import { Calendar, TrendingUp, CheckCircle, XCircle } from 'lucide-react';
import { formatDistance } from 'date-fns';
import { cn } from '@/lib/utils';

interface ProposalCardProps {
  proposal: GovernanceProposal;
  onVote?: (optionId: string) => void;
  hasVoted?: boolean;
}

export function ProposalCard({ proposal, onVote, hasVoted = false }: ProposalCardProps) {
  const isActive = proposal.status === 'active';
  const timeRemaining = isActive
    ? formatDistance(proposal.endDate, new Date(), { addSuffix: true })
    : null;

  const getStatusIcon = () => {
    switch (proposal.status) {
      case 'active':
        return <TrendingUp className="w-4 h-4" />;
      case 'passed':
        return <CheckCircle className="w-4 h-4" />;
      case 'rejected':
        return <XCircle className="w-4 h-4" />;
      case 'executed':
        return <CheckCircle className="w-4 h-4" />;
    }
  };

  const getStatusColor = () => {
    switch (proposal.status) {
      case 'active':
        return 'bg-[#ccff00] text-black';
      case 'passed':
        return 'bg-green-500 text-white';
      case 'rejected':
        return 'bg-red-500 text-white';
      case 'executed':
        return 'bg-blue-500 text-white';
    }
  };

  const reachedQuorum = proposal.totalVotes >= proposal.quorumRequired;

  return (
    <div className="bg-zinc-900 border-4 border-white p-6 transition-all hover:shadow-[4px_4px_0px_0px_rgba(255,255,255,1)]">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <span className={cn(
              "px-2 py-1 text-xs font-bold tracking-wider flex items-center gap-1",
              getStatusColor()
            )}>
              {getStatusIcon()}
              {proposal.status.toUpperCase()}
            </span>
            <span className="px-2 py-1 text-xs font-bold tracking-wider bg-zinc-800 text-white border-2 border-white">
              {proposal.type.toUpperCase().replace('-', ' ')}
            </span>
          </div>
          
          <h3 className="text-xl font-bold text-white uppercase tracking-tight mb-2">
            {proposal.title}
          </h3>
          
          <p className="text-sm text-zinc-400 mb-4">
            {proposal.description}
          </p>

          <div className="flex items-center gap-4 text-xs text-zinc-500">
            <div className="flex items-center gap-1">
              <Calendar className="w-3 h-3" />
              {isActive ? (
                <span>Ends {timeRemaining}</span>
              ) : (
                <span>Ended {formatDistance(proposal.endDate, new Date(), { addSuffix: true })}</span>
              )}
            </div>
            <div>
              By <span className="text-white font-bold">{proposal.proposer.name}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Voting Progress */}
      <div className="mb-4">
        <div className="flex items-center justify-between text-xs mb-2">
          <span className="text-zinc-400">Total Votes</span>
          <span className="font-bold text-white">
            {proposal.totalVotes.toLocaleString()} / {proposal.quorumRequired.toLocaleString()}
          </span>
        </div>
        <div className="w-full h-2 bg-zinc-800 border-2 border-white">
          <div
            className={cn(
              "h-full transition-all",
              reachedQuorum ? "bg-[#ccff00]" : "bg-zinc-600"
            )}
            style={{ width: `${Math.min((proposal.totalVotes / proposal.quorumRequired) * 100, 100)}%` }}
          />
        </div>
        {!reachedQuorum && isActive && (
          <div className="text-xs text-red-500 mt-1 font-bold">
            Needs {(proposal.quorumRequired - proposal.totalVotes).toLocaleString()} more votes to reach quorum
          </div>
        )}
      </div>

      {/* Options */}
      <div className="space-y-2">
        {proposal.options.map((option) => (
          <button
            key={option.id}
            onClick={() => isActive && !hasVoted && onVote?.(option.id)}
            disabled={!isActive || hasVoted}
            className={cn(
              "w-full text-left p-4 border-2 border-white transition-all",
              isActive && !hasVoted
                ? "hover:bg-zinc-800 cursor-pointer hover:shadow-[2px_2px_0px_0px_rgba(255,255,255,1)]"
                : "cursor-not-allowed opacity-60"
            )}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="font-bold text-white">{option.text}</span>
              <span className="text-[#ccff00] font-bold text-lg">
                {option.percentage.toFixed(1)}%
              </span>
            </div>
            <div className="w-full h-2 bg-zinc-800 border border-zinc-700">
              <div
                className="h-full bg-[#ccff00]"
                style={{ width: `${option.percentage}%` }}
              />
            </div>
            <div className="text-xs text-zinc-500 mt-1">
              {option.votes.toLocaleString()} votes
            </div>
          </button>
        ))}
      </div>

      {hasVoted && isActive && (
        <div className="mt-4 p-3 bg-[#ccff00] text-black text-sm font-bold text-center">
          ✓ YOU&apos;VE VOTED ON THIS PROPOSAL
        </div>
      )}

      {proposal.onChainProposalId && (
        <div className="mt-4 pt-4 border-t-2 border-zinc-800 text-xs text-zinc-500 font-mono">
          On-chain: {proposal.onChainProposalId.slice(0, 8)}...{proposal.onChainProposalId.slice(-8)}
        </div>
      )}
    </div>
  );
}
