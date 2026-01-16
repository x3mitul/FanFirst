export const DEVELOPMENT_MODE = false;
// Contract addresses for different networks

export const CONTRACT_ADDRESSES = {
    // Polygon Amoy Testnet
    80002: {
        TICKET_NFT: '0xD3Cda08481193B7006343f7c87708CE0D7494730',
    },
    // Polygon Mumbai Testnet (Deprecated, but keeping if needed)
    80001: {
        TICKET_NFT: '0x0000000000000000000000000000000000000000',
    },
    // Polygon Mainnet
    137: {
        TICKET_NFT: '0x0000000000000000000000000000000000000000', // Replace with deployed address
    },
    // Localhost/Hardhat
    31337: {
        TICKET_NFT: '0x0000000000000000000000000000000000000000', // Replace with deployed address
    },
} as const;

/**
 * Get contract address for the current chain
 * @param chainId - The chain ID to get the contract address for
 * @returns The contract address or undefined if not found
 */
export function getContractAddress(chainId: number): string | undefined {
    return CONTRACT_ADDRESSES[chainId as keyof typeof CONTRACT_ADDRESSES]?.TICKET_NFT;
}

/**
 * Check if chain is supported
 * @param chainId - The chain ID to check
 * @returns True if the chain is supported
 */
export function isSupportedChain(chainId: number): boolean {
    return chainId in CONTRACT_ADDRESSES;
}

/**
 * Get all supported chain IDs
 * @returns Array of supported chain IDs
 */
export function getSupportedChainIds(): number[] {
    return Object.keys(CONTRACT_ADDRESSES).map(Number);
}
