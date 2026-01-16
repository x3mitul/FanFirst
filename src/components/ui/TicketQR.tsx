"use client";

import { useEffect, useState } from "react";
import { QRCodeSVG } from "qrcode.react";
import { motion, AnimatePresence } from "framer-motion";
import { RefreshCw, ShieldCheck } from "lucide-react";

interface TicketQRProps {
    contractAddress?: string;
    tokenId?: string;
    owner?: string;
    // Legacy/Metadata support
    ticketId?: string;
    eventName?: string;
    tierName?: string;
    holderName?: string;
    className?: string;
}

export function TicketQR({
    contractAddress,
    tokenId,
    owner,
    ticketId,
    eventName,
    tierName,
    holderName,
    className
}: TicketQRProps) {
    const [timestamp, setTimestamp] = useState(Date.now());
    const [secondsRemaining, setSecondsRemaining] = useState(30);

    // Refresh QR data every 30 seconds for security
    useEffect(() => {
        const interval = setInterval(() => {
            setSecondsRemaining((prev) => {
                if (prev <= 1) {
                    setTimestamp(Date.now());
                    return 30;
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(interval);
    }, []);

    // Encode ticket data with a timestamp to make the QR dynamic
    const ticketPayload = {
        contract: contractAddress || 'mock-contract',
        token: tokenId || ticketId || 'mock-token',
        owner: owner || holderName || 'anonymous',
        event: eventName,
        tier: tierName,
        ts: Math.floor(timestamp / 30000), // Change key every 30 seconds
    };

    // Create a URL that can be scanned and opened in browser
    const baseUrl = typeof window !== 'undefined' ? window.location.origin : 'https://fanfirst.app';
    const encodedData = btoa(JSON.stringify(ticketPayload));
    const qrData = `${baseUrl}/verify/${encodedData}`;


    return (
        <div className={`relative flex flex-col items-center gap-4 ${className}`}>
            <div className="relative p-4 bg-white rounded-2xl shadow-xl">
                <QRCodeSVG
                    value={qrData}
                    size={200}
                    level="H"
                    includeMargin={false}
                    imageSettings={{
                        src: "/favicon.ico",
                        x: undefined,
                        y: undefined,
                        height: 40,
                        width: 40,
                        excavate: true,
                    }}
                />

                {/* Dynamic Overlay for refreshing */}
                <AnimatePresence mode="wait">
                    {secondsRemaining <= 3 ? (
                        <motion.div
                            key="refreshing"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="absolute inset-0 bg-white/80 backdrop-blur-[2px] rounded-2xl flex items-center justify-center"
                        >
                            <RefreshCw className="w-8 h-8 text-primary animate-spin" />
                        </motion.div>
                    ) : null}
                </AnimatePresence>
            </div>

            <div className="flex flex-col items-center gap-1">
                <div className="flex items-center gap-2 text-xs font-mono text-muted">
                    <ShieldCheck className="w-3 h-3 text-accent" />
                    SECURE DYNAMIC CODE
                </div>
                <div className="w-48 h-1 bg-card rounded-full mt-2 overflow-hidden">
                    <motion.div
                        className="h-full bg-primary"
                        initial={{ width: "100%" }}
                        animate={{ width: `${(secondsRemaining / 30) * 100}%` }}
                        transition={{ duration: 1, ease: "linear" }}
                    />
                </div>
                <span className="text-[10px] text-muted-foreground uppercase tracking-widest mt-1">
                    Refreshes in {secondsRemaining}s
                </span>
            </div>
        </div>
    );
}
