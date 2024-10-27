import { connectToDB } from '@/dbConfig/dbConfig';
import Sale from '@/models/Sale';
import SaleItem from '@/models/SaleItem';
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
    try {
        await connectToDB();

        const saleData = await request.json();

        // Check if the cart is empty
        if (!saleData.cartItems || saleData.cartItems.length === 0) {
            throw new Error('Cart is empty. Please add items to the cart before submitting.');
        }

        // Fetch the customer (party) account
        const dbAccount = await Account.findOne({ accountName: saleData.customerName });
        if (!dbAccount) {
            throw new Error('Account not found for the specified customer.');
        }

        let currentBalance = dbAccount.balance; // Start with the current balance

        let newRemarks = saleData.remarks;
        if (saleData.selectedAccount) {
            const otherAccount = await Account.findOne({ accountName: saleData.selectedAccount });
            if (otherAccount.accountType === 'myAccount') {
                if (saleData.remarks)
                    newRemarks = `${saleData.remarks}, (Transferred to ${saleData.selectedAccount}: ${saleData.accountAmount})`;
                else
                    newRemarks = `Transferred to ${saleData.selectedAccount}: ${saleData.accountAmount}`;
            }
            else if (saleData.selectedAccount && !saleData.remarks) {
                newRemarks = `Account Transfer: ${saleData.accountAmount}`;
            }
        }

        // Save Sale data
        const newSale = new Sale({
            customerName: saleData.customerName,
            remarks: newRemarks,
            total: saleData.total,
            cashPaid: saleData.cashPaid,
        });
        const savedSale = await newSale.save();

        // Process all cart items and save them as SaleItem documents
        const saleItemPromises = saleData.cartItems.map(async (item) => {
            // Update item stock in the database
            const dbItem = await Item.findOne({ category: item.category, description: item.description });
            if (!dbItem) {
                throw new Error(`Item ${item.description} not found in the database.`);
            }

            let bagQty = parseInt(item.bagQuantity, 10) || 0;
            let kgQty = parseFloat(item.kgQuantity).toFixed(3) || 0;

            // Adjust bag and kg stocks
            let newBagStock = dbItem.bagQuantity;
            let newKgStock = dbItem.kgQuantity;

            // If kg stock is insufficient, adjust bag stock
            while (kgQty > newKgStock && newBagStock > 0) {
                newBagStock -= 1;
                newKgStock += 25;
            }

            // Now decrease the kg stock by the kgQty
            newKgStock -= kgQty;

            // Decrease the bag stock by the bagQty
            newBagStock -= bagQty;

            if (newKgStock < 0 || newBagStock < 0) {
                throw new Error(`Insufficient quantity for item: ${item.description}. Available: ${dbItem.bagQuantity} bag, ${dbItem.kgQuantity} kg, Requested: ${bagQty} bag, ${kgQty} kg`);
            }

            // Update the item quantities in the database
            await Item.updateOne({ _id: dbItem._id }, { bagQuantity: newBagStock, kgQuantity: newKgStock });

            // Create a SaleItem entry
            const newSaleItem = new SaleItem({
                saleId: savedSale._id,
                itemId: dbItem._id,
                category: item.category,
                description: item.description,
                bagQuantity: item.bagQuantity,
                kgQuantity: item.kgQuantity,
                bagRate: item.bagRate,
                perKgRate: item.perKgRate,
                subTotal: item.subTotal,
            });

            const savedSaleItem = await newSaleItem.save();

            // Update the sale's cartItems array with SaleItem references
            await Sale.updateOne({ _id: savedSale._id }, { $push: { cartItems: savedSaleItem._id } });

            // Prepare ledger entry data
            let debit = 0;
            let credit = 0;

            if (dbAccount.accountType === 'cash' || dbAccount.accountType === 'myAccount') {
                // For cash or My Account, credit increases balance (credit transaction)
                credit = item.subTotal;
            } else {
                // For debit customers, debit increases balance (debit transaction)
                debit = item.subTotal;
            }
            currentBalance += item.subTotal;

            let ledgerDescription = `[${formatQuantity(item.bagQuantity, item.kgQuantity)}] ${item.category} ${item.description} @ ${item.bagRate}`;

            if (saleData.remarks) {
                ledgerDescription = `[${formatQuantity(item.bagQuantity, item.kgQuantity)}] ${item.category} ${item.description} @ ${item.bagRate}, Remarks: ${saleData.remarks}`;
            }

            // Create a Ledger entry for each sale item
            const newLedgerEntry = new Ledger({
                party: saleData.customerName,
                description: ledgerDescription,
                debit: debit,
                credit: credit,
                balance: currentBalance,
            });

            // Save the Ledger entry
            await newLedgerEntry.save();
        });

        // Wait for all sale items to be processed
        await Promise.all(saleItemPromises);

        // Adjust cash ledger in case less cash is paid
        if (saleData.cashPaid != saleData.total && dbAccount.accountType === 'cash') {
            const debit = saleData.total - saleData.cashPaid;
            currentBalance -= debit;

            const newLedgerEntry = new Ledger({
                party: saleData.customerName,
                description: `Sale Total: ${saleData.total} Rs, Transferred to ${saleData.selectedAccount}: ${saleData.accountAmount}`,
                debit: debit,
                credit: 0,
                balance: currentBalance,  // Incrementally updated balance
            });

            // Save the Ledger entry
            await newLedgerEntry.save();
        }

        // Update the account balance after all sale items are processed
        await Account.updateOne({ _id: dbAccount._id }, { balance: currentBalance });

        return Response.json({ message: 'Sale and ledger entries created successfully', sale: savedSale }, { status: 201 });
    } catch (error) {
        console.error('Error submitting sale:', error);
        return Response.json({ message: error.message }, { status: 500 });
    }
}

export async function GET(request) {
    await connectToDB();

    const searchParams = request.nextUrl.searchParams;
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const searchQuery = searchParams.get('search');

    const customerName = searchParams.get('customerName');
    const category = searchParams.get('category');
    const description = searchParams.get('description');

    try {
        let query = {};

        // Add customerName filter
        if (customerName) {
            query.customerName = customerName;
        }

        // Date range filter
        if (startDate && endDate) {
            query.createdAt = {
                $gte: new Date(startDate),
                $lt: new Date(new Date(endDate).setDate(new Date(endDate).getDate() + 1)) // Include entire day
            };
        } else if (startDate) {
            query.createdAt = {
                $gte: new Date(startDate),
                $lt: new Date(new Date(startDate).setDate(new Date(startDate).getDate() + 1))
            };
        } else {
            // Default to today's sales if no date range is provided
            const today = new Date().toISOString().split('T')[0];
            query.createdAt = {
                $gte: new Date(today),
                $lt: new Date(new Date(today).setDate(new Date(today).getDate() + 1))
            };
        }

        // General search filter
        if (searchQuery) {
            const regexQuery = new RegExp(searchQuery, 'i');
            query.$or = [
                { customerName: regexQuery },
                { remarks: regexQuery }
            ];
        }

        // Find sales matching the criteria and populate cartItems
        const sales = await Sale.find(query)
            .populate({
                path: 'cartItems',
                match: {
                    ...(category && { category: category }),
                    ...(description && { description: description })
                }
            })
            .sort({ createdAt: -1 });

        // Filter out sales with no matching cartItems
        const filteredSales = sales.filter(sale => sale.cartItems.length > 0);

        return Response.json({ sales: filteredSales }, { status: 200 });
    } catch (error) {
        console.error(error);
        return Response.json({ error: 'Error fetching sales' }, { status: 500 });
    }
}

export async function DELETE(request) {
    const searchParams = request.nextUrl.searchParams;
    const saleId = searchParams.get('id');

    await connectToDB();

    try {
        // Find the sale by its ID and populate the related cartItems
        const sale = await Sale.findById(saleId).populate('cartItems');
        if (!sale) {
            return Response.json({ error: 'Sale not found' }, { status: 404 });
        }

        // Find the customer's account based on customerName from the sale
        const dbAccount = await Account.findOne({ accountName: sale.customerName });
        if (!dbAccount) {
            return Response.json({ error: 'Customer account not found' }, { status: 404 });
        }

        let currentBalance = dbAccount.balance;

        // Step 1: Update stock for each sale item
        const updatePromises = sale.cartItems.map(async (saleItem) => {
            const dbItem = await Item.findById(saleItem.itemId);  // Fetch the item by its ID
            if (dbItem) {
                let newBagStock = dbItem.bagQuantity + parseInt(saleItem.bagQuantity, 10);
                let newKgStock = dbItem.kgQuantity + saleItem.kgQuantity;

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
            }
        });

        // Wait for all stock updates to complete
        await Promise.all(updatePromises);

        // Step 2: Create a reversal ledger entry
        let debit = 0;
        let credit = 0;

        if (dbAccount.accountType === 'cash' || dbAccount.accountType === 'myAccount') {
            // For cash or My Account, create a debit entry to reverse the sale (since cash was credit)
            debit = sale.total;
        } else {
            // For credit customers, create a credit entry to reverse the sale
            credit = sale.total;
        }
        currentBalance -= sale.total;

        // Format the sale data into a single string
        let formattedSaleData = sale.cartItems.map(item => {
            return `[${formatQuantity(item.bagQuantity, item.kgQuantity)}] ${item.category} ${item.description} @ ${item.bagRate}`;
        }).join(', ');

        // Create the reversal ledger entry
        const newLedgerEntry = new Ledger({
            party: sale.customerName,
            description: `Sale Deleted: ${formattedSaleData}`,
            debit: debit,
            credit: credit,
            balance: currentBalance,
        });

        // Save the ledger entry
        await newLedgerEntry.save();

        // Step 3: Update the customer's account balance
        await Account.updateOne({ _id: dbAccount._id }, { balance: currentBalance });

        // Step 4: Delete the sale and its related sale items
        const deleteSaleItemsPromises = sale.cartItems.map(async (saleItem) => {
            await SaleItem.findByIdAndDelete(saleItem._id);
        });

        await Promise.all(deleteSaleItemsPromises);

        const deletedSale = await Sale.findByIdAndDelete(saleId);
        if (!deletedSale) {
            return Response.json({ error: 'Sale not found' }, { status: 404 });
        }

        return Response.json({ message: 'Sale and related items deleted successfully, ledger updated', deletedSale }, { status: 201 });
    } catch (error) {
        console.error('Error deleting sale:', error);
        return Response.json({ message: error.message }, { status: 500 });
    }
}
