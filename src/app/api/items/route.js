import { connectToDB } from "@/dbConfig/dbConfig";
import Item from '@/models/Item';
import { NextRequest, NextResponse } from "next/server";

export async function POST(req = NextRequest) {
  await connectToDB();

  try {
    const { itemCategory, itemSubcategory, color, number, bagQuantity, kgQuantity } = await req.json();
    // Validate input data (optional, but recommended)

    const newItem = new Item({
      itemCategory,
      itemSubcategory,
      color,
      number,
      bagQuantity,
      kgQuantity,
    });

    await newItem.save();

    return NextResponse.json({ message: 'Item created successfully', item: newItem },{status: 201});
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: 'Error creating item' },{status: 500});
  }
}
// GET request to fetch rates
export async function GET(req = NextRequest) {
  await connectToDB();

  try {
    const rates = await Item.find(); // Retrieve all items
    return NextResponse.json(rates);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Error fetching rates' }, { status: 500 });
  }
}
