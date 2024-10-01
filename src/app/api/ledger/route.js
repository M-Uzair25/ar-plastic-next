import { connectToDB } from '@/dbConfig/dbConfig';
import Ledger from '@/models/Ledger';

// Create Ledger Entry
export async function POST(request) {
  try {
    await connectToDB(); // Connect to the database

    const { party, description, debit, credit, balance } = await request.json(); // Get input data from request

    // Validate input fields
    if (!party || !description || balance === undefined) {
      return Response.json({ message: "Party, description, and balance are required" }, { status: 400 });
    }

    // Create a new ledger entry with the received data
    const newLedgerEntry = new Ledger({
      party,
      description,
      debit: debit || 0,  // Default to 0 if not provided
      credit: credit || 0, // Default to 0 if not provided
      balance,
    });

    // Save the new ledger entry in the database
    await newLedgerEntry.save();

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
    const party = searchParams.get('party');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    // Validate that party is provided
    if (!party) {
      return Response.json({ message: 'Party name is required' }, { status: 400 });
    }

    // Base query for party
    const query = { party };

    // Handle the case when only startDate or endDate is selected
    if (startDate && !endDate) {
      // If only startDate is selected, return entries from startDate to the present
      query.createdAt = {
        $gte: new Date(startDate),
      };
    } else if (!startDate && endDate) {
      // If only endDate is selected, return entries from the first ledger entry to endDate
      // Find the earliest ledger entry
      const firstEntry = await Ledger.findOne({ party }).sort({ createdAt: 1 });
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

    // Calculate total debit, credit, and closing balance
    const totalDebit = ledgerEntries.reduce((sum, entry) => sum + entry.debit, 0);
    const totalCredit = ledgerEntries.reduce((sum, entry) => sum + entry.credit, 0);
    const closingBalance = ledgerEntries.length > 0 ? ledgerEntries[ledgerEntries.length - 1].balance : 0;

    return Response.json({ ledgerEntries, totalDebit, totalCredit, closingBalance }, { status: 200 });
  } catch (error) {
    console.error('Error fetching ledger:', error.message);
    return Response.json({ message: 'Error fetching ledger' }, { status: 500 });
  }
}