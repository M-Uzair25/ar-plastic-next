import { connectToDB } from '@/dbConfig/dbConfig';
import Ledger from '@/models/Ledger';

// Create Ledger Entry
export async function POST(request) {
  try {
    await connectToDB(); // Connect to the database

    const { party, details, debit, credit, balance } = await request.json(); // Get input data from request

    // Validate input fields
    if (!party || !details || balance === undefined) {
      return Response.json({ message: "Party, details, and balance are required" }, { status: 400 });
    }

    // Create a new ledger entry with the received data
    const newLedgerEntry = new Ledger({
      party,
      details,
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

    const searchParams = new URL(request.url).searchParams;
    const party = searchParams.get('party');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    // Validate parameters
    if (!party) {
      return Response.json({ message: 'Party name is required' }, { status: 400 });
    }

    const query = { party };
    if (startDate && endDate) {
      query.createdAt = {
        $gte: new Date(startDate),
        $lt: new Date(new Date(endDate).setDate(new Date(endDate).getDate() + 1)) // Include entire day
      };
    }
    // Fetch ledger entries
    const ledgerEntries = await Ledger.find(query).sort({ date: 1 });

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