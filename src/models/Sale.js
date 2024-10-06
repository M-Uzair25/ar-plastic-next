import mongoose from 'mongoose';

const saleSchema = new mongoose.Schema({
  customerName: {
    type: String,
    required: true,
  },
  remarks: {
    type: String,
  },
  cartItems: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'SaleItem',
    required: true,
  }],
  total: {
    type: Number,
    required: true,
  },
  cashPaid: {
    type: Number,
    required: true,
  },
}, { timestamps: true });

export default mongoose.models.Sale || mongoose.model('Sale', saleSchema);
