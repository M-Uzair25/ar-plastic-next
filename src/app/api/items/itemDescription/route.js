import { connectToDB } from "@/dbConfig/dbConfig";
import Item from '@/models/Item';
import { NextResponse } from "next/server";

export async function GET() {
    try {
        await connectToDB();
        
        const descriptions = await Item.find().select('description');

        return NextResponse.json(descriptions);
    } catch (error) {
        console.error('Error fetching item descriptions:', error.message);
        return NextResponse.json({ message: 'Error fetching item descriptions' }, { status: 500 });
    }
}