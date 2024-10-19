import { connectToDB } from "@/dbConfig/dbConfig";
import Account from "@/models/Account";
import Ledger from '@/models/Ledger';

export async function POST(request) {
    try {
        await connectToDB();

        const { account, description, amount } = await request.json();

        // Check if all required fields are provided
        if (!account || !amount) {
            return Response.json({ message: 'All fields are required' }, { status: 400 });
        }

        // Find the account to update its balance
        const dbAccount = await Account.findOne({ accountName: account });

        if (!dbAccount) {
            return Response.json({ message: 'Account not found' }, { status: 404 });
        }

        let currentBalance = dbAccount.balance;  // Current balance before transaction
        let debit = 0;
        let credit = 0;

        credit = amount;
        if (dbAccount.accountType === 'cash' || dbAccount.accountType === 'myAccount') {
            dbAccount.balance += amount;  // Credit increases balance
        } else {
            dbAccount.balance -= amount;  // Credit decreases balance
        }

        // Update the account balance in the database
        await Account.updateOne({ _id: dbAccount._id }, { balance: currentBalance });

        // Create a new ledger entry
        const newLedgerEntry = new Ledger({
            party: account,
            description: description ? description : 'Cash Received',
            debit,
            credit,
            balance: dbAccount.balance  // Updated balance after this transaction
        });

        const savedLedgerEntry = await newLedgerEntry.save();

        return Response.json({ message: 'Payment submitted successfully', ledger: savedLedgerEntry }, { status: 201 });
    } catch (error) {
        console.error('Error submitting payment:', error);
        return Response.json({ message: 'Error submitting payment', error: error.message }, { status: 500 });
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