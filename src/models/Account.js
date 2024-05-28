import mongoose from 'mongoose';

const accountSchema = new mongoose.Schema({
  accountName: { type: String, required: true, unique: true },
  accountNo: { type: String, required: true},
  address: { type: String, required: true },
  openingBalance: { type: Number, default: 0 },
  closingBalance: { type: Number, default: 0 },
  accountType: { type: String, enum: ['cash','credit', 'supplier', 'myAccount'], required: true },
},
  { timestamps: true });

export default mongoose.models.Account || mongoose.model('Account', accountSchema);
