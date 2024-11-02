import { connectToDB } from '@/dbConfig/dbConfig';
import Booking from '@/models/Booking';

// Create new booking
export async function POST(request) {
    await connectToDB();

    try {
        const { supplierName, remarks, category, description, bagQuantity, kgQuantity, poundRate, bagRate, perKgRate, total } = await request.json();

        // Validate the input
        if (!supplierName || !category || !description || (!bagQuantity && !kgQuantity) || !total) {
            return Response.json({ message: 'Missing required fields' }, { status: 400 });
        }

        // Create new booking
        const newBooking = new Booking({
            supplierName,
            remarks,
            category,
            description,
            bagQuantity: parseInt(bagQuantity, 10) || 0, // Ensures number with base 10
            kgQuantity: parseFloat(kgQuantity).toFixed(3) || 0,
            poundRate: parseFloat(poundRate).toFixed(2) || 0,
            bagRate: parseInt(bagRate) || 0,
            perKgRate: parseFloat(perKgRate).toFixed(2) || 0,
            total: parseInt(total),
        });

        await newBooking.save();

        return Response.json({ message: 'Booking created successfully' }, { status: 201 });
    } catch (error) {
        console.error('Error saving booking:', error);
        return Response.json({ message: error.message }, { status: 500 });
    }
}

// Get Bookings
export async function GET(request) {
    try {
        await connectToDB();

        // Sort by last updated first
        const bookings = await Booking.find().sort({ updatedAt: -1 });
        return Response.json(bookings);
    } catch (error) {
        console.error('Error fetching bookings:', error.message);
        return Response.json({ message: 'Error fetching bookings' }, { status: 500 });
    }
}
