import { connectToDB } from "@/dbConfig/dbConfig";
import Account from "@/models/Account";
import Ledger from '@/models/Ledger';

export async function POST(request) {
    try {
        await connectToDB();

        const { customerName, account, description, amount, } = await request.json();

        // Check if all required fields are provided
        if (!customerName || !account || !account || !amount) {
            return Response.json({ message: 'All fields are required' }, { status: 400 });
        }

        if (customerName === account) {
            return Response.json({ message: 'Customer and Account cannot be same' }, { status: 400 });
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

        customerCredit = amount;
        customerAccount.balance -= amount;  // Credit decreases balance

        if (otherAccount.accountType === 'supplier') {
            otherDebit = amount;
            otherAccount.balance -= amount;  // Debit decreases balance
        } else {
            otherCredit = amount;
            otherAccount.balance += amount;  // Credit increases balance
        }

        let customerDescription = '';
        if (!description) {
            if (otherAccount.accountType === 'myAccount')
                customerDescription = `Transfered to (${account})`;
            else
                customerDescription = "Account Transfer";
        }
        else
            customerDescription = description;

        // Create ledger entry for customer
        const customerLedger = new Ledger({
            party: customerName,
            description: customerDescription,
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

        return Response.json({ message: 'Receiving processed successfully', customerLedger, accountLedger }, { status: 201 });
    } catch (error) {
        console.error('Error processing receiving:', error);
        return Response.json({ message: 'Error processing receiving', error: error.message }, { status: 500 });
    }
}
