import { connectToDB } from '@/dbConfig/dbConfig';
import Sale from '@/models/Sale';
import Item from '@/models/Item';

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

    const searchParams = request.nextUrl.searchParams;
    const fromDate = searchParams.get('fromDate');
    const toDate = searchParams.get('toDate');
    const searchQuery = searchParams.get('search');

    try {
        let query = {};

        // Date range filter
        if (fromDate && toDate) {
            query.createdAt = {
                $gte: new Date(fromDate),
                $lt: new Date(new Date(toDate).setDate(new Date(toDate).getDate() + 1)) // Include entire day
            };
        } else if (fromDate) {
            query.createdAt = {
                $gte: new Date(fromDate),
                $lt: new Date(new Date(fromDate).setDate(new Date(fromDate).getDate() + 1))
            };
        } else {
            // Default to today's sales if no date range is provided
            const today = new Date().toISOString().split('T')[0];
            query.createdAt = {
                $gte: new Date(today),
                $lt: new Date(new Date(today).setDate(new Date(today).getDate() + 1))
            };
        }

        // General search filter
        if (searchQuery) {
            const regexQuery = new RegExp(searchQuery, 'i');
            query.$or = [
                { customerName: regexQuery },
                { note: regexQuery },
                { 'cartItems.category': regexQuery },
                { 'cartItems.description': regexQuery }
            ];

            // Add numeric search for the total and quantity field if the search query is numeric
            if (!isNaN(searchQuery)) {
                query.$or.push(
                    { total: Number(searchQuery) },
                    { 'cartItems.bagQuantity': Number(searchQuery) },  // Match bagQuantity
                    { 'cartItems.kgQuantity': Number(searchQuery) }   // Match kgQuantity
                );
            }
        }

        const sales = await Sale.find(query).sort({ createdAt: -1 });
        return Response.json({ sales }, { status: 200 });
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