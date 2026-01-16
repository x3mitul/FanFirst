'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowBigUp, ArrowBigDown, MessageSquare, MoreHorizontal, ChevronDown, ChevronUp } from 'lucide-react';
import { Comment } from '@/lib/types';
import { FandomScoreBadge } from '@/components/ui/FandomScoreBadge';

interface CommentThreadProps {
    comments: Comment[];
    postId: string;
    onReply?: (parentId: string, content: string) => void;
    onVote?: (commentId: string, direction: 'up' | 'down') => void;
}

interface SingleCommentProps {
    comment: Comment;
    onReply?: (parentId: string, content: string) => void;
    onVote?: (commentId: string, direction: 'up' | 'down') => void;
}

function timeAgo(date: Date): string {
    const now = new Date();
    const diffMs = now.getTime() - new Date(date).getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return 'just now';
    if (diffMins < 60) return `${diffMins}m`;
    if (diffHours < 24) return `${diffHours}h`;
    if (diffDays < 7) return `${diffDays}d`;
    return new Date(date).toLocaleDateString();
}

function SingleComment({ comment, onReply, onVote }: SingleCommentProps) {
    const [userVote, setUserVote] = useState<'up' | 'down' | null>(null);
    const [showReplyForm, setShowReplyForm] = useState(false);
    const [replyContent, setReplyContent] = useState('');
    const [collapsed, setCollapsed] = useState(false);

    const netVotes = comment.upvotes - comment.downvotes + (userVote === 'up' ? 1 : userVote === 'down' ? -1 : 0);

    const handleVote = (direction: 'up' | 'down') => {
        if (userVote === direction) {
            setUserVote(null);
        } else {
            setUserVote(direction);
        }
        onVote?.(comment.id, direction);
    };

    const handleSubmitReply = () => {
        if (replyContent.trim()) {
            onReply?.(comment.id, replyContent);
            setReplyContent('');
            setShowReplyForm(false);
        }
    };

    // Indent based on depth (max 5 levels visually)
    const indentLevel = Math.min(comment.depth, 5);
    const borderColors = [
        'border-[#ccff00]',
        'border-blue-500',
        'border-purple-500',
        'border-orange-500',
        'border-pink-500',
        'border-cyan-500',
    ];

    return (
        <div className={`${comment.depth > 0 ? 'pl-4' : ''}`}>
            <div className={`border-l-2 ${borderColors[indentLevel % borderColors.length]} pl-4 py-2`}>
                {/* Comment Header */}
                <div className="flex items-center gap-2 mb-1">
                    <button
                        onClick={() => setCollapsed(!collapsed)}
                        className="text-zinc-500 hover:text-white"
                    >
                        {collapsed ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
                    </button>

                    {comment.author.avatar && (
                        <img
                            src={comment.author.avatar}
                            alt={comment.author.name}
                            className="w-6 h-6 rounded-full"
                        />
                    )}

                    <span className="text-sm font-medium text-white">{comment.author.name}</span>

                    <FandomScoreBadge
                        score={comment.author.fandomScore}
                        size="sm"
                    />

                    <span className="text-xs text-zinc-500">•</span>
                    <span className="text-xs text-zinc-500">{timeAgo(comment.createdAt)}</span>
                </div>

                <AnimatePresence>
                    {!collapsed && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                        >
                            {/* Content */}
                            <p className="text-zinc-300 text-sm mb-2 pl-6">{comment.content}</p>

                            {/* Actions */}
                            <div className="flex items-center gap-3 pl-6 text-xs">
                                <div className="flex items-center gap-1">
                                    <button
                                        onClick={() => handleVote('up')}
                                        className={`p-0.5 hover:bg-zinc-800 rounded ${userVote === 'up' ? 'text-[#ccff00]' : 'text-zinc-500 hover:text-white'
                                            }`}
                                    >
                                        <ArrowBigUp className="w-4 h-4" />
                                    </button>
                                    <span className={`font-medium ${netVotes > 0 ? 'text-[#ccff00]' : netVotes < 0 ? 'text-red-400' : 'text-zinc-400'
                                        }`}>
                                        {netVotes}
                                    </span>
                                    <button
                                        onClick={() => handleVote('down')}
                                        className={`p-0.5 hover:bg-zinc-800 rounded ${userVote === 'down' ? 'text-red-500' : 'text-zinc-500 hover:text-white'
                                            }`}
                                    >
                                        <ArrowBigDown className="w-4 h-4" />
                                    </button>
                                </div>

                                <button
                                    onClick={() => setShowReplyForm(!showReplyForm)}
                                    className="flex items-center gap-1 text-zinc-500 hover:text-white"
                                >
                                    <MessageSquare className="w-3 h-3" />
                                    Reply
                                </button>

                                <button className="text-zinc-500 hover:text-white">
                                    <MoreHorizontal className="w-4 h-4" />
                                </button>
                            </div>

                            {/* Reply Form */}
                            <AnimatePresence>
                                {showReplyForm && (
                                    <motion.div
                                        initial={{ opacity: 0, height: 0 }}
                                        animate={{ opacity: 1, height: 'auto' }}
                                        exit={{ opacity: 0, height: 0 }}
                                        className="mt-3 pl-6"
                                    >
                                        <textarea
                                            value={replyContent}
                                            onChange={(e) => setReplyContent(e.target.value)}
                                            placeholder="Write a reply..."
                                            className="w-full bg-zinc-800 border border-zinc-700 rounded-lg p-3 text-sm text-white placeholder:text-zinc-500 resize-none focus:border-[#ccff00] outline-none"
                                            rows={3}
                                        />
                                        <div className="flex gap-2 mt-2">
                                            <button
                                                onClick={handleSubmitReply}
                                                disabled={!replyContent.trim()}
                                                className="px-3 py-1.5 bg-[#ccff00] text-black text-xs font-bold rounded disabled:opacity-50"
                                            >
                                                Reply
                                            </button>
                                            <button
                                                onClick={() => {
                                                    setShowReplyForm(false);
                                                    setReplyContent('');
                                                }}
                                                className="px-3 py-1.5 text-zinc-400 text-xs hover:text-white"
                                            >
                                                Cancel
                                            </button>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            {/* Nested Replies */}
                            {comment.replies && comment.replies.length > 0 && (
                                <div className="mt-2">
                                    {comment.replies.map((reply) => (
                                        <SingleComment
                                            key={reply.id}
                                            comment={reply}
                                            onReply={onReply}
                                            onVote={onVote}
                                        />
                                    ))}
                                </div>
                            )}
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}

export function CommentThread({ comments, postId, onReply, onVote }: CommentThreadProps) {
    const [sortBy, setSortBy] = useState<'best' | 'new' | 'top'>('best');

    const sortedComments = [...comments].sort((a, b) => {
        switch (sortBy) {
            case 'new':
                return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
            case 'top':
                return (b.upvotes - b.downvotes) - (a.upvotes - a.downvotes);
            case 'best':
            default:
                // Best combines score and recency
                const scoreA = (a.upvotes - a.downvotes) * 0.7;
                const scoreB = (b.upvotes - b.downvotes) * 0.7;
                return scoreB - scoreA;
        }
    });

    return (
        <div>
            {/* Sort Options */}
            <div className="flex items-center gap-2 mb-4">
                <span className="text-sm text-zinc-500">Sort by:</span>
                {(['best', 'new', 'top'] as const).map((option) => (
                    <button
                        key={option}
                        onClick={() => setSortBy(option)}
                        className={`px-2 py-1 text-xs rounded ${sortBy === option
                                ? 'bg-zinc-700 text-white'
                                : 'text-zinc-500 hover:text-white'
                            }`}
                    >
                        {option.charAt(0).toUpperCase() + option.slice(1)}
                    </button>
                ))}
            </div>

            {/* Comments */}
            <div className="space-y-2">
                {sortedComments.map((comment) => (
                    <SingleComment
                        key={comment.id}
                        comment={comment}
                        onReply={onReply}
                        onVote={onVote}
                    />
                ))}
            </div>

            {comments.length === 0 && (
                <div className="text-center py-8 text-zinc-500">
                    No comments yet. Be the first to comment!
                </div>
            )}
        </div>
    );
}

export default CommentThread;
