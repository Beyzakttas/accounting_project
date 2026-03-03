import mongoose from 'mongoose';

const InvoiceSchema = new mongoose.Schema({
  companyId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Company',
    required: true
  },
  uploadedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  amount: {
    type: Number,
    required: true
  },
  taxAmount: {
    type: Number,
    default: 0
  },
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category'
  },
  paymentType: {
    type: String
  },
  vendor: {
    type: String
  },
  status: {
    type: String,
    enum: ['Pending', 'Processed', 'Rejected'],
    default: 'Pending'
  },
  imageUrl: {
    type: String // Fişin / Faturanın fotoğrafı
  },
  n8nSource: {
    type: Boolean,
    default: false // Faturanın n8n mail webhook'undan gelip gelmediğini tutar
  }
}, {
  timestamps: true
});

export default mongoose.model('Invoice', InvoiceSchema);