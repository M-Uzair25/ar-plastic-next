import { connectToDB } from "@/dbConfig/dbConfig";
import Account from '@/models/Account';

export async function POST(request) {
    await connectToDB();

    try {
        const { accountName, accountNo, address, balance, accountType } = await request.json();

        // Check if the accountName already exists
        const existingAccount = await Account.findOne({ accountName });

        if (existingAccount) {
            return Response.json({ message: 'Account already exists' }, { status: 400 });
        }

        const newAccount = new Account({
            accountName,
            accountNo,
            address,
            balance,
            accountType,
        });

        await newAccount.save();

        return Response.json({ message: 'Account created successfully', account: newAccount }, { status: 201 });
    } catch (error) {
        console.error(error);
        return Response.json({ message: 'Error creating account' }, { status: 500 });
    }
}
export async function GET(request) {
    try {
        await connectToDB();

        const searchParams = request.nextUrl.searchParams;
        const accountName = searchParams.get('accountName');

        if (accountName) {
            // Fetch specific account with its type
            const accountType = await Account.find({ accountName }).select('accountType');
            return Response.json(accountType);
        } else {
            // Fetch all account names
            const accounts = await Account.find().select('accountName');
            return Response.json(accounts);
        }
    } catch (error) {
        console.error('Error fetching accounts:', error.message);
        return Response.json({ message: 'Error fetching accounts' }, { status: 500 });
    }
}