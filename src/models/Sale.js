import mongoose from 'mongoose';

const saleSchema = new mongoose.Schema({
  customerName: { type: String, required: true },
  remarks: { type: String },
  cartItems: { type: Array, required: true },
  total: { type: Number, required: true },
  amountPaid: { type: Number, required: true },
}, { timestamps: true });

export default mongoose.models.Sale || mongoose.model('Sale', saleSchema);
