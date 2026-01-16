"use client";

import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useAccount } from 'wagmi';
import { useEffect } from 'react';
import { useStore } from '@/lib/store';

export function WalletButton() {
    const { address, isConnected } = useAccount();
    const setWalletAddress = useStore((state) => state.setWalletAddress);

    // Sync wallet connection state with Zustand store
    useEffect(() => {
        if (isConnected && address) {
            setWalletAddress(address);
        } else {
            setWalletAddress(undefined);
        }
    }, [isConnected, address, setWalletAddress]);

    return (
        <ConnectButton 
            showBalance={false}
            chainStatus="icon"
            accountStatus={{
                smallScreen: 'avatar',
                largeScreen: 'full',
            }}
        />
    );
}
