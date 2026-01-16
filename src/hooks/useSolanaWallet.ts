'use client';

import { useWallet } from '@solana/wallet-adapter-react';
import { useEffect, useState } from 'react';
import { getBalance, formatSolanaAddress } from '@/lib/solana-utils';

export function useSolanaWallet() {
  const { publicKey, connected, connecting, disconnect, select, wallet } = useWallet();
  const [balance, setBalance] = useState<number>(0);
  const [loading, setLoading] = useState(false);

  // Fetch balance when connected
  useEffect(() => {
    async function fetchBalance() {
      if (publicKey) {
        setLoading(true);
        const bal = await getBalance(publicKey.toString());
        setBalance(bal);
        setLoading(false);
      } else {
        setBalance(0);
      }
    }

    fetchBalance();
  }, [publicKey]);

  const address = publicKey?.toString();
  const shortAddress = address ? formatSolanaAddress(address) : undefined;

  return {
    address,
    shortAddress,
    balance,
    connected,
    connecting,
    loading,
    disconnect,
    select,
    wallet,
  };
}
