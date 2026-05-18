import mongoose from 'mongoose';
import MESSAGES from '../Utils/messages.js';

const InvoiceSchema = new mongoose.Schema({
  companyId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Company'
  },
  uploadedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, MESSAGES.MODELS.INVOICE.UPLOADED_BY_REQUIRED]
  },
  amount: {
    type: Number,
    required: [true, MESSAGES.MODELS.INVOICE.AMOUNT_REQUIRED]
  },
  invoiceNumber: {
    type: String,
    required: [true, MESSAGES.MODELS.INVOICE.INVOICE_NUMBER_REQUIRED]
  },
  description: {
    type: String,
    required: [true, MESSAGES.MODELS.INVOICE.DESCRIPTION_REQUIRED]
  },
  date: {
    type: Date,
    default: Date.now
  },
  dueDate: {
    type: Date // Son ödeme / vade tarihi
  },
  type: {
    type: String,
    enum: ['INCOME', 'EXPENSE'],
    required: [true, MESSAGES.MODELS.INVOICE.TYPE_REQUIRED]
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
  },
  department: {
    type: String,
    enum: ['Muhasebe', 'Finans', 'IK', 'Satis', 'Pazarlama', 'Yazilim', 'Operasyon', 'Diger'],
    default: 'Diger'
  }
}, {
  timestamps: true
});

// Indexes for performance
InvoiceSchema.index({ companyId: 1 });
InvoiceSchema.index({ createdAt: -1 });
InvoiceSchema.index({ vendor: 'text' }); // Allow text search on vendor names

export default mongoose.model('Invoice', InvoiceSchema);