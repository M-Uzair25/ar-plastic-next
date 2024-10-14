import { connectToDB } from '@/dbConfig/dbConfig';
import Ledger from '@/models/Ledger';
import Account from '@/models/Account';

export async function POST(request) {
    try {
        await connectToDB();

        const { customerName, account, description, amount, paymentType1, paymentType2 } = await request.json();

        if (!customerName || !account || !amount || paymentType1 === 'None' || paymentType2 === 'None') {
            return Response.json({ message: 'All fields are required.' }, { status: 400 });
        }

        // Find both customer and account to update their balance
        const customerAccount = await Account.findOne({ accountName: customerName });
        const otherAccount = await Account.findOne({ accountName: account });

        if (!customerAccount || !otherAccount) {
            return Response.json({ message: 'Account(s) not found' }, { status: 404 });
        }

        // Initialize debit/credit values
        let customerDebit = 0;
        let customerCredit = 0;
        let otherDebit = 0;
        let otherCredit = 0;

        // Determine debit/credit logic for customer account
        if (paymentType1 === 'Debit') {
            customerDebit = amount;
            customerAccount.balance -= amount;  // Debit decreases balance
        } else if (paymentType1 === 'Credit') {
            customerCredit = amount;
            customerAccount.balance += amount;  // Credit increases balance
        }

        // Determine debit/credit logic for other account
        if (paymentType2 === 'Debit') {
            otherDebit = amount;
            otherAccount.balance -= amount;
        } else if (paymentType2 === 'Credit') {
            otherCredit = amount;
            otherAccount.balance += amount;
        }

        // Create ledger entry for customer
        const customerLedger = new Ledger({
            party: customerName,
            description: description ? description : "Transaction",
            debit: customerDebit,
            credit: customerCredit,
            balance: customerAccount.balance,
        });
        await customerLedger.save();

        // Create ledger entry for other account (like Cash or another account)
        const accountLedger = new Ledger({
            party: account,
            description: `${description} By (${customerName})`,
            debit: otherDebit,
            credit: otherCredit,
            balance: otherAccount.balance,
        });
        await accountLedger.save();

        // Update both account balances
        await Account.updateOne({ _id: customerAccount._id }, { balance: customerAccount.balance });
        await Account.updateOne({ _id: otherAccount._id }, { balance: otherAccount.balance });

        return Response.json({ message: 'Payment processed successfully', customerLedger, accountLedger }, { status: 201 });
    } catch (error) {
        console.error('Error processing payment:', error);
        return Response.json({ message: 'Error processing payment', error: error.message }, { status: 500 });
    }
}
