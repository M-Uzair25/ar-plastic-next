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
  // Add any other fields you need for your product data
});

export default mongoose.models.Item || mongoose.model('Item', itemSchema);
