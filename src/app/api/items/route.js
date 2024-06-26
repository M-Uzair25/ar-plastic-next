import { connectToDB } from "@/dbConfig/dbConfig";
import Item from '@/models/Item';
import { NextRequest, NextResponse } from "next/server";

export async function POST(req = NextRequest) {
  await connectToDB();

  try {
    const { category, description, bagQuantity, kgQuantity, sellRate } = await req.json();
    // Validate input data (optional, but recommended)

    const newItem = new Item({
      category,
      description,
      bagQuantity,
      kgQuantity,
      sellRate,
    });

    await newItem.save();

    return NextResponse.json({ message: 'Item created successfully', item: newItem }, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: 'Error creating item' }, { status: 500 });
  }
}
// GET request to fetch rates
export async function GET() {
  await connectToDB();

  try {
    const rates = await Item.find(); // Retrieve all items
    return NextResponse.json(rates);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Error fetching rates' }, { status: 500 });
  }
}
// PUT request to update an item's rate
export async function PUT(req = NextRequest) {
  await connectToDB();

  try {
    const { itemId, sellRate } = await req.json();

    // Validate input data (optional, but recommended)

    // Find the item by ID
    const existingItem = await Item.findById(itemId);

    if (!existingItem) {
      return NextResponse.json({ message: 'Item not found' }, { status: 404 });
    }

    // Update the sellRate
    existingItem.sellRate = sellRate;

    // Save the updated item
    await existingItem.save();

    return NextResponse.json({ message: 'Item updated successfully', item: existingItem });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: 'Error updating item' }, { status: 500 });
  }
}