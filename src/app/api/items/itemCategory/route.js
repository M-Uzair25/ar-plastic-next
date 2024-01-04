import { connectToDB } from "@/dbConfig/dbConfig";
import Item from '@/models/Item';
import { NextResponse } from "next/server";

export async function GET() {
    try {
        await connectToDB();

        const categories = await Item.find().select('category');

        return NextResponse.json(categories);
    } catch (error) {
        console.error('Error fetching item categories:', error.message);
        return NextResponse.json({ message: 'Error fetching item categories' }, { status: 500 });
    }
}