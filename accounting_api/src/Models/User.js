import mongoose from 'mongoose';
import MESSAGES from '../Utils/messages.js';

const UserSchema = new mongoose.Schema({
  fullname: {
    type: String,
    required: [true, MESSAGES.MODELS.USER.FULLNAME_REQUIRED]
  },
  email: {
    type: String,
    required: [true, MESSAGES.MODELS.USER.EMAIL_REQUIRED],
    unique: true, // Aynı e-posta ile ikinci kayıt yapılamaz
    lowercase: true // E-postaları hep küçük harf kaydeder
  },
  password: {
    type: String,
    required: [true, MESSAGES.MODELS.USER.PASSWORD_REQUIRED],
    minlength: 6 // Güvenlik için minimum şifre uzunluğu
  },
  role: {                       //type
    type: String,
    enum: ['ADMİN', 'MANAGER', 'USER'],
    default: 'USER', // Rol belirtilmezse varsayılan olarak Staff atanır
    required: true,
  },
  isActive: {
    type: Boolean,
    default: true // Kullanıcının aktif/pasif durumu
  },
  // Çalışanın hangi departmanda olduğunu belirtmek için
  department: {
    type: String,
    enum: ['Satis', 'Pazarlama', 'Insan Kaynaklari', 'IT', 'Yonetim', 'Diger'],
    default: 'Diger'
  },
  // Hangi şirkete bağlı olduğunu tutmak için (Multi-tenant yapı)
  companyId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Company'
  }
}, {
  timestamps: true // createdAt ve updatedAt alanlarını otomatik ekler
});



// İmage   phone number 

export default mongoose.model('User', UserSchema);