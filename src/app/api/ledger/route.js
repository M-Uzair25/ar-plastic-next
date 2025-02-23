import { connectToDB } from '@/dbConfig/dbConfig';
import Ledger from '@/models/Ledger';
import Account from '@/models/Account';

// Create Ledger Entry for SaleItem
export async function POST(request) {
  try {
    await connectToDB(); // Connect to the database

    const { name, description, debit, credit, balance } = await request.json(); // Get input data from request

    // Validate input fields
    if (!name || !description || balance === undefined) {
      return Response.json({ message: "Name, description, and balance are required" }, { status: 400 });
    }

    const dbAccount = await Account.findOne({ accountName: name });
    if (!dbAccount) {
      throw new Error('Account not found for the specified customer.');
    }

    let currentBalance = dbAccount.balance; // Start with the current balance

    if (dbAccount.accountType === 'supplier') {
      currentBalance += debit;
      currentBalance -= credit;
    }
    else if (dbAccount.accountType === 'customer') {
      currentBalance -= debit;
      currentBalance += credit;
    }
    else {
      currentBalance -= debit;
      currentBalance += credit;
    }

    // Create a new ledger entry with the received data
    const newLedgerEntry = new Ledger({
      name,
      description,
      debit: (dbAccount.accountType === 'supplier' || dbAccount.accountType === 'customer') ? credit : debit,  // Make debit = credit for supplier
      credit: (dbAccount.accountType === 'supplier' || dbAccount.accountType === 'customer') ? debit : credit, // Make credit = 0 for supplier
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

    return Response.json({ message: "Ledger entry created successfully", entry: newLedgerEntry }, { status: 201 });
  } catch (error) {
    console.error("Error creating ledger entry:", error);
    return Response.json({ message: "Error creating ledger entry" }, { status: 500 });
  }
}

// Get Ledger Enteries
export async function GET(request) {
  try {
    await connectToDB();

    const searchParams = request.nextUrl.searchParams;
    const name = searchParams.get('name');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    // Validate that ledger name is provided
    if (!name) {
      return Response.json({ message: 'Ledger name is required' }, { status: 400 });
    }

    // Base query for ledger name
    const query = { name };

    // Handle the case when only startDate or endDate is selected
    if (startDate && !endDate) {
      // If only startDate is selected, return entries from startDate to the present
      query.createdAt = {
        $gte: new Date(startDate),
      };
    } else if (!startDate && endDate) {
      // If only endDate is selected, return entries from the first ledger entry to endDate
      // Find the earliest ledger entry
      const firstEntry = await Ledger.findOne({ name }).sort({ createdAt: 1 });
      if (firstEntry) {
        query.createdAt = {
          $gte: firstEntry.createdAt, // Start from the first entry
          $lt: new Date(new Date(endDate).setDate(new Date(endDate).getDate() + 1)), // Include the entire end date
        };
      }
    } else if (startDate && endDate) {
      // If both startDate and endDate are selected, apply both filters
      query.createdAt = {
        $gte: new Date(startDate),
        $lt: new Date(new Date(endDate).setDate(new Date(endDate).getDate() + 1)), // Include the entire end date
      };
    }

    // Fetch ledger entries, sort by creation date
    const ledgerEntries = await Ledger.find(query).sort({ createdAt: 1 });

    // Calculate closing balance
    const closingBalance = ledgerEntries.length > 0 ? ledgerEntries[ledgerEntries.length - 1].balance : 0;

    // Fetch account type
    const account = await Account.findOne({ accountName: name }, { accountType: 1 });
    const accountType = account ? account.accountType : null;

    return Response.json({ ledgerEntries, closingBalance, accountType }, { status: 200 });
  } catch (error) {
    console.error('Error fetching ledger:', error.message);
    return Response.json({ message: 'Error fetching ledger' }, { status: 500 });
  }
}