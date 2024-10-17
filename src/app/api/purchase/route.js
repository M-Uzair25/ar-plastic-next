import { connectToDB } from '@/dbConfig/dbConfig';
import Purchase from '@/models/Purchase';
import Item from '@/models/Item';
import Ledger from '@/models/Ledger';
import Account from '@/models/Account';

// Helper function to format quantities
const formatQuantity = (bagQuantity, kgQuantity) => {
    if (bagQuantity && kgQuantity) {
        return `${bagQuantity} Bag, ${kgQuantity} Kg`;
    } else if (bagQuantity) {
        return `${bagQuantity} Bag`;
    } else if (kgQuantity) {
        return `${kgQuantity} Kg`;
    } else {
        return '';
    }
};

export async function POST(request) {
    await connectToDB();

    try {
        const { supplierName, remarks, category, description, bagQuantity, kgQuantity, poundRate, bagRate, perKgRate, total } = await request.json();

        // Validate the input
        if (!supplierName || !category || !description || (!bagQuantity && !kgQuantity) || !total) {
            return Response.json({ message: 'Missing required fields' }, { status: 400 });
        }

        // Create new purchase
        const newPurchase = new Purchase({
            supplierName,
            remarks,
            category,
            description,
            bagQuantity: parseInt(bagQuantity, 10) || 0, // Ensures number with base 10
            kgQuantity: parseFloat(kgQuantity) || 0,
            poundRate: parseFloat(poundRate) || 0,
            bagRate: parseFloat(bagRate) || 0,
            perKgRate: parseFloat(perKgRate) || 0,
            total: parseFloat(total).toFixed(2),
        });

        await newPurchase.save();

        // Update the item's stock (no transaction)
        const item = await Item.findOne({ category, description });

        if (!item) {
            return Response.json({ message: `Item ${description} not found in category ${category}` }, { status: 404 });
        }

        // Update the stock
        item.bagQuantity += newPurchase.bagQuantity;
        item.kgQuantity += newPurchase.kgQuantity;
        item.purchasedRate = newPurchase.bagRate;
        await item.save();

        const dbAccount = await Account.findOne({ accountName: supplierName });
        if (!dbAccount) {
            throw new Error('Account not found for the specified customer.');
        }

        let currentBalance = dbAccount.balance; // Start with the current balance

        let ledgerDescription;
        if (remarks) {
            ledgerDescription = `[${formatQuantity(bagQuantity, kgQuantity)}] ${category} ${description} @ ${poundRate} (${remarks})`;
        }
        else
            ledgerDescription = `[${formatQuantity(bagQuantity, kgQuantity)}] ${category} ${description} @ ${poundRate}`;

        // Prepare ledger entry data
        let debit = 0;
        let credit = 0;

        credit = total;
        currentBalance -= total;

        // Create a new ledger entry with the received data
        const newLedgerEntry = new Ledger({
            party: supplierName,
            description: ledgerDescription,
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

        return Response.json({ message: 'Purchase created and stock updated successfully' }, { status: 201 });
    } catch (error) {
        console.error('Error saving purchase:', error);
        return Response.json({ message: error.message }, { status: 500 });
    }
}
