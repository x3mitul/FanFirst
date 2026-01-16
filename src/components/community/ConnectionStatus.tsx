'use client';

import { motion } from 'framer-motion';
import { Wifi, WifiOff } from 'lucide-react';

interface ConnectionStatusProps {
    isConnected: boolean;
    showText?: boolean;
}

export function ConnectionStatus({ isConnected, showText = true }: ConnectionStatusProps) {
    return (
        <div className="flex items-center gap-2">
            <motion.div
                className={`flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-medium ${isConnected
                        ? 'bg-green-500/20 text-green-400'
                        : 'bg-red-500/20 text-red-400'
                    }`}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
            >
                {isConnected ? (
                    <>
                        <motion.div
                            className="w-2 h-2 bg-green-400 rounded-full"
                            animate={{ scale: [1, 1.2, 1] }}
                            transition={{ duration: 2, repeat: Infinity }}
                        />
                        {showText && <span>Live</span>}
                    </>
                ) : (
                    <>
                        <WifiOff className="w-3 h-3" />
                        {showText && <span>Offline</span>}
                    </>
                )}
            </motion.div>
        </div>
    );
}

export default ConnectionStatus;
