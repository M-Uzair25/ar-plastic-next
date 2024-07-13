import { connectToDB } from '@/dbConfig/dbConfig';
import Sale from '@/models/Sale';
import Item from '@/models/Item';

// Function to escape special characters in the search query
const escapeRegExp = (string) => {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
};

export async function POST(request) {
    try {
        await connectToDB();

        const saleData = await request.json();
        // Check if the cart is empty
        if (!saleData.cartItems || saleData.cartItems.length === 0) {
            throw new Error('Cart is empty. Please add items to the cart before submitting.');
        }
        const newSale = new Sale(saleData);
        const result = await newSale.save();

        // Update item quantities
        const updatePromises = saleData.cartItems.map(async (item) => {
            // Ensure bagQuantity and kgQuantity are numbers
            let bagQty = parseInt(item.bagQuantity, 10);
            let kgQty = parseInt(item.kgQuantity, 10);

            // Fetch the item from the database
            const dbItem = await Item.findOne({ category: item.category, description: item.description });

            if (dbItem) {
                let newBagStock = dbItem.bagQuantity;
                let newKgStock = dbItem.kgQuantity;

                // If kg stock is insufficient, adjust bag stock
                while (kgQty > newKgStock && newBagStock > 0) {
                    newBagStock -= 1;
                    newKgStock += 25;
                }

                // Now decrease the kg stock by the kgQty
                newKgStock -= kgQty;

                // Decrease the bag stock by the bagQty
                newBagStock -= bagQty;

                if (newKgStock < 0 || newBagStock < 0) {
                    throw new Error(`Insufficient quantity for item: ${item.description}. Available: ${dbItem.bagQuantity} bag, ${dbItem.kgQuantity} kg, Requested: ${bagQty} bag, ${kgQty} kg`);
                }
                // Update the item quantities in the database
                await Item.updateOne(
                    { _id: dbItem._id },
                    {
                        $set: {
                            bagQuantity: newBagStock,
                            kgQuantity: newKgStock
                        }
                    }
                );
            }
        });

        await Promise.all(updatePromises);

        return Response.json({ message: 'Sale submitted successfully', data: result }, { status: 201 });
    } catch (error) {
        console.error('Error submitting sale:', error);
        return Response.json({ message: error.message }, { status: 500 });
    }
}

export async function GET(request) {
    await connectToDB();

    try {
        const searchParams = request.nextUrl.searchParams;
        const page = parseInt(searchParams.get('page')) || 1;
        const limit = parseInt(searchParams.get('limit')) || 10;
        const searchQuery = searchParams.get('search') || '';

        const escapedSearchQuery = escapeRegExp(searchQuery);

        const query = {
            $or: [
                { customerName: { $regex: escapedSearchQuery, $options: 'i' } },
                { note: { $regex: escapedSearchQuery, $options: 'i' } },
                { 'cartItems.category': { $regex: escapedSearchQuery, $options: 'i' } },
                { 'cartItems.description': { $regex: escapedSearchQuery, $options: 'i' } },
            ]
        };

        // Add numeric search for the total field if the search query is numeric
        if (!isNaN(searchQuery)) {
            query.$or.push({
                $expr: {
                    $regexMatch: {
                        input: { $toString: "$total" },
                        regex: escapedSearchQuery,
                        options: 'i'
                    }
                }
            });
        }

        const skip = (page - 1) * limit;
        const sales = await Sale.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit);
        const totalSales = await Sale.countDocuments(query);

        return Response.json(
            { sales },
            { totalPages: Math.ceil(totalSales / limit) },
            { currentPage: page },
            { status: 200 });
    } catch (error) {
        console.error(error);
        return Response.json({ error: 'Error fetching sales' }, { status: 500 });
    }
}

export async function DELETE(request) {

    const searchParams = request.nextUrl.searchParams
    const saleId = searchParams.get('id')

    await connectToDB();

    try {
        const sale = await Sale.findById(saleId);
        if (!sale) {
            return new Response(JSON.stringify({ error: 'Sale not found' }), { status: 404 });
        }

        const updatePromises = sale.cartItems.map(async (item) => {
            let bagQty = parseInt(item.bagQuantity, 10);
            let kgQty = parseInt(item.kgQuantity, 10);

            const dbItem = await Item.findOne({ category: item.category, description: item.description });

            if (dbItem) {
                let newBagStock = dbItem.bagQuantity + bagQty;
                let newKgStock = dbItem.kgQuantity + kgQty;

                await Item.updateOne(
                    { _id: dbItem._id },
                    {
                        $set: {
                            bagQuantity: newBagStock,
                            kgQuantity: newKgStock
                        }
                    }
                );
            }
        });

        await Promise.all(updatePromises);

        const deletedSale = await Sale.findByIdAndDelete(saleId);

        if (!deletedSale) {
            return Response.json({ error: 'Sale not found' }, { status: 404 });
        }

        return Response.json(deletedSale, { status: 201 });
    } catch (error) {
        console.error('Error deleting sale:', error);
        return Response.json({ message: error.message }, { status: 500 });
    }
}