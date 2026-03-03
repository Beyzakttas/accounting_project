import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
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
    minlength: 6, // Güvenlik için minimum şifre uzunluğu
    select: false // Varsayılan olarak şifreyi sorgularda getirme
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

// Kaydetmeden önce şifreyi hashleme işlemi
UserSchema.pre('save', async function (next) {
  // Sadece şifre alanı değiştirildiyse (veya yeniyse) hashleme yap
  if (!this.isModified('password')) {
    return next();
  }

  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Kullanıcının girdiği şifre ile veritabanındaki hashlenmiş şifreyi karşılaştırma metodu
UserSchema.methods.comparePassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

export default mongoose.model('User', UserSchema);
