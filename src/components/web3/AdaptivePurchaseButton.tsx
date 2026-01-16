'use client';

import { useState } from 'react';
import { usePrivy, useWallets } from '@privy-io/react-auth';
import { useWeb3Comfort } from '@/hooks/useWeb3Comfort';
import { Button } from '@/components/ui';
import { Wallet, CreditCard, Sparkles, Brain, ChevronDown, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface AdaptivePurchaseButtonProps {
    ticketPrice: string;
    tierName: string;
    onWalletPurchase: () => void;
    onEmbeddedPurchase?: () => void;
    isPending?: boolean;
    disabled?: boolean;
}

export function AdaptivePurchaseButton({
    ticketPrice,
    tierName,
    onWalletPurchase,
    onEmbeddedPurchase,
    isPending,
    disabled
}: AdaptivePurchaseButtonProps) {
    const { result, isAnalyzing, isNovice, shouldHideWallet, resetSignals, recordWalletConnection } = useWeb3Comfort();
    const { login, authenticated, ready, user } = usePrivy();
    const { wallets } = useWallets();
    const [showOptions, setShowOptions] = useState(false);
    const [showAIInsight, setShowAIInsight] = useState(false);
    const [isLoggingIn, setIsLoggingIn] = useState(false);

    // Get embedded wallet if exists
    const embeddedWallet = wallets.find(w => w.walletClientType === 'privy');

    // Handle simple checkout (Privy login + embedded wallet)
    const handleSimpleCheckout = async () => {
        if (!ready) return;

        if (!authenticated) {
            setIsLoggingIn(true);
            try {
                await login();
                recordWalletConnection();
            } catch (e) {
                console.error('Login failed:', e);
            } finally {
                setIsLoggingIn(false);
            }
        } else if (embeddedWallet) {
            // User has embedded wallet, proceed with purchase
            console.log('🎟️ Purchasing with embedded wallet:', embeddedWallet.address);
            onEmbeddedPurchase?.() || onWalletPurchase();
        } else {
            // Authenticated but no embedded wallet - use external wallet
            onWalletPurchase();
        }
    };

    // Loading state
    if (isAnalyzing || !ready) {
        return (
            <Button disabled className="w-full h-16 rounded-full">
                <Brain className="w-5 h-5 mr-2 animate-pulse" />
                Analyzing your preferences...
            </Button>
        );
    }

    // Show login success message
    if (authenticated && embeddedWallet && isNovice) {
        return (
            <div className="space-y-3">
                <div className="p-4 bg-green-500/10 border border-green-500/20 rounded-2xl text-green-400 text-sm">
                    <p className="font-bold">✓ Wallet Ready!</p>
                    <p className="text-xs text-green-400/60 font-mono mt-1">
                        {embeddedWallet.address.slice(0, 6)}...{embeddedWallet.address.slice(-4)}
                    </p>
                </div>
                <Button
                    className="w-full h-16 rounded-full text-lg font-black uppercase italic bg-gradient-to-r from-green-500 to-emerald-600"
                    onClick={onWalletPurchase}
                    disabled={disabled || isPending}
                >
                    {isPending ? 'Processing...' : `Complete Purchase • ${ticketPrice}`}
                </Button>
                <p className="text-center text-xs text-white/40">
                    <Sparkles className="w-3 h-3 inline mr-1 text-purple-400" />
                    AI created a wallet for you automatically
                </p>
            </div>
        );
    }

    // Novice user: Simple, non-scary button
    if (isNovice || shouldHideWallet) {
        return (
            <div className="space-y-3">
                <Button
                    className="w-full h-16 rounded-full text-lg font-black uppercase italic bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700"
                    onClick={handleSimpleCheckout}
                    disabled={disabled || isPending || isLoggingIn}
                >
                    {isLoggingIn ? (
                        <>
                            <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                            Setting up...
                        </>
                    ) : isPending ? (
                        'Processing...'
                    ) : (
                        <>
                            <CreditCard className="w-5 h-5 mr-2" />
                            Buy Ticket • {ticketPrice}
                        </>
                    )}
                </Button>

                {/* AI insight badge */}
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-center justify-center gap-2 text-xs text-white/40"
                >
                    <Sparkles className="w-3 h-3 text-purple-400" />
                    <span>AI simplified this for you</span>
                    <button
                        onClick={() => setShowOptions(!showOptions)}
                        className="text-purple-400 hover:text-purple-300 underline"
                    >
                        More options
                    </button>
                </motion.div>

                <AnimatePresence>
                    {showOptions && (
                        <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="overflow-hidden"
                        >
                            <Button
                                variant="outline"
                                className="w-full h-12 rounded-full"
                                onClick={onWalletPurchase}
                                disabled={disabled || isPending}
                            >
                                <Wallet className="w-4 h-4 mr-2" />
                                Connect Wallet Instead
                            </Button>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        );
    }

    // Crypto-curious or native: Show both options
    return (
        <div className="space-y-3">
            <Button
                className="w-full h-16 rounded-full text-lg font-black uppercase italic"
                onClick={onWalletPurchase}
                disabled={disabled || isPending}
            >
                {isPending ? (
                    'Processing...'
                ) : (
                    <>
                        <Wallet className="w-5 h-5 mr-2" />
                        Purchase NFT Ticket
                    </>
                )}
            </Button>

            {result?.shouldOfferEmbeddedWallet && (
                <Button
                    variant="secondary"
                    className="w-full h-12 rounded-full"
                    onClick={handleSimpleCheckout}
                    disabled={disabled || isPending || isLoggingIn}
                >
                    {isLoggingIn ? (
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                        <CreditCard className="w-4 h-4 mr-2" />
                    )}
                    Use Simple Checkout
                </Button>
            )}

            {/* AI insight for curious users */}
            <motion.button
                onClick={() => setShowAIInsight(!showAIInsight)}
                className="flex items-center justify-center gap-2 text-xs text-white/40 hover:text-white/60 w-full"
            >
                <Brain className="w-3 h-3 text-purple-400" />
                <span>AI detected: {result?.level} user</span>
                <ChevronDown className={`w-3 h-3 transition-transform ${showAIInsight ? 'rotate-180' : ''}`} />
            </motion.button>

            <AnimatePresence>
                {showAIInsight && result && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden"
                    >
                        <div className="p-4 bg-purple-500/10 border border-purple-500/20 rounded-2xl text-sm space-y-2">
                            <div className="flex justify-between">
                                <span className="text-white/60">Comfort Level:</span>
                                <span className="font-bold text-purple-400 uppercase">{result.level}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-white/60">Confidence:</span>
                                <span>{Math.round(result.confidence * 100)}%</span>
                            </div>
                            <p className="text-white/40 text-xs italic">
                                {result.aiReasoning || result.recommendation}
                            </p>
                            <button
                                onClick={resetSignals}
                                className="text-xs text-purple-400 hover:underline"
                            >
                                Reset (demo)
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
