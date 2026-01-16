import { NextResponse } from "next/server";
import { getEvents } from "@/lib/data";

export async function GET() {
    try {
        const events = await getEvents();
        return NextResponse.json(events);
    } catch (error) {
        console.error("Error fetching events:", error);
        return NextResponse.json([], { status: 500 });
    }
}
