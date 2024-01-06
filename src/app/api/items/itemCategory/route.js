import { connectToDB } from "@/dbConfig/dbConfig";
import Item from '@/models/Item';
import { NextRequest, NextResponse } from "next/server";

export async function GET(req = NextRequest) {
    try {
        await connectToDB();

        const searchParams = req.nextUrl.searchParams;
        const description = searchParams.get('description');

        // Conditionally build the query based on whether a description is provided
        const query = description ? { description } : {};

        const categories = await Item.find(query).select('category');
        return NextResponse.json(categories);
    } catch (error) {
        console.error('Error fetching item categories:', error.message);
        return NextResponse.json({ message: 'Error fetching item categories' }, { status: 500 });
    }
}