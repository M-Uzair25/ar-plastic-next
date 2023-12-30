import { connectToDB } from "@/dbConfig/dbConfig";
import Account from '@/models/Account';
import { NextRequest, NextResponse } from "next/server";

export async function POST(req = NextRequest) {
    await connectToDB();

    try {
        const { accountName, accountNo, address, openingBalance, acctype } = await req.json();
        // Add validation rules based on your requirements

        // Check if the accountName already exists
        const existingAccount = await Account.findOne({ accountName });

        if (existingAccount) {
            return NextResponse.json({ message: 'Account already exists' }, { status: 400 });
        }

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
export async function GET() {
    try {
        await connectToDB();

        const accounts = await Account.find().select('accountName');

        return NextResponse.json(accounts);
    } catch (error) {
        console.error('Error fetching accounts:', error.message);
        return NextResponse.json({ message: 'Error fetching accounts' }, { status: 500 });
    }
}
