import mongoose from 'mongoose';

const bookingSchema = new mongoose.Schema({
    supplierName: { type: String, required: true },
    remarks: { type: String },
    category: { type: String, required: true },
    description: { type: String, required: true },
    bagQuantity: { type: Number, default: 0, min: 0 },
    kgQuantity: { type: Number, default: 0, min: 0 },
    poundRate: { type: Number, default: 0, min: 0 },
    bagRate: { type: Number, default: 0, min: 0 },
    perKgRate: { type: Number, default: 0, min: 0 },
    total: { type: Number, required: true }
}, { timestamps: true });

export default mongoose.models.Booking || mongoose.model('Booking', bookingSchema);
