'use client';

import { motion, AnimatePresence } from 'framer-motion';

interface TypingIndicatorProps {
    users: string[];
}

export function TypingIndicator({ users }: TypingIndicatorProps) {
    if (users.length === 0) return null;

    const displayText = () => {
        if (users.length === 1) {
            return `${users[0]} is typing`;
        } else if (users.length === 2) {
            return `${users[0]} and ${users[1]} are typing`;
        } else if (users.length === 3) {
            return `${users[0]}, ${users[1]}, and ${users[2]} are typing`;
        } else {
            return `${users.length} people are typing`;
        }
    };

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                className="flex items-center gap-2 px-4 py-2 text-sm text-zinc-400"
            >
                <div className="flex gap-1">
                    <motion.span
                        className="w-1.5 h-1.5 bg-[#ccff00] rounded-full"
                        animate={{ scale: [1, 1.3, 1] }}
                        transition={{ duration: 0.6, repeat: Infinity, delay: 0 }}
                    />
                    <motion.span
                        className="w-1.5 h-1.5 bg-[#ccff00] rounded-full"
                        animate={{ scale: [1, 1.3, 1] }}
                        transition={{ duration: 0.6, repeat: Infinity, delay: 0.2 }}
                    />
                    <motion.span
                        className="w-1.5 h-1.5 bg-[#ccff00] rounded-full"
                        animate={{ scale: [1, 1.3, 1] }}
                        transition={{ duration: 0.6, repeat: Infinity, delay: 0.4 }}
                    />
                </div>
                <span>{displayText()}</span>
            </motion.div>
        </AnimatePresence>
    );
}

export default TypingIndicator;
