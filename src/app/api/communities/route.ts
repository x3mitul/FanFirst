import { NextResponse } from "next/server";
import { getCommunities } from "@/lib/data";

export async function GET() {
    try {
        const communities = await getCommunities();
        return NextResponse.json(communities);
    } catch (error) {
        console.error("Error fetching communities:", error);
        return NextResponse.json([], { status: 500 });
    }
}
