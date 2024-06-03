import { connectToDB } from '@/dbConfig/dbConfig';
import Sale from '@/models/Sale';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req = NextRequest, res = NextResponse) {
    if (req.method === 'POST') {
        try {
            await connectToDB();

            const saleData = await req.json();
            const newSale = new Sale(saleData);
            const result = await newSale.save();

            return NextResponse.json({ message: 'Sale submitted successfully', data: result }, { status: 201 });
        } catch (error) {
            console.error('Error submitting sale:', error);
            return NextResponse.json({ message: 'Internal Server Error', error: error.message }, { status: 500 });
        }
    } else {
        res.status(405).json({ message: 'Method not allowed' });
    }
};

