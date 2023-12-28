import { connectToDB } from "@/dbConfig/dbConfig";
import Account from '@/models/Account'; // Assuming a Mongoose model for accounts
import { NextRequest, NextResponse } from "next/server";

export async function POST(req = NextRequest, res = NextResponse) {

    await connectToDB();
    try {

        // Validate input data (crucial for security and data integrity)
        const { accountName, accountNo, address, openingBalance, acctype } = await req.json();
        // Add validation rules based on your requirements

        const newAccount = new Account({
            accountName,
            accountNo,
            address,
            openingBalance,
            acctype,
        });

        await newAccount.save();

        return NextResponse.json({ message: 'Account created successfully', account: newAccount }, { status: 201 });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ message: 'Error creating account' }, { status: 500 });
    }
}
