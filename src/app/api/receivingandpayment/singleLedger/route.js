import { connectToDB } from '@/dbConfig/dbConfig';
import Ledger from '@/models/Ledger';
import Account from '@/models/Account';

export async function POST(request) {
    try {
        await connectToDB();

        const { account, description, amount, paymentType } = await request.json();

        // Check if all required fields are provided
        if (!account || !description || !amount || !paymentType) {
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

        // Update the balance based on payment type
        if (paymentType === 'Debit') {
            debit = amount;
            currentBalance -= amount;  // Deduct amount for debit
        } else if (paymentType === 'Credit') {
            credit = amount;
            currentBalance += amount;  // Add amount for credit
        }

        // Update the account balance in the database
        await Account.updateOne({ _id: dbAccount._id }, { balance: currentBalance });

        // Create a new ledger entry
        const newLedgerEntry = new Ledger({
            party: account,
            description,
            debit,
            credit,
            balance: currentBalance  // Updated balance after this transaction
        });

        const savedLedgerEntry = await newLedgerEntry.save();

        return Response.json({ message: 'Payment submitted successfully', ledger: savedLedgerEntry }, { status: 201 });
    } catch (error) {
        console.error('Error submitting payment:', error);
        return Response.json({ message: 'Error submitting payment', error: error.message }, { status: 500 });
    }
}
