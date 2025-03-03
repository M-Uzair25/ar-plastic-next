import mongoose from 'mongoose';
import Counter from './Counter.js'; // Import the Counter model

const saleSchema = new mongoose.Schema({
  billNo: {
    type: Number,
    unique: true,
  },
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

// Pre-save middleware to auto-increment billNo
saleSchema.pre('save', async function (next) {
  if (!this.billNo) {
    try {
      const counter = await Counter.findOneAndUpdate(
        { model: 'Sale' }, // Find counter document for the "Sale" model
        { $inc: { count: 1 } }, // Increment the counter
        { new: true, upsert: true } // Create if not exists
      );
      this.billNo = counter.count; // Assign incremented billNo
    } catch (error) {
      return next(error);
    }
  }
  next();
});

export default mongoose.models.Sale || mongoose.model('Sale', saleSchema);
