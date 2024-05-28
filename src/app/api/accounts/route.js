import { connectToDB } from "@/dbConfig/dbConfig";
import Account from '@/models/Account';
import { NextRequest, NextResponse } from "next/server";

export async function POST(req = NextRequest) {
    await connectToDB();

    try {
        const { accountName, accountNo, address, openingBalance, accountType } = await req.json();

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
            accountType,
        });

        await newAccount.save();

        return NextResponse.json({ message: 'Account created successfully', account: newAccount }, { status: 201 });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ message: 'Error creating account' }, { status: 500 });
    }
}
export async function GET(req = NextRequest) {
    try {
        await connectToDB();

        const searchParams = req.nextUrl.searchParams;
        const accountName = searchParams.get('accountName');
        
        if (accountName) {
            // Fetch specific account with its type
            const accountType = await Account.find({ accountName }).select('accountType');
            return NextResponse.json(accountType);
        } else {
            // Fetch all account names
            const accounts = await Account.find().select('accountName');
            return NextResponse.json(accounts);
        }
    } catch (error) {
        console.error('Error fetching accounts:', error.message);
        return NextResponse.json({ message: 'Error fetching accounts' }, { status: 500 });
    }
}