import { connectToDB } from '@/dbConfig/dbConfig';
import Purchase from '@/models/Purchase';
import Item from '@/models/Item';

export async function POST(request) {
    await connectToDB();

    try {
        const { supplierName, remarks, dateOfPurchase, category, description, bagQuantity, kgQuantity, poundRate, bagRate, perKgRate, total } = await request.json();

        // Validate the input
        if (!supplierName || !category || !description || (!bagQuantity && !kgQuantity) || !total) {
            return Response.json({ message: 'Missing required fields' }, { status: 400 });
        }

        // Create new purchase
        const newPurchase = new Purchase({
            supplierName,
            remarks,
            dateOfPurchase,
            category,
            description,
            bagQuantity: parseInt(bagQuantity, 10) || 0, // Ensures number with base 10
            kgQuantity: parseInt(kgQuantity, 10) || 0,
            poundRate: parseFloat(poundRate) || 0,
            bagRate: parseFloat(bagRate) || 0,
            perKgRate: parseFloat(perKgRate) || 0,
            total: parseFloat(total),
        });

        await newPurchase.save();

        // Update the item's stock (no transaction)
        const item = await Item.findOne({ category, description });

        if (!item) {
            return Response.json({ message: `Item ${description} not found in category ${category}` }, { status: 404 });
        }

        // Update the stock
        item.bagQuantity += newPurchase.bagQuantity;
        item.kgQuantity += newPurchase.kgQuantity;
        item.purchasedRate += newPurchase.bagRate;
        await item.save();

        return Response.json({ message: 'Purchase created and stock updated successfully' }, { status: 201 });
    } catch (error) {
        console.error('Error saving purchase:', error);
        return Response.json({ message: error.message }, { status: 500 });
    }
}
