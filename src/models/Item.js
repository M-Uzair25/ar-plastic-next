import mongoose from 'mongoose';

const itemSchema = new mongoose.Schema({
  category: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true
  },
  bagQuantity: {
    type: Number,
    default: 0,
  },
  kgQuantity: {
    type: Number,
    default: 0,
  },
  purchasedRate: {
    type: Number,
    default: 0,
  },
  sellRate: {
    type: Number,
    default: 0,
  },
},
  { timestamps: true }
);

export default mongoose.models.Item || mongoose.model('Item', itemSchema);
