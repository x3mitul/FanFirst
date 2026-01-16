'use client';

import { useWallet } from '@solana/wallet-adapter-react';
import { WalletName, WalletReadyState } from '@solana/wallet-adapter-base';
import { X } from 'lucide-react';
import { useEffect, useState, useCallback } from 'react';

interface SolanaWalletModalProps {
  visible: boolean;
  onClose: () => void;
}

export function SolanaWalletModal({ visible, onClose }: SolanaWalletModalProps) {
  const { wallets, select, wallet, connect, connecting, connected } = useWallet();
  const [error, setError] = useState<string | null>(null);

  // Auto-close when connected
  useEffect(() => {
    if (connected && visible) {
      console.log('Wallet connected, closing modal');
      setError(null);
      onClose();
    }
  }, [connected, visible, onClose]);

  // Safe connect function with retry logic
  const safeConnect = useCallback(async (retryCount = 0) => {
    if (!wallet) return;

    // Check if wallet is ready
    const isReady = wallet.readyState === WalletReadyState.Installed ||
      wallet.readyState === WalletReadyState.Loadable;

    if (!isReady) {
      setError('Wallet is not installed or ready');
      return;
    }

    try {
      setError(null);
      console.log('Attempting to connect wallet:', wallet.adapter.name, 'attempt:', retryCount + 1);
      await connect();
    } catch (err: any) {
      console.error('Connection error:', err);
      const errorMessage = err?.message?.toLowerCase() || '';
      const errorName = err?.name || '';

      // Handle specific error cases
      if (errorMessage.includes('user rejected') || errorMessage.includes('user denied')) {
        setError('Connection cancelled by user');
        return;
      }

      if (errorMessage.includes('popup') || errorMessage.includes('blocked')) {
        setError('Popup blocked. Please allow popups for this site.');
        return;
      }

      if (errorMessage.includes('already pending') || errorMessage.includes('already processing')) {
        setError('Connection already in progress. Please check your wallet.');
        return;
      }

      // For "Unexpected error" or generic errors, retry a few times
      if (retryCount < 2 && (errorMessage.includes('unexpected') || errorMessage === '' || errorName === 'WalletConnectionError')) {
        console.log('Retrying connection in', (retryCount + 1) * 500, 'ms');
        setTimeout(() => {
          safeConnect(retryCount + 1);
        }, (retryCount + 1) * 500);
        return;
      }

      // Final error message
      if (errorName === 'WalletConnectionError') {
        setError(err?.message || 'Failed to connect. Please try again.');
      } else if (errorMessage.includes('network') || errorMessage.includes('rpc')) {
        setError('Network error. Please check your connection.');
      } else {
        setError('Failed to connect wallet. Please try again.');
      }
    }
  }, [wallet, connect]);

  // Auto-connect when wallet is selected (only if not already trying)
  useEffect(() => {
    if (wallet && !connected && !connecting && visible) {
      // Small delay to ensure wallet adapter is ready
      const timer = setTimeout(() => {
        safeConnect();
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [wallet, connected, connecting, visible, safeConnect]);

  // Only show Phantom and Solflare
  const allowedWallets = wallets.filter(wallet =>
    wallet.adapter.name === 'Phantom' ||
    wallet.adapter.name === 'Solflare'
  );

  const handleWalletClick = async (walletName: WalletName) => {
    try {
      console.log('Selecting wallet:', walletName);
      select(walletName);
      // Connection will be handled by useEffect above
    } catch (error) {
      console.error('Error selecting wallet:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to select wallet';
      alert(errorMessage);
    }
  };

  // Close on escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (visible) {
      window.addEventListener('keydown', handleEscape);
      return () => window.removeEventListener('keydown', handleEscape);
    }
  }, [visible, onClose]);

  if (!visible) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[100]"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md z-[101] px-4">
        <div className="bg-zinc-900 border-4 border-white p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-black text-white uppercase tracking-tight">
              Connect Solana Wallet
            </h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-zinc-800 transition-colors"
            >
              <X className="w-5 h-5 text-white" />
            </button>
          </div>

          {/* Wallet List */}
          <div className="space-y-3">
            {allowedWallets.map((wallet) => {
              const isInstalled = wallet.readyState === 'Installed';
              const isLoadable = wallet.readyState === 'Loadable';

              return (
                <button
                  key={wallet.adapter.name}
                  onClick={() => handleWalletClick(wallet.adapter.name)}
                  disabled={!isInstalled && !isLoadable || connecting}
                  className="w-full flex items-center gap-4 p-4 bg-black border-2 border-white hover:bg-white hover:text-black transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-black disabled:hover:text-white group"
                >
                  <img
                    src={wallet.adapter.icon}
                    alt={wallet.adapter.name}
                    className="w-10 h-10"
                  />
                  <div className="flex-1 text-left">
                    <div className="font-bold text-sm tracking-wider">
                      {wallet.adapter.name}
                    </div>
                    <div className="text-xs opacity-60">
                      {connecting ? 'Connecting...' :
                        isInstalled ? 'Detected - Click to connect' :
                          isLoadable ? 'Click to install' :
                            'Not installed'}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Error Message */}
          {error && (
            <div className="mt-4 p-3 bg-red-500/20 border border-red-500/50 text-red-400 text-sm">
              {error}
            </div>
          )}

          {allowedWallets.length === 0 && (
            <div className="text-center py-8 text-zinc-400">
              <p className="mb-4">No Solana wallets detected</p>
              <p className="text-sm">Please install Phantom or Solflare wallet extension</p>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
