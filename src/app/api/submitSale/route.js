import { connectToDB } from '@/dbConfig/dbConfig';
import Sale from '@/models/Sale';
import Item from '@/models/Item';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req = NextRequest, res = NextResponse) {
    if (req.method === 'POST') {
        try {
            await connectToDB();

            const saleData = await req.json();
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

            return NextResponse.json({ message: 'Sale submitted successfully', data: result }, { status: 201 });
        } catch (error) {
            console.error('Error submitting sale:', error);
            return NextResponse.json({ message: error.message }, { status: 500 });
        }
    } else {
        res.status(405).json({ message: 'Method not allowed' });
    }
};

