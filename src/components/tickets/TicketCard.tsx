"use client";

import { useRef, useState } from "react";
import { motion } from "framer-motion";
import {
    Calendar,
    MapPin,
    Clock,
    ExternalLink,
    Download,
    Share2,
    Check,
    Loader2
} from "lucide-react";
import { Button, TicketQR } from "@/components/ui";
import { NFTTicket } from "@/hooks/useNFTTickets";
import { format } from "date-fns";
import html2canvas from "html2canvas";

interface TicketCardProps {
    ticket: NFTTicket;
    event: {
        title: string;
        date: Date;
        venue: string;
        location: string;
        time: string;
        image: string;
        artistImage: string;
    };
    tier: {
        name: string;
        price: number;
        currency: string;
    };
}

export function TicketCard({ ticket, event, tier }: TicketCardProps) {
    const ticketRef = useRef<HTMLDivElement>(null);
    const [isDownloading, setIsDownloading] = useState(false);
    const [isSharing, setIsSharing] = useState(false);
    const [shareSuccess, setShareSuccess] = useState(false);

    const explorerUrl = ticket.chainId === 137
        ? `https://polygonscan.com/token/${ticket.contractAddress}?a=${ticket.tokenId}`
        : `https://amoy.polygonscan.com/token/${ticket.contractAddress}?a=${ticket.tokenId}`;

    // Generate verification URL
    const getVerifyUrl = () => {
        const ticketPayload = {
            contract: ticket.contractAddress,
            token: ticket.tokenId,
            owner: ticket.owner,
            event: event.title,
            tier: tier.name,
            ts: Math.floor(Date.now() / 30000),
        };
        const encodedData = btoa(JSON.stringify(ticketPayload));
        return `${window.location.origin}/verify/${encodedData}`;
    };

    // Download ticket as image
    const handleDownload = async () => {
        if (!ticketRef.current || isDownloading) return;

        setIsDownloading(true);
        try {
            const canvas = await html2canvas(ticketRef.current, {
                backgroundColor: "#111",
                scale: 2,
                logging: false,
                useCORS: true,
            });

            const link = document.createElement("a");
            link.download = `fanfirst-ticket-${ticket.tokenId}.png`;
            link.href = canvas.toDataURL("image/png");
            link.click();
        } catch (error) {
            console.error("Error downloading ticket:", error);
        } finally {
            setIsDownloading(false);
        }
    };

    // Share ticket
    const handleShare = async () => {
        if (isSharing) return;

        setIsSharing(true);
        const verifyUrl = getVerifyUrl();
        const shareData = {
            title: `${event.title} - NFT Ticket`,
            text: `Check out my NFT ticket for ${event.title} at ${event.venue}!`,
            url: verifyUrl,
        };

        try {
            if (navigator.share && navigator.canShare(shareData)) {
                await navigator.share(shareData);
            } else {
                // Fallback: copy to clipboard
                await navigator.clipboard.writeText(verifyUrl);
                setShareSuccess(true);
                setTimeout(() => setShareSuccess(false), 2000);
            }
        } catch (error) {
            // User cancelled or error - try clipboard
            if ((error as Error).name !== "AbortError") {
                try {
                    await navigator.clipboard.writeText(verifyUrl);
                    setShareSuccess(true);
                    setTimeout(() => setShareSuccess(false), 2000);
                } catch {
                    console.error("Failed to copy to clipboard");
                }
            }
        } finally {
            setIsSharing(false);
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="group relative bg-[#111] border border-white/10 rounded-3xl overflow-hidden shadow-2xl hover:border-primary/50 transition-all duration-500"
        >
            <div ref={ticketRef} className="flex flex-col md:flex-row h-full">
                {/* Left Section: Event Info */}
                <div className="flex-1 p-8">
                    <div className="flex items-center gap-4 mb-6">
                        <div className="w-12 h-12 rounded-full border-2 border-primary overflow-hidden">
                            <img src={event.artistImage} alt="" className="w-full h-full object-cover" />
                        </div>
                        <div>
                            <span className="text-primary text-[10px] font-bold tracking-[0.2em] uppercase">Official NFT Ticket</span>
                            <h3 className="text-2xl font-black text-white leading-tight uppercase tracking-tight">{event.title}</h3>
                        </div>
                    </div>

                    <div className="space-y-4 mb-8">
                        <div className="flex items-center gap-3 text-white/60">
                            <Calendar className="w-4 h-4 text-primary" />
                            <span className="text-sm font-medium">{format(event.date, "EEEE, MMMM do, yyyy")}</span>
                        </div>
                        <div className="flex items-center gap-3 text-white/60">
                            <Clock className="w-4 h-4 text-primary" />
                            <span className="text-sm font-medium">{event.time}</span>
                        </div>
                        <div className="flex items-center gap-3 text-white/60">
                            <MapPin className="w-4 h-4 text-primary" />
                            <div className="text-sm font-medium">
                                <p className="text-white">{event.venue}</p>
                                <p className="text-xs text-white/40">{event.location}</p>
                            </div>
                        </div>
                    </div>

                    <div className="pt-6 border-t border-white/5">
                        <div className="flex items-center justify-between mb-4">
                            <div>
                                <p className="text-[10px] text-white/40 uppercase tracking-widest mb-1">Pass Type</p>
                                <p className="text-sm font-bold text-white uppercase">{tier.name}</p>
                            </div>
                            <div className="text-right">
                                <p className="text-[10px] text-white/40 uppercase tracking-widest mb-1">Token ID</p>
                                <p className="text-sm font-mono text-primary font-bold">#{ticket.tokenId}</p>
                            </div>
                        </div>

                        <div className="flex items-center gap-2">
                            <a
                                href={explorerUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-2 text-[10px] font-mono text-white/30 hover:text-primary transition-colors uppercase tracking-widest"
                            >
                                <ExternalLink className="w-3 h-3" />
                                View on Polygonscan
                            </a>
                        </div>
                    </div>
                </div>

                {/* Right Section: Virtual Stub/QR */}
                <div className="w-full md:w-72 bg-gradient-to-b from-[#1a1a1a] to-black border-l border-white/5 p-8 flex flex-col items-center justify-center relative">
                    {/* Perforation line simulation */}
                    <div className="hidden md:block absolute left-[-1px] top-0 bottom-0 border-l border-dashed border-white/20" />

                    <div className="mb-6 transform group-hover:scale-105 transition-transform duration-500">
                        <TicketQR
                            contractAddress={ticket.contractAddress}
                            tokenId={ticket.tokenId}
                            owner={ticket.owner}
                            eventName={event.title}
                            tierName={tier.name}
                        />
                    </div>

                    <div className="flex gap-2 w-full">
                        <Button
                            variant="ghost"
                            size="sm"
                            className="flex-1 h-10 border-white/10 hover:bg-white/5"
                            onClick={handleDownload}
                            disabled={isDownloading}
                        >
                            {isDownloading ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                                <Download className="w-4 h-4" />
                            )}
                        </Button>
                        <Button
                            variant="ghost"
                            size="sm"
                            className="flex-1 h-10 border-white/10 hover:bg-white/5"
                            onClick={handleShare}
                            disabled={isSharing}
                        >
                            {shareSuccess ? (
                                <Check className="w-4 h-4 text-green-500" />
                            ) : isSharing ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                                <Share2 className="w-4 h-4" />
                            )}
                        </Button>
                    </div>
                </div>
            </div>

            {/* Security Watermark */}
            <div className="absolute top-4 right-4 text-[8px] font-black text-white/[0.03] pointer-events-none uppercase tracking-[1em] rotate-90 origin-right">
                Authentic Ticket • FanFirst Protocol • {ticket.contractAddress}
            </div>
        </motion.div>
    );
}

