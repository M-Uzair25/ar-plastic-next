import { connectToDB } from '@/dbConfig/dbConfig';
import Purchase from '@/models/Purchase';
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
            kgQuantity: parseFloat(kgQuantity).toFixed(3) || 0,
            poundRate: parseFloat(poundRate).toFixed(2) || 0,
            bagRate: parseInt(bagRate) || 0,
            perKgRate: parseFloat(perKgRate).toFixed(2) || 0,
            total: parseInt(total),
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
        currentBalance += total;

        // Create a new ledger entry with the received data
        const newLedgerEntry = new Ledger({
            name: supplierName,
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

export async function GET(request) {
    await connectToDB();

    // Parse the URL to extract the date query parameter
    const searchParams = request.nextUrl.searchParams;
    const selectedDate = searchParams.get('selectedDate');

    const supplierName = searchParams.get('supplierName');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    try {
        let query = {};

        // Add supplierName filter
        if (supplierName) {
            query.supplierName = supplierName;
        }

        if (selectedDate) {
            query.createdAt = {
                $gte: new Date(selectedDate),
                $lt: new Date(new Date(selectedDate).setDate(new Date(selectedDate).getDate() + 1))
            };
        }
        else if (startDate && endDate) {
            query.createdAt = {
                $gte: new Date(startDate),
                $lt: new Date(new Date(endDate).setDate(new Date(endDate).getDate() + 1)) // Include entire day
            };
        } else if (startDate) {
            const today = new Date().toISOString().split('T')[0];
            query.createdAt = {
                $gte: new Date(startDate),
                $lt: new Date(new Date(today).setDate(new Date(today).getDate() + 1))
            };
        }

        const purchases = await Purchase.find(query);

        return Response.json(purchases, { status: 200 });
    } catch (error) {
        console.error('Error fetching purchases:', error);
        return Response.json({ message: 'Error fetching purchases' }, { status: 500 });
    }
}
