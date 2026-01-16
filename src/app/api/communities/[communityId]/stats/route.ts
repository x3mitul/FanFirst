import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
    request: Request,
    { params }: { params: Promise<{ communityId: string }> }
) {
    const { communityId } = await params;

    try {
        // Get the community with member count
        const community = await prisma.community.findUnique({
            where: { id: communityId },
            select: {
                id: true,
                name: true,
                memberCount: true,
                _count: {
                    select: { members: true }
                }
            }
        });

        if (!community) {
            return NextResponse.json({ error: "Community not found" }, { status: 404 });
        }

        // Return both the stored memberCount and the actual count from CommunityMember table
        return NextResponse.json({
            id: community.id,
            name: community.name,
            memberCount: community._count.members > 0
                ? community._count.members
                : community.memberCount, // Fallback to stored value
        });
    } catch (error) {
        console.error("Error fetching community stats:", error);
        return NextResponse.json({ error: "Failed to fetch stats" }, { status: 500 });
    }
}
