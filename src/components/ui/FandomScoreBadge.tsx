'use client';

import { motion } from 'framer-motion';
import { useState } from 'react';

interface FandomScoreBadgeProps {
    score: number;
    size?: 'sm' | 'md' | 'lg';
    showLabel?: boolean;
    showTooltip?: boolean;
    breakdown?: {
        spotify?: number;
        events?: number;
        vouches?: number;
        community?: number;
    };
}

type Tier = {
    name: string;
    color: string;
    bgColor: string;
    glowColor: string;
    animated: boolean;
};

const getTier = (score: number): Tier => {
    if (score >= 86) {
        return {
            name: 'Die-Hard Fan',
            color: '#eab308',
            bgColor: 'bg-yellow-500/20',
            glowColor: 'shadow-yellow-500/50',
            animated: true,
        };
    }
    if (score >= 61) {
        return {
            name: 'Superfan',
            color: '#8b5cf6',
            bgColor: 'bg-purple-500/20',
            glowColor: 'shadow-purple-500/40',
            animated: false,
        };
    }
    if (score >= 26) {
        return {
            name: 'Enthusiast',
            color: '#3b82f6',
            bgColor: 'bg-blue-500/20',
            glowColor: 'shadow-blue-500/30',
            animated: false,
        };
    }
    return {
        name: 'Casual Fan',
        color: '#6b7280',
        bgColor: 'bg-gray-500/20',
        glowColor: '',
        animated: false,
    };
};

const sizeConfig = {
    sm: {
        container: 'w-6 h-6',
        fontSize: 'text-[10px]',
        label: 'text-[9px]',
    },
    md: {
        container: 'w-8 h-8',
        fontSize: 'text-xs',
        label: 'text-[10px]',
    },
    lg: {
        container: 'w-12 h-12',
        fontSize: 'text-base',
        label: 'text-xs',
    },
};

export function FandomScoreBadge({
    score,
    size = 'md',
    showLabel = false,
    showTooltip = true,
    breakdown,
}: FandomScoreBadgeProps) {
    const [isHovered, setIsHovered] = useState(false);
    const tier = getTier(score);
    const config = sizeConfig[size];

    return (
        <div className="relative inline-flex items-center gap-1.5">
            <motion.div
                className={`
          ${config.container} 
          rounded-full 
          flex items-center justify-center 
          font-bold 
          ${config.fontSize}
          border-2
          cursor-pointer
          relative
          ${tier.animated ? 'shadow-lg' : ''}
          ${tier.glowColor}
        `}
                style={{
                    borderColor: tier.color,
                    color: tier.color,
                    backgroundColor: `${tier.color}20`,
                }}
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
                animate={
                    tier.animated
                        ? {
                            boxShadow: [
                                `0 0 10px ${tier.color}40`,
                                `0 0 20px ${tier.color}60`,
                                `0 0 10px ${tier.color}40`,
                            ],
                        }
                        : {}
                }
                transition={
                    tier.animated
                        ? {
                            duration: 2,
                            repeat: Infinity,
                            ease: 'easeInOut',
                        }
                        : {}
                }
            >
                {score}
            </motion.div>

            {showLabel && (
                <span
                    className={`${config.label} font-medium`}
                    style={{ color: tier.color }}
                >
                    {tier.name}
                </span>
            )}

            {/* Tooltip */}
            {showTooltip && isHovered && (
                <motion.div
                    initial={{ opacity: 0, y: 5, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 5, scale: 0.95 }}
                    className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 z-50"
                >
                    <div className="bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-2 shadow-xl min-w-[140px]">
                        <div
                            className="font-bold text-sm mb-1"
                            style={{ color: tier.color }}
                        >
                            {tier.name}
                        </div>
                        <div className="text-zinc-400 text-xs mb-2">
                            Score: {score}/100
                        </div>
                        {breakdown && (
                            <div className="space-y-1 text-xs border-t border-zinc-700 pt-2">
                                {breakdown.spotify !== undefined && (
                                    <div className="flex justify-between">
                                        <span className="text-zinc-500">🎵 Spotify</span>
                                        <span className="text-white">{breakdown.spotify}</span>
                                    </div>
                                )}
                                {breakdown.events !== undefined && (
                                    <div className="flex justify-between">
                                        <span className="text-zinc-500">🎟️ Events</span>
                                        <span className="text-white">{breakdown.events}</span>
                                    </div>
                                )}
                                {breakdown.vouches !== undefined && (
                                    <div className="flex justify-between">
                                        <span className="text-zinc-500">🤝 Vouches</span>
                                        <span className="text-white">{breakdown.vouches}</span>
                                    </div>
                                )}
                                {breakdown.community !== undefined && (
                                    <div className="flex justify-between">
                                        <span className="text-zinc-500">👥 Community</span>
                                        <span className="text-white">{breakdown.community}</span>
                                    </div>
                                )}
                            </div>
                        )}
                        {/* Arrow */}
                        <div
                            className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-zinc-900 border-r border-b border-zinc-700 rotate-45"
                        />
                    </div>
                </motion.div>
            )}
        </div>
    );
}

export default FandomScoreBadge;
