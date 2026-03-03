import mongoose from 'mongoose';
import MESSAGES from '../Utils/messages.js';

const CategorySchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, MESSAGES.MODELS.CATEGORY.NAME_REQUIRED]
    },
    // Hangi şirkete ait olduğunu bağlamak için
    companyId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Company',
        required: true
    }
}, {
    timestamps: true
});

export default mongoose.model('Category', CategorySchema);
