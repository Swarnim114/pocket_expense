const mongoose = require('mongoose');

const BudgetSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    category: {
        type: String,
        default: 'GLOBAL', // 'GLOBAL' for total monthly budget, or specific category name
    },
    limit: {
        type: Number,
        required: true,
    },
    month: {
        type: String, // Format: "YYYY-MM"
        required: true,
    }
});

module.exports = mongoose.model('Budget', BudgetSchema);
