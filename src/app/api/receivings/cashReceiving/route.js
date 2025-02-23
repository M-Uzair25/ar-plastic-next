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
        // Check if selected account is Cash
        if (account === 'Cash') {
            return Response.json({ message: 'Customer name cannot be "Cash". Kindly select another customer!' }, { status: 400 });
        }

        // Find the account to update its balance
        const dbAccount = await Account.findOne({ accountName: account });
        const cashAccount = await Account.findOne({ accountName: 'Cash' });

        if (!dbAccount || !cashAccount) {
            return Response.json({ message: 'Account not found' }, { status: 404 });
        }

        let debit = 0;
        let credit = 0;
        let ledgerDescription = "Cash Received";

        if (dbAccount.accountType === 'myAccount') {
            debit = amount;
            if (!description) {
                ledgerDescription = "Cash Withdrawl";
            }
        } else {
            credit = amount
        }
        if (dbAccount.accountType === 'supplier') {
            dbAccount.balance += amount; // Credit increases supplier balance
        } else {
            dbAccount.balance -= amount;  // Credit decreases balance
        }

        // Create a new ledger entry
        const newLedgerEntry = new Ledger({
            name: account,
            description: description ? description : ledgerDescription,
            debit,
            credit,
            balance: dbAccount.balance  // Updated balance after this transaction
        });

        await newLedgerEntry.save();

        cashAccount.balance += amount;  // Credit increases cash
        // Create Cash Ledger entry
        const cashLedger = new Ledger({
            name: 'Cash',
            description: `Cash Received By (${account})`,
            debit: 0,
            credit: amount,
            balance: cashAccount.balance,
        });
        await cashLedger.save();

        // Update the Account and Cash balance in the database
        await Account.updateOne({ _id: dbAccount._id }, { balance: dbAccount.balance });
        await Account.updateOne({ _id: cashAccount._id }, { balance: cashAccount.balance });

        return Response.json({ message: 'Cash Received Successfully', newLedgerEntry, cashLedger }, { status: 201 });
    } catch (error) {
        console.error('Error submitting cash receiving:', error);
        return Response.json({ message: 'Error submitting cash receiving', error: error.message }, { status: 500 });
    }
}
