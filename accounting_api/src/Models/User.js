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
    minlength: [8, MESSAGES.MODELS.USER.PASSWORD_LENGTH], // Güvenlik için minimum 8 karakter
    validate: {
      validator: function (v) {
        // En az bir büyük harf, bir küçük harf, bir rakam ve bir özel karakter (+8 minimum check regex üzerinde de var ama minlength ile sağlandı)
        return /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/.test(v);
      },
      message: MESSAGES.MODELS.USER.PASSWORD_COMPLEXITY
    },
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
UserSchema.pre('save', function (next) {
  // Sadece şifre alanı değiştirildiyse (veya yeniyse) hashleme yap
  if (!this.isModified('password')) {
    return next();
  }

  bcrypt.genSalt(10, (err, salt) => {
    if (err) return next(err);

    bcrypt.hash(this.password, salt, (err, hash) => {
      if (err) return next(err);
      this.password = hash;
      next();
    });
  });
});

// Kullanıcının girdiği şifre ile veritabanındaki hashlenmiş şifreyi karşılaştırma metodu
UserSchema.methods.comparePassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

export default mongoose.model('User', UserSchema);
