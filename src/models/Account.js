import mongoose from 'mongoose';

const accountSchema = new mongoose.Schema({
  accountName: { type: String, required: true, unique: true },
  accountNo: { type: String, required: true},
  address: { type: String, required: true },
  balance: { type: Number, default: 0 },
  accountType: { type: String, enum: ['cash','customer', 'supplier', 'myAccount'], required: true },
},
  { timestamps: true });

export default mongoose.models.Account || mongoose.model('Account', accountSchema);
