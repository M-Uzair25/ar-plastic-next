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
        // Check if selected account is Payment
        if (account === 'CASH' || account === 'Cash') {
            return Response.json({ message: 'Ledger name cannot be "Cash". Kindly select another party!' }, { status: 400 });
        }

        // Find the account to update its balance
        const dbAccount = await Account.findOne({ accountName: account });
        const cashAccount = await Account.findOne({ accountName: 'CASH' });

        if (!dbAccount || !cashAccount) {
            return Response.json({ message: 'Account not found' }, { status: 404 });
        }

        let debit = 0;
        let credit = 0;
        let ledgerDescription = "CASH PAID";

        if (dbAccount.accountType === 'myAccount') {
            credit = amount;
            if (!description) {
                ledgerDescription = "CASH DEPOSITED";
            }
        } else {
            debit = amount
        }

        if (dbAccount.accountType === 'supplier') {
            dbAccount.balance -= amount; // Debit decreases supplier balance
        } else {
            dbAccount.balance += amount;  // Debit increases balance
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

        cashAccount.balance -= amount;  // Credit decreases cash
        // Create Cash Ledger entry
        const cashLedger = new Ledger({
            name: 'CASH',
            description: `CASH PAID TO (${account})`,
            debit: amount,
            credit: 0,
            balance: cashAccount.balance,
        });
        await cashLedger.save();

        // Update the Account and Cash balance in the database
        await Account.updateOne({ _id: dbAccount._id }, { balance: dbAccount.balance });
        await Account.updateOne({ _id: cashAccount._id }, { balance: cashAccount.balance });

        return Response.json({ message: 'Cash Paid Successfully', newLedgerEntry, cashLedger }, { status: 201 });
    } catch (error) {
        console.error('Error submitting payment receiving:', error);
        return Response.json({ message: 'Error submitting payment', error: error.message }, { status: 500 });
    }
}
