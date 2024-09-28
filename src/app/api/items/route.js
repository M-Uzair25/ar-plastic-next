import { connectToDB } from "@/dbConfig/dbConfig";
import Item from '@/models/Item';

// Create Item
export async function POST(request) {
  await connectToDB();

  try {
    const { category, description, bagQuantity, kgQuantity, sellRate, stockLimit } = await request.json();
    // Validate input data (optional, but recommended)

    const newItem = new Item({
      category,
      description,
      bagQuantity,
      kgQuantity,
      sellRate,
      stockLimit
    });

    await newItem.save();

    return Response.json({ message: 'Item created successfully', item: newItem }, { status: 201 });
  } catch (error) {
    console.error(error);
    return Response.json({ message: 'Error creating item' }, { status: 500 });
  }
}
// GET request to fetch rates
export async function GET(request) {
  try {
    await connectToDB();

    const searchParams = request.nextUrl.searchParams;
    const category = searchParams.get('category');
    const description = searchParams.get('description');

    // Validate parameters
    if (!category || !description) {
      return Response.json({ message: 'Category and description are required' }, { status: 400 });
    }

    // Find the item based on category and description
    const item = await Item.findOne({ category, description });

    if (!item) {
      return Response.json({ message: 'Item not found' }, { status: 404 });
    }

    return Response.json({ rate: item.sellRate, bag: item.bagQuantity, kg: item.kgQuantity });
  } catch (error) {
    console.error('Error fetching item rate:', error.message);
    return Response.json({ message: 'Error fetching item rate' }, { status: 500 });
  }
}
// PUT request to update an item's rate
export async function PUT(request) {
  await connectToDB();

  try {
    const { itemId, sellRate } = await request.json();

    // Validate input data (optional, but recommended)

    // Find the item by ID
    const existingItem = await Item.findById(itemId);

    if (!existingItem) {
      return Response.json({ message: 'Item not found' }, { status: 404 });
    }

    // Update the sellRate
    existingItem.sellRate = sellRate;

    // Save the updated item
    await existingItem.save();

    return Response.json({ message: 'Item updated successfully', item: existingItem });
  } catch (error) {
    console.error(error);
    return Response.json({ message: 'Error updating item' }, { status: 500 });
  }
}