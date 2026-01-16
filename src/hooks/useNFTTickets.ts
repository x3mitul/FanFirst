import { useState, useEffect, useCallback } from 'react';
import { useAccount, useReadContract } from 'wagmi';
import { TICKET_NFT_ABI } from '@/lib/ticket-nft-abi';
import { getContractAddress } from '@/lib/contract-config';
import { useChainId } from 'wagmi';

export interface NFTTicket {
    tokenId: string;
    owner: string;
    eventId: string;
    contractAddress: string;
    chainId: number;
}

export function useNFTTickets() {
    const { address, isConnected } = useAccount();
    const chainId = useChainId();
    const [tickets, setTickets] = useState<NFTTicket[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const contractAddress = getContractAddress(chainId);

    // Get user's balance (number of tickets they own)
    const { data: balance, isLoading: isLoadingBalance } = useReadContract({
        address: contractAddress as `0x${string}`,
        abi: TICKET_NFT_ABI,
        functionName: 'balanceOf',
        args: address ? [address] : undefined,
        query: {
            enabled: !!address && !!contractAddress && contractAddress !== '0x0000000000000000000000000000000000000000',
        },
    });

    const fetchTickets = useCallback(async () => {
        if (!address || !contractAddress || contractAddress === '0x0000000000000000000000000000000000000000') {
            setTickets([]);
            return;
        }

        setIsLoading(true);
        setError(null);

        try {
            const ticketCount = Number(balance || 0);

            if (ticketCount === 0) {
                setTickets([]);
                setIsLoading(false);
                return;
            }

            // In a real implementation:
            // 1. Query Transfer events from the contract to find which tokens the user owns
            // 2. Or implement a tokenOfOwnerByIndex function in the contract

            // For now, we'll create mock tickets based on balance but with real metadata if possible
            const userTickets: NFTTicket[] = Array.from({ length: ticketCount }, (_, i) => ({
                tokenId: `${i + 1}`,
                owner: address,
                eventId: 'event-1', // In a real app, this would be fetched from contract or indexing service
                contractAddress: contractAddress,
                chainId: chainId,
            }));

            setTickets(userTickets);
        } catch (err) {
            console.error('Error fetching tickets:', err);
            const errorMessage = err instanceof Error ? err.message : 'Failed to fetch tickets';
            setError(errorMessage);
            setTickets([]);
        } finally {
            setIsLoading(false);
        }
    }, [address, contractAddress, balance, chainId]);

    useEffect(() => {
        if (isConnected && balance !== undefined) {
            fetchTickets();
        }
    }, [isConnected, balance, fetchTickets]);

    return {
        tickets,
        isLoading: isLoading || isLoadingBalance,
        error,
        refetch: fetchTickets,
        hasTickets: tickets.length > 0,
    };
}
