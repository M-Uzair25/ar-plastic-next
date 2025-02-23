import mongoose from 'mongoose';

const LedgerSchema = new mongoose.Schema({
    name: { type: String, required: true },
    description: { type: String, required: true },
    debit: { type: Number, default: 0 },
    credit: { type: Number, default: 0 },
    balance: { type: Number, required: true }
}, { timestamps: true });

export default mongoose.models.Ledger || mongoose.model('Ledger', LedgerSchema);
