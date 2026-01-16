'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Flame, Clock, TrendingUp, Star } from 'lucide-react';

export type FilterType = 'hot' | 'new' | 'top' | 'topfans';
export type TimeRange = 'day' | 'week' | 'month' | 'year' | 'all';

interface PostFiltersProps {
    activeFilter: FilterType;
    onFilterChange: (filter: FilterType) => void;
    timeRange?: TimeRange;
    onTimeRangeChange?: (range: TimeRange) => void;
}

const filters: { id: FilterType; label: string; icon: typeof Flame }[] = [
    { id: 'hot', label: 'Hot', icon: Flame },
    { id: 'new', label: 'New', icon: Clock },
    { id: 'top', label: 'Top', icon: TrendingUp },
    { id: 'topfans', label: 'Top Fans', icon: Star },
];

const timeRanges: { id: TimeRange; label: string }[] = [
    { id: 'day', label: 'Today' },
    { id: 'week', label: 'This Week' },
    { id: 'month', label: 'This Month' },
    { id: 'year', label: 'This Year' },
    { id: 'all', label: 'All Time' },
];

export function PostFilters({
    activeFilter,
    onFilterChange,
    timeRange = 'week',
    onTimeRangeChange
}: PostFiltersProps) {
    const [showTimeRange, setShowTimeRange] = useState(false);

    return (
        <div className="bg-zinc-900 border border-zinc-800 p-2 mb-4">
            <div className="flex items-center gap-2 flex-wrap">
                {filters.map((filter) => {
                    const Icon = filter.icon;
                    const isActive = activeFilter === filter.id;

                    return (
                        <button
                            key={filter.id}
                            onClick={() => {
                                onFilterChange(filter.id);
                                if (filter.id === 'top') {
                                    setShowTimeRange(true);
                                } else {
                                    setShowTimeRange(false);
                                }
                            }}
                            className={`
                flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium transition-all
                ${isActive
                                    ? filter.id === 'topfans'
                                        ? 'bg-[#ccff00] text-black'
                                        : 'bg-white text-black'
                                    : 'text-zinc-400 hover:text-white hover:bg-zinc-800'
                                }
              `}
                        >
                            <Icon className="w-4 h-4" />
                            {filter.label}
                            {filter.id === 'topfans' && (
                                <span className="text-[10px] bg-black/20 px-1.5 py-0.5 rounded-full">
                                    ⭐ Unique
                                </span>
                            )}
                        </button>
                    );
                })}

                {/* Time Range Dropdown (for Top filter) */}
                {(activeFilter === 'top' || showTimeRange) && onTimeRangeChange && (
                    <motion.div
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="flex items-center gap-1 ml-2 border-l border-zinc-700 pl-3"
                    >
                        {timeRanges.map((range) => (
                            <button
                                key={range.id}
                                onClick={() => onTimeRangeChange(range.id)}
                                className={`
                  px-2 py-1 text-xs rounded transition-colors
                  ${timeRange === range.id
                                        ? 'bg-zinc-700 text-white'
                                        : 'text-zinc-500 hover:text-white'
                                    }
                `}
                            >
                                {range.label}
                            </button>
                        ))}
                    </motion.div>
                )}
            </div>

            {/* Top Fans Explainer */}
            {activeFilter === 'topfans' && (
                <motion.p
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="text-xs text-zinc-500 mt-2 flex items-center gap-1"
                >
                    <Star className="w-3 h-3 text-[#ccff00]" />
                    Showing posts from users with the highest Fandom Scores first
                </motion.p>
            )}
        </div>
    );
}

export default PostFilters;
