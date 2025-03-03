import mongoose from 'mongoose';

const counterSchema = new mongoose.Schema({
  model: { type: String, required: true, unique: true }, // Model name (e.g., 'Sale')
  count: { type: Number, default: 1 }, // Counter value
}, { timestamps: true });

export default mongoose.models.Counter || mongoose.model('Counter', counterSchema);
