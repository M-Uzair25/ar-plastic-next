import { connectToDB } from '@/dbConfig/dbConfig';
import Item from '@/models/Item';
import Ledger from '@/models/Ledger';
import Account from '@/models/Account';

// Helper function to format quantities
const formatQuantity = (bagQuantity, kgQuantity) => {
    if (bagQuantity > 0 && kgQuantity > 0) {
        return `${bagQuantity} Bag, ${kgQuantity} Kg`;
    } else if (bagQuantity > 0) {
        return `${bagQuantity} Bag`;
    } else if (kgQuantity > 0) {
        return `${kgQuantity} Kg`;
    } else {
        return '';
    }
};

export async function POST(request) {
    await connectToDB();

    try {
        const { accountName, remarks, category, description, bagQuantity, kgQuantity, poundRate, bagRate, perKgRate, total } = await request.json();

        // Validate the input
        if (!accountName || !category || !description || (!bagQuantity && !kgQuantity) || !total) {
            return Response.json({ message: 'Missing required fields' }, { status: 400 });
        }

        // Update the item's stock (no transaction)
        const dbItem = await Item.findOne({ category, description });

        if (!dbItem) {
            return Response.json({ message: "Item not found." }, { status: 404 });
        }

        let bagQty = parseInt(bagQuantity, 10) || 0;
        let kgQty = parseFloat(kgQuantity) || 0;

        // if kgQty = x.000, then convert it to x
        if (kgQty % 1 === 0) {
            kgQty = parseInt(kgQuantity, 10);
        }

        // Update the stock
        const newBagStock = dbItem.bagQuantity + bagQty;
        const newKgStock = dbItem.kgQuantity + kgQty;

        // Update the item with the restored quantities
        await Item.updateOne(
            { _id: dbItem._id },
            {
                $set: {
                    bagQuantity: newBagStock,
                    kgQuantity: newKgStock,
                },
            }
        );

        const dbAccount = await Account.findOne({ accountName: accountName });
        if (!dbAccount) {
            throw new Error('Account not found.');
        }

        let currentBalance = dbAccount.balance; // Start with the current balance

        let ledgerDescription;
        if (remarks) {
            ledgerDescription = `[${formatQuantity(bagQty, kgQty)}] ${category} ${description} @ ${bagRate} (${remarks})`;
        }
        else {
            ledgerDescription = `[${formatQuantity(bagQty, kgQty)}] ${category} ${description} @ ${bagRate}`;
        }

        // Prepare ledger entry data
        let debit = 0;
        let credit = 0;

        if (dbAccount.accountType === 'cash' || dbAccount.accountType === 'myAccount' || dbAccount.accountType === 'supplier') {
            // For cash or My Account, create a debit entry to reverse the sale (since cash was credit)
            debit = total;
        } else {
            // For credit customers, create a credit entry to reverse the sale
            credit = total;
        }
        currentBalance -= total;

        // Create the reversal ledger entry
        const newLedgerEntry = new Ledger({
            name: accountName,
            description: `SALE RETURNED: ${ledgerDescription}`,
            debit: debit,
            credit: credit,
            balance: currentBalance,
        });

        // Save the new ledger entry in the database
        await newLedgerEntry.save();

        // Update the account balance in the database after processing all items
        await Account.updateOne(
            { _id: dbAccount._id },
            {
                $set: {
                    balance: currentBalance,  // Set the final updated balance
                }
            }
        );

        return Response.json({ message: 'Sale returned and stock updated successfully' }, { status: 201 });
    } catch (error) {
        console.error('Error returning sale:', error);
        return Response.json({ message: error.message }, { status: 500 });
    }
}