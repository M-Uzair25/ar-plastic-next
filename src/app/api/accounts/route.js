import { connectToDB } from "@/dbConfig/dbConfig";
import Account from '@/models/Account';

// Create Account
export async function POST(request) {
    try {
        await connectToDB();

        const { accountName, accountNo, address, balance, accountType } = await request.json();

        // Validate required fields
        if (!accountName || !accountNo || !accountType) {
            return Response.json({ message: 'Missing required fields' }, { status: 400 });
        }

        // Check if account already exists
        const existingAccount = await Account.findOne({ accountName });
        if (existingAccount) {
            return Response.json({ message: 'Account already exists' }, { status: 401 });
        }

        // Create new account
        const newAccount = new Account({
            accountName,
            accountNo,
            address: address || '', // Optional fields
            balance: balance || 0,  // Default balance to 0
            accountType,
        });

        await newAccount.save();

        return Response.json({ message: 'Account created successfully', account: newAccount }, { status: 201 });
    } catch (error) {
        console.error(error);
        return Response.json({ message: 'Error creating account' }, { status: 500 });
    }
}

// Get Accounts
export async function GET(request) {
    try {
        await connectToDB();

        const searchParams = request.nextUrl.searchParams;
        const accountName = searchParams.get("accountName");

        if (accountName) {
            // Fetch specific account by name
            const accountData = await Account.findOne({ accountName });
            return Response.json(accountData);
        } else if (searchParams.get('accountType')) {
            // Fetch accounts by multiple types
            const accountTypes = searchParams.get("accountType").split(",");
            const accountData = await Account.find({ accountType: { $in: accountTypes } });
            return Response.json(accountData);
        } else {
            // Fetch all accounts
            const accounts = await Account.find();
            return Response.json(accounts);
        }
    } catch (error) {
        console.error("Error fetching accounts:", error.message);
        return Response.json({ message: "Error fetching accounts" }, { status: 500 });
    }
}
