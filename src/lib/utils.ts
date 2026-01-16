import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatPrice(price: number, currency: string = "USD"): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
  }).format(price);
}

export function formatDate(date: Date | string): string {
  const d = new Date(date);
  return d.toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function formatTime(date: Date | string): string {
  const d = new Date(date);
  return d.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}

export function truncateAddress(address: string): string {
  if (!address) return "";
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

export function calculateFandomScore(data: {
  spotifyMinutes?: number;
  eventsAttended?: number;
  accountAge?: number;
  communityVouches?: number;
}): number {
  let score = 0;
  
  // Spotify listening (max 40 points)
  if (data.spotifyMinutes) {
    score += Math.min(40, data.spotifyMinutes / 100);
  }
  
  // Events attended (max 30 points)
  if (data.eventsAttended) {
    score += Math.min(30, data.eventsAttended * 5);
  }
  
  // Account age in months (max 15 points)
  if (data.accountAge) {
    score += Math.min(15, data.accountAge);
  }
  
  // Community vouches (max 15 points)
  if (data.communityVouches) {
    score += Math.min(15, data.communityVouches * 3);
  }
  
  return Math.round(Math.min(100, score));
}

export function getScoreTier(score: number): {
  tier: string;
  color: string;
  benefits: string[];
} {
  if (score >= 80) {
    return {
      tier: "Superfan",
      color: "text-purple-500",
      benefits: ["First access to tickets", "Exclusive merch drops", "Meet & greet priority"],
    };
  } else if (score >= 60) {
    return {
      tier: "Dedicated",
      color: "text-blue-500",
      benefits: ["Early access to tickets", "Special presale codes"],
    };
  } else if (score >= 40) {
    return {
      tier: "Regular",
      color: "text-green-500",
      benefits: ["Standard queue access"],
    };
  } else {
    return {
      tier: "New Fan",
      color: "text-gray-500",
      benefits: ["Standard access", "Build your fandom score!"],
    };
  }
}
