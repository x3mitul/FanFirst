"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface VideoIntroProps {
    onComplete: () => void;
    videoUrl?: string;
}

export function VideoIntro({ onComplete, videoUrl }: VideoIntroProps) {
    const [isVideoEnded, setIsVideoEnded] = useState(false);

    useEffect(() => {
        // Auto-skip after 3 seconds if video doesn't load
        const timeout = setTimeout(() => {
            if (!isVideoEnded) {
                handleComplete();
            }
        }, 3000);

        return () => clearTimeout(timeout);
    }, [isVideoEnded]);

    const handleComplete = () => {
        setIsVideoEnded(true);
        setTimeout(() => {
            onComplete();
        }, 500);
    };

    return (
        <AnimatePresence>
            {!isVideoEnded && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.5 }}
                    className="fixed inset-0 z-50 bg-black flex items-center justify-center"
                >
                    {/* Video Background */}
                    <div className="absolute inset-0">
                        {videoUrl ? (
                            <video
                                autoPlay
                                muted
                                playsInline
                                onEnded={handleComplete}
                                className="w-full h-full object-cover"
                            >
                                <source src={videoUrl} type="video/mp4" />
                            </video>
                        ) : (
                            // Fallback animated gradient if no video
                            <motion.div
                                className="w-full h-full"
                                animate={{
                                    background: [
                                        'radial-gradient(circle at 20% 50%, rgba(223, 255, 0, 0.3) 0%, transparent 50%), radial-gradient(circle at 80% 50%, rgba(0, 255, 136, 0.3) 0%, transparent 50%)',
                                        'radial-gradient(circle at 80% 50%, rgba(0, 212, 255, 0.3) 0%, transparent 50%), radial-gradient(circle at 20% 50%, rgba(255, 0, 255, 0.3) 0%, transparent 50%)',
                                        'radial-gradient(circle at 20% 50%, rgba(223, 255, 0, 0.3) 0%, transparent 50%), radial-gradient(circle at 80% 50%, rgba(0, 255, 136, 0.3) 0%, transparent 50%)'
                                    ]
                                }}
                                transition={{
                                    duration: 2,
                                    repeat: 0,
                                    ease: "easeInOut",
                                    onComplete: handleComplete
                                }}
                            />
                        )}
                    </div>

                    {/* Overlay Content */}
                    <div className="relative z-10 text-center">
                        <motion.div
                            initial={{ scale: 0.5, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            transition={{ delay: 0.3, duration: 0.8, ease: "easeOut" }}
                        >
                            <h1
                                className="text-7xl lg:text-9xl font-black uppercase tracking-tight mb-6"
                                style={{
                                    WebkitTextStroke: '3px #dfff00',
                                    WebkitTextFillColor: 'transparent',
                                    textShadow: '0 0 80px rgba(223, 255, 0, 1), 0 0 160px rgba(223, 255, 0, 0.6)',
                                    filter: 'drop-shadow(0 0 40px rgba(223, 255, 0, 0.8))',
                                    animation: 'pulse 2s ease-in-out infinite'
                                }}
                            >
                                FanFirst
                            </h1>

                            <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: "100%" }}
                                transition={{ delay: 1, duration: 2, ease: "easeInOut" }}
                                className="h-1 bg-gradient-to-r from-[#dfff00] via-[#00ff88] to-[#00d4ff] mx-auto max-w-md mb-6"
                            />

                            <motion.p
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 1.5, duration: 0.6 }}
                                className="text-transparent bg-clip-text bg-gradient-to-r from-[#dfff00] via-[#00ff88] to-[#00d4ff] text-2xl font-bold"
                            >
                                Where Fans Come First
                            </motion.p>
                        </motion.div>

                        {/* Skip Button */}
                        <motion.button
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 0.7 }}
                            whileHover={{ opacity: 1, scale: 1.05 }}
                            transition={{ delay: 1 }}
                            onClick={handleComplete}
                            className="absolute bottom-12 right-12 px-6 py-3 bg-black/50 border-2 border-[#dfff00] rounded-full text-[#dfff00] font-bold hover:bg-[#dfff00] hover:text-black transition-all duration-300"
                        >
                            Skip Intro →
                        </motion.button>
                    </div>

                    <style jsx>{`
            @keyframes pulse {
              0%, 100% {
                filter: drop-shadow(0 0 40px rgba(223, 255, 0, 0.8));
              }
              50% {
                filter: drop-shadow(0 0 60px rgba(223, 255, 0, 1)) drop-shadow(0 0 80px rgba(0, 255, 136, 0.6));
              }
            }
          `}</style>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
