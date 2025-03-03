import { connectToDB } from '@/dbConfig/dbConfig';
import Counter from '@/models/Counter';

// Get Bill No
export async function GET() {
    try {
        await connectToDB();

        // Sort by last updated first
        const billCounter = await Counter.findOne({ model: 'Sale' }, { count: 1 });
        const billNo = billCounter.count;
        return Response.json(billNo);
    } catch (error) {
        console.error('Error fetching Bill No:', error.message);
        return Response.json({ message: 'Error fetching Bill No' }, { status: 500 });
    }
}