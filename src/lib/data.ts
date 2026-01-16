"use server";

import { prisma } from "./prisma";

/**
 * Get all events with their ticket tiers
 */
export async function getEvents() {
    return prisma.event.findMany({
        include: { ticketTiers: true },
        orderBy: { date: "asc" },
    });
}

/**
 * Get a single event by ID with ticket tiers
 */
export async function getEventById(id: string) {
    return prisma.event.findUnique({
        where: { id },
        include: { ticketTiers: true },
    });
}

/**
 * Get all communities
 */
export async function getCommunities() {
    return prisma.community.findMany({
        orderBy: { memberCount: "desc" },
    });
}

/**
 * Get a single community by ID
 */
export async function getCommunityById(id: string) {
    return prisma.community.findUnique({
        where: { id },
    });
}

/**
 * Get posts for a community
 */
export async function getCommunityPosts(communityId: string) {
    return prisma.communityPost.findMany({
        where: { communityId },
        include: { author: true },
        orderBy: { createdAt: "desc" },
        take: 50,
    });
}

/**
 * Get user tickets
 */
export async function getUserTickets(userId: string) {
    return prisma.ticket.findMany({
        where: { ownerId: userId },
        include: {
            event: { include: { ticketTiers: true } },
            tier: true,
        },
        orderBy: { purchaseDate: "desc" },
    });
}
