import { connectToDB } from "@/dbConfig/dbConfig";
import Item from '@/models/Item';
import { NextRequest, NextResponse } from "next/server";

export async function GET(req = NextRequest) {
  try {
    await connectToDB();

    const searchParams = req.nextUrl.searchParams;
    const category = searchParams.get('category');
    const description = searchParams.get('description');

    // Validate parameters
    if (!category || !description) {
      return NextResponse.json({ message: 'Category and description are required' }, { status: 400 });
    }

    // Find the item based on category and description
    const item = await Item.findOne({ category, description });

    if (!item) {
      return NextResponse.json({ message: 'Item not found' }, { status: 404 });
    }

    return NextResponse.json({ rate: item.sellRate, bag: item.bagQuantity, kg: item.kgQuantity });
  } catch (error) {
    console.error('Error fetching item rate:', error.message);
    return NextResponse.json({ message: 'Error fetching item rate' }, { status: 500 });
  }
}
