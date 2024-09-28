import { connectToDB } from "@/dbConfig/dbConfig";
import Item from '@/models/Item';
import { NextRequest, NextResponse } from "next/server";

export async function GET(req = NextRequest) {
    try {
        await connectToDB();

        const searchParams = req.nextUrl.searchParams;
        const category = searchParams.get('category');
        const description = searchParams.get('description');

        // Conditionally build the query based on category and description
        const query = {};
        if (category) query.category = category;
        if (description) query.description = description;

        const stock = await Item.find(query);
        return NextResponse.json(stock);
    } catch (error) {
        console.error('Error fetching item stock:', error.message);
        return NextResponse.json({ message: 'Error fetching item stock' }, { status: 500 });
    }
}
