import mongoose from 'mongoose';

const itemSchema = new mongoose.Schema({
  itemCategory: {
    type: String,
    required: true,
  },
  itemSubcategory: {
    type: String,
    required: true
  },
  color: {
    type: String,
    default: 'Natural',
  },
  number: {
    type: Number,
    default: 1,
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
