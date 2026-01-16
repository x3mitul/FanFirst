"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Upload, Users, Lock } from "lucide-react";
import { Button } from "@/components/ui/Button";

interface CreateCommunityModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (data: CommunityFormData) => void;
}

export interface CommunityFormData {
    name: string;
    artistName: string;
    description: string;
    accessType: "token" | "nft" | "fandom-score";
    minAmount?: number;
    minScore?: number;
    votingPower: "token" | "reputation" | "equal";
}

export function CreateCommunityModal({ isOpen, onClose, onSubmit }: CreateCommunityModalProps) {
    const [formData, setFormData] = useState<CommunityFormData>({
        name: "",
        artistName: "",
        description: "",
        accessType: "token",
        votingPower: "token",
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSubmit(formData);
        onClose();
        // Reset form
        setFormData({
            name: "",
            artistName: "",
            description: "",
            accessType: "token",
            votingPower: "token",
        });
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/80 z-50"
                        onClick={onClose}
                    />

                    {/* Modal */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        className="fixed inset-0 z-50 flex items-center justify-center p-4"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="bg-zinc-900 border-4 border-[#ccff00] max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                            {/* Header */}
                            <div className="sticky top-0 bg-zinc-900 border-b-4 border-white p-6 flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <Users className="w-8 h-8 text-[#ccff00]" />
                                    <h2 className="text-3xl font-black text-white uppercase">
                                        Create Community
                                    </h2>
                                </div>
                                <button
                                    onClick={onClose}
                                    className="text-zinc-400 hover:text-white transition-colors"
                                >
                                    <X className="w-6 h-6" />
                                </button>
                            </div>

                            {/* Form */}
                            <form onSubmit={handleSubmit} className="p-6 space-y-6">
                                {/* Community Name */}
                                <div>
                                    <label className="block text-white font-bold mb-2 uppercase text-sm tracking-wide">
                                        Community Name *
                                    </label>
                                    <input
                                        type="text"
                                        required
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        placeholder="e.g. Swifties United, ARMY Global"
                                        className="w-full px-4 py-3 bg-black border-2 border-zinc-700 text-white placeholder-zinc-500 focus:outline-none focus:border-[#ccff00] transition-colors"
                                    />
                                </div>

                                {/* Artist Name */}
                                <div>
                                    <label className="block text-white font-bold mb-2 uppercase text-sm tracking-wide">
                                        Artist/Band Name *
                                    </label>
                                    <input
                                        type="text"
                                        required
                                        value={formData.artistName}
                                        onChange={(e) => setFormData({ ...formData, artistName: e.target.value })}
                                        placeholder="e.g. Taylor Swift, BTS"
                                        className="w-full px-4 py-3 bg-black border-2 border-zinc-700 text-white placeholder-zinc-500 focus:outline-none focus:border-[#ccff00] transition-colors"
                                    />
                                </div>

                                {/* Description */}
                                <div>
                                    <label className="block text-white font-bold mb-2 uppercase text-sm tracking-wide">
                                        Description *
                                    </label>
                                    <textarea
                                        required
                                        rows={4}
                                        value={formData.description}
                                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                        placeholder="Describe what makes your community special..."
                                        className="w-full px-4 py-3 bg-black border-2 border-zinc-700 text-white placeholder-zinc-500 focus:outline-none focus:border-[#ccff00] transition-colors resize-none"
                                    />
                                    <p className="text-xs text-zinc-500 mt-1">
                                        {formData.description.length}/500 characters
                                    </p>
                                </div>

                                {/* Access Requirements */}
                                <div>
                                    <label className="block text-white font-bold mb-3 uppercase text-sm tracking-wide flex items-center gap-2">
                                        <Lock className="w-4 h-4" />
                                        Access Requirements *
                                    </label>
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                        <button
                                            type="button"
                                            onClick={() => setFormData({ ...formData, accessType: "token" })}
                                            className={`p-4 border-2 transition-all ${formData.accessType === "token"
                                                    ? "border-[#ccff00] bg-[#ccff00]/10"
                                                    : "border-zinc-700 hover:border-zinc-600"
                                                }`}
                                        >
                                            <div className="font-bold text-white text-sm mb-1">TOKEN HOLDER</div>
                                            <div className="text-xs text-zinc-400">Require token ownership</div>
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setFormData({ ...formData, accessType: "nft" })}
                                            className={`p-4 border-2 transition-all ${formData.accessType === "nft"
                                                    ? "border-[#ccff00] bg-[#ccff00]/10"
                                                    : "border-zinc-700 hover:border-zinc-600"
                                                }`}
                                        >
                                            <div className="font-bold text-white text-sm mb-1">NFT HOLDER</div>
                                            <div className="text-xs text-zinc-400">Require NFT ownership</div>
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setFormData({ ...formData, accessType: "fandom-score" })}
                                            className={`p-4 border-2 transition-all ${formData.accessType === "fandom-score"
                                                    ? "border-[#ccff00] bg-[#ccff00]/10"
                                                    : "border-zinc-700 hover:border-zinc-600"
                                                }`}
                                        >
                                            <div className="font-bold text-white text-sm mb-1">FANDOM SCORE</div>
                                            <div className="text-xs text-zinc-400">Min fandom score</div>
                                        </button>
                                    </div>

                                    {/* Conditional Input */}
                                    {formData.accessType === "token" && (
                                        <div className="mt-3">
                                            <input
                                                type="number"
                                                min="1"
                                                value={formData.minAmount || ""}
                                                onChange={(e) => setFormData({ ...formData, minAmount: parseInt(e.target.value) })}
                                                placeholder="Minimum tokens required"
                                                className="w-full px-4 py-3 bg-black border-2 border-zinc-700 text-white placeholder-zinc-500 focus:outline-none focus:border-[#ccff00]"
                                            />
                                        </div>
                                    )}
                                    {formData.accessType === "fandom-score" && (
                                        <div className="mt-3">
                                            <input
                                                type="number"
                                                min="1"
                                                max="100"
                                                value={formData.minScore || ""}
                                                onChange={(e) => setFormData({ ...formData, minScore: parseInt(e.target.value) })}
                                                placeholder="Minimum fandom score (1-100)"
                                                className="w-full px-4 py-3 bg-black border-2 border-zinc-700 text-white placeholder-zinc-500 focus:outline-none focus:border-[#ccff00]"
                                            />
                                        </div>
                                    )}
                                </div>

                                {/* Voting Power */}
                                <div>
                                    <label className="block text-white font-bold mb-3 uppercase text-sm tracking-wide">
                                        Voting Power *
                                    </label>
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                        <button
                                            type="button"
                                            onClick={() => setFormData({ ...formData, votingPower: "token" })}
                                            className={`p-4 border-2 transition-all ${formData.votingPower === "token"
                                                    ? "border-[#ccff00] bg-[#ccff00]/10"
                                                    : "border-zinc-700 hover:border-zinc-600"
                                                }`}
                                        >
                                            <div className="font-bold text-white text-sm mb-1">TOKEN VOTING</div>
                                            <div className="text-xs text-zinc-400">1 token = 1 vote</div>
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setFormData({ ...formData, votingPower: "reputation" })}
                                            className={`p-4 border-2 transition-all ${formData.votingPower === "reputation"
                                                    ? "border-[#ccff00] bg-[#ccff00]/10"
                                                    : "border-zinc-700 hover:border-zinc-600"
                                                }`}
                                        >
                                            <div className="font-bold text-white text-sm mb-1">REPUTATION</div>
                                            <div className="text-xs text-zinc-400">Based on activity</div>
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setFormData({ ...formData, votingPower: "equal" })}
                                            className={`p-4 border-2 transition-all ${formData.votingPower === "equal"
                                                    ? "border-[#ccff00] bg-[#ccff00]/10"
                                                    : "border-zinc-700 hover:border-zinc-600"
                                                }`}
                                        >
                                            <div className="font-bold text-white text-sm mb-1">EQUAL VOTING</div>
                                            <div className="text-xs text-zinc-400">1 person = 1 vote</div>
                                        </button>
                                    </div>
                                </div>

                                {/* Submit Buttons */}
                                <div className="flex gap-4 pt-6">
                                    <Button
                                        type="submit"
                                        variant="primary"
                                        size="lg"
                                        className="flex-1"
                                    >
                                        Create Community
                                    </Button>
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="lg"
                                        onClick={onClose}
                                        className="border-2 border-zinc-700 hover:border-white"
                                    >
                                        Cancel
                                    </Button>
                                </div>

                                {/* Info Note */}
                                <div className="bg-black border-2 border-zinc-800 p-4">
                                    <p className="text-xs text-zinc-400">
                                        ℹ️ <strong className="text-white">Note:</strong> Creating a community will deploy a Solana program for governance.
                                        You'll need SOL for deployment fees (≈0.05 SOL).
                                    </p>
                                </div>
                            </form>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}
