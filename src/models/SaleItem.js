import mongoose from 'mongoose';

const saleItemSchema = new mongoose.Schema({
    saleId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Sale',
        required: true,
    },
    itemId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Item',
        required: true,
    },
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
    bagRate: {
        type: Number,
        required: true,
        min: 0,
    },
    perKgRate: {
        type: Number,
        required: true,
        min: 0,
    },
    subTotal: {
        type: Number,
        required: true,
        min: 0,
    }
}, { timestamps: true });

// Create an index on saleId and itemId for performance
saleItemSchema.index({ saleId: 1, itemId: 1 });

export default mongoose.models.SaleItem || mongoose.model('SaleItem', saleItemSchema);