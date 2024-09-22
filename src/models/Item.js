import mongoose from 'mongoose';

const itemSchema = new mongoose.Schema({
  category: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  bagQuantity: {
    type: Number,
    default: 0,
    min: 0,
  },
  kgQuantity: {
    type: Number,
    default: 0,
    min: 0,
  },
  purchasedRate: {
    type: Number,
    default: 0,
    min: 0,
  },
  sellRate: {
    type: Number,
    default: 0,
    min: 0,
  },
  stockLimit: {
    type: Number,
    default: 0,
    min: 0,
  },
}, { timestamps: true });

// Create an index on category and description for faster queries
itemSchema.index({ category: 1, description: 1 }, { unique: true });

export default mongoose.models.Item || mongoose.model('Item', itemSchema);
