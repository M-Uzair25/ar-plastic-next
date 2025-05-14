import { connectToDB } from "@/dbConfig/dbConfig";
import Item from '@/models/Item';
import { NextRequest, NextResponse } from "next/server";

export async function GET(req = NextRequest) {
    try {
        await connectToDB();

        const searchParams = req.nextUrl.searchParams;
        const category = searchParams.get('category');
        
        // Conditionally build the query based on whether a category is provided
        const query = category ? { category } : {};

        const descriptions = await Item.find(query).select('description').sort({ description: 1 });
        return NextResponse.json(descriptions);

    } catch (error) {
        console.error('Error fetching item descriptions:', error.message);
        return NextResponse.json({ message: 'Error fetching item descriptions' }, { status: 500 });
    }
}