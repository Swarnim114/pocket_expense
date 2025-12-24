const mongoose = require('mongoose');

const CategorySchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    name: {
        type: String,
        required: true,
    },
    icon: {
        type: String,
        required: true, // Ionicons name
    },
    color: {
        type: String,
        required: true, // Hex Code
    },
    type: {
        type: String,
        enum: ['expense', 'income'],
        default: 'expense',
    }
});

module.exports = mongoose.model('Category', CategorySchema);
