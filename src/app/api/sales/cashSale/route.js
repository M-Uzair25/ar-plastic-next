import { connectToDB } from '@/dbConfig/dbConfig';
import Sale from '@/models/Sale';
import SaleItem from '@/models/SaleItem';
import Item from '@/models/Item';
import Ledger from '@/models/Ledger';
import Account from '@/models/Account';

// Helper function to format quantities
const formatQuantity = (bagQuantity, kgQuantity) => {

    if (kgQuantity % 1 === 0) {
        kgQuantity = parseInt(kgQuantity, 10);
    }

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

        if ((saleData.customerName === 'CASH' || saleData.customerName === 'cash') && (parseInt(saleData.cashReceived) + parseInt(saleData.accountAmount) < (parseInt(saleData.total) - parseInt(saleData.discount) + parseInt(saleData.freightCharges)))) {
            throw new Error('Cash received is less than the total amount. Please select an account to transfer the remaining amount');
        }

        // Check if the cart is empty
        if (!saleData.cartItems || saleData.cartItems.length === 0) {
            throw new Error('Cart is empty. Please add items to the cart before submitting.');
        }

        // Fetch the customer ledger account
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
                    newRemarks = `${saleData.remarks}, (TRANSFERRED TO ${saleData.selectedAccount}: ${saleData.accountAmount})`;
                else
                    newRemarks = `TRANSFERRED TO ${saleData.selectedAccount}: ${saleData.accountAmount}`;
            }
            else if (saleData.selectedAccount && !saleData.remarks) {
                newRemarks = `ACCOUNT TRANSFER: ${saleData.accountAmount}`;
            }
        }

        // Save Sale data
        const newSale = new Sale({
            customerName: saleData.customerName,
            remarks: newRemarks,
            total: saleData.total,
            cashReceived: saleData.cashReceived,
        });
        const savedSale = await newSale.save();

        // Prepare ledger entry data
        let ledgerDescription = '';
        let debit = 0;
        let credit = 0;

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

            if (dbAccount.accountType === 'cash' || dbAccount.accountType === 'myAccount') {
                // For cash or My Account, credit increases balance (credit transaction)
                credit = saleData.cashReceived;
            } else {
                // For debit customers, debit increases balance (debit transaction)
                debit = saleData.cashReceived;
            }
        });

        // Wait for all sale items to be processed
        await Promise.all(saleItemPromises);

        ledgerDescription = saleData.cartItems.map(item => {
            return `[${formatQuantity(item.bagQuantity, item.kgQuantity)}] ${item.category} ${item.description} @ ${item.bagRate}`;
        }).join(', ');

        ledgerDescription = `${ledgerDescription}, TOTAL = ${saleData.total} Rs`;

        if (saleData.remarks) {
            ledgerDescription = `${ledgerDescription}, REMARKS: ${saleData.remarks}`;
        }

        // Adjust cash ledger in case of discount
        if (saleData.discount && dbAccount.accountType === 'cash') {
            ledgerDescription = `${ledgerDescription}, DISCOUNT: ${saleData.discount} Rs`;
        }

        // Adjust cash ledger in case less cash is received and amount is transferred to another account
        if (saleData.cashReceived < saleData.total && dbAccount.accountType === 'cash' && saleData.selectedAccount && saleData.accountAmount) {
            ledgerDescription = `${ledgerDescription}, TRANSFERRED TO ${saleData.selectedAccount}: ${saleData.accountAmount} Rs`;
        }

        if (dbAccount.accountType === 'supplier') {
            currentBalance -= parseInt(saleData.cashReceived);
        }
        else {
            currentBalance += parseInt(saleData.cashReceived);
        }

        // Create a Ledger entry for sale
        const newLedgerEntry = new Ledger({
            name: saleData.customerName,
            description: ledgerDescription,
            debit: debit,
            credit: credit,
            balance: currentBalance,
        });

        // Save the Ledger entry
        await newLedgerEntry.save();

        // Update the account balance after all sale items are processed
        await Account.updateOne({ _id: dbAccount._id }, { balance: currentBalance });

        return Response.json({ message: 'Sale and ledger entries created successfully', sale: savedSale }, { status: 201 });
    } catch (error) {
        console.error('Error submitting sale:', error);
        return Response.json({ message: error.message }, { status: 500 });
    }
}
