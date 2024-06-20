import mongoose from 'mongoose';

const saleSchema = new mongoose.Schema({
  customerName: { type: String, required: true },
  note: { type: String },
  cartItems: { type: Array, required: true },
  total: { type: Number, required: true },
  status: { type: String, required: true }
},
  { timestamps: true }
);

export default mongoose.models.Sale || mongoose.model('Sale', saleSchema);
