import { connectToDB } from "@/dbConfig/dbConfig";
import Account from "@/models/Account";
import Ledger from '@/models/Ledger';

export async function POST(request) {
    try {
        await connectToDB();

        const { account, supplierName, description, amount } = await request.json();

        // Check if all required fields are provided
        if (!account || !supplierName || !account || !amount) {
            return Response.json({ message: 'All fields are required' }, { status: 400 });
        }

        if (account === supplierName) {
            return Response.json({ message: 'Supplier and Account cannot be same' }, { status: 400 });
        }

        // Find both supplier and account to update their balance
        const otherAccount = await Account.findOne({ accountName: account });
        const supplierAccount = await Account.findOne({ accountName: supplierName });

        if (!otherAccount || !supplierAccount) {
            return Response.json({ message: 'Account(s) not found' }, { status: 404 });
        }

        // Initialize debit/credit values
        let supplierDebit = 0;
        let supplierCredit = 0;
        let otherDebit = 0;
        let otherCredit = 0;

        otherDebit = amount;
        otherAccount.balance -= amount;  // Debit decreases balance

        if (supplierAccount.accountType === 'supplier') {
            supplierDebit = amount;
        } else {
            supplierCredit = amount;
        }
        supplierAccount.balance += amount;  // Debit decreases balance

        let accountDescription = '';
        if (!description) {
            if (otherAccount.accountType === 'myAccount')
                accountDescription = `Transfered to (${supplierName})`;
            else
                accountDescription = "Account Transfer";
        }
        else
            accountDescription = description;

        // Create ledger entry for other account (like myAccount or another account)
        const accountLedger = new Ledger({
            party: account,
            description: accountDescription,
            debit: otherDebit,
            credit: otherCredit,
            balance: otherAccount.balance,
        });
        await accountLedger.save();

        // Create ledger entry for supplier
        const supplierLedger = new Ledger({
            party: supplierName,
            description: `${description} By (${account})`,
            debit: supplierDebit,
            credit: supplierCredit,
            balance: supplierAccount.balance,
        });
        await supplierLedger.save();

        // Update both account balances
        await Account.updateOne({ _id: supplierAccount._id }, { balance: supplierAccount.balance });
        await Account.updateOne({ _id: otherAccount._id }, { balance: otherAccount.balance });

        return Response.json({ message: 'Receiving processed successfully', supplierLedger, accountLedger }, { status: 201 });
    } catch (error) {
        console.error('Error processing receiving:', error);
        return Response.json({ message: 'Error processing receiving', error: error.message }, { status: 500 });
    }
}
