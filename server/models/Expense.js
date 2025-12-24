const mongoose = require('mongoose');

const ExpenseSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    amount: {
        type: Number,
        required: true,
    },
    category: {
        type: String,
        required: true,
    },
    date: {
        type: Date,
        default: Date.now,
    },
    paymentMethod: {
        type: String,
        enum: ['Cash', 'Card', 'UPI', 'Wallet', 'Bank', 'Other'],
        default: 'Cash',
    },
    type: {
        type: String,
        enum: ['expense', 'income'], // Strictly allow these values
        default: 'expense',
    },
    note: {
        type: String,
    },
    isSynced: {
        type: Boolean,
        default: true,
    },
});

module.exports = mongoose.model('Expense', ExpenseSchema);
