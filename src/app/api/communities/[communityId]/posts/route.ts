import { NextResponse } from "next/server";
import { getCommunityPosts } from "@/lib/data";

export async function GET(
    request: Request,
    { params }: { params: Promise<{ communityId: string }> }
) {
    const { communityId } = await params;

    try {
        const posts = await getCommunityPosts(communityId);
        return NextResponse.json(posts);
    } catch (error) {
        console.error("Error fetching community posts:", error);
        return NextResponse.json([], { status: 500 });
    }
}
