import mongoose from 'mongoose';
import MESSAGES from '../Utils/messages.js';

const CompanySchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, MESSAGES.MODELS.COMPANY.NAME_REQUIRED],
    unique: true
  },
  address: {
    type: String,
    required: [true, MESSAGES.MODELS.COMPANY.ADDRESS_REQUIRED]
  },
  taxNumber: {
    type: String,
    required: [true, MESSAGES.MODELS.COMPANY.TAX_NUMBER_REQUIRED],
    unique: true
  },
  phone: {
    type: String,
    required: [true, MESSAGES.MODELS.COMPANY.PHONE_REQUIRED]
  },
  email: {
    type: String,
    required: [true, MESSAGES.MODELS.COMPANY.EMAIL_REQUIRED],
    unique: true,
    lowercase: true
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

export default mongoose.model('Company', CompanySchema);