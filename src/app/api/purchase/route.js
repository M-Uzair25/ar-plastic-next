import { connectToDB } from '@/dbConfig/dbConfig';
import Purchase from '@/models/Purchase';

export async function POST(request) {
    await connectToDB();

    try {
        const { supplierName, remarks, dateOfPurchase, category, description, bagQuantity, kgQuantity, poundRate, bagRate, perKgRate, total } = await request.json();

        const newPurchase = new Purchase({
            supplierName,
            remarks,
            dateOfPurchase,
            category,
            description,
            bagQuantity,
            kgQuantity,
            poundRate,
            bagRate,
            perKgRate,
            total
        });

        await newPurchase.save();
        return Response.json({ message: 'Purchase created successfully' }, { status: 201 });
    } catch (error) {
        console.error('Error saving purchase:', error);
        return Response.json({ message: error.message }, { status: 500 });
    }
}
