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
  cashReceived: {
    type: Number,
    required: true,
  },
  returned: {
    type: Boolean,
    default: false,
  },
}, { timestamps: true });

export default mongoose.models.Sale || mongoose.model('Sale', saleSchema);
