const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth'); // Middleware to verify token
const Expense = require('../models/Expense');

// @route   GET /api/expenses
// @desc    Get all expenses for logged in user
// @access  Private
router.get('/', auth, async (req, res) => {
    try {
        // Sort by date descending (newest first)
        const expenses = await Expense.find({ userId: req.user.id }).sort({ date: -1 });
        res.json(expenses);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   POST /api/expenses
// @desc    Add new expense
// @access  Private
router.post('/', auth, async (req, res) => {
    console.log('POST /api/expenses body:', req.body);
    const { amount, category, date, paymentMethod, note, type } = req.body;

    try {
        const newExpense = new Expense({
            userId: req.user.id,
            amount,
            category,
            date,
            paymentMethod,
            note,
            type,
        });

        const expense = await newExpense.save();
        res.json(expense);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   DELETE /api/expenses/:id
// @desc    Delete expense
// @access  Private
router.delete('/:id', auth, async (req, res) => {
    try {
        let expense = await Expense.findById(req.params.id);

        if (!expense) return res.status(404).json({ msg: 'Expense not found' });

        // Make sure user owns expense
        if (expense.userId.toString() !== req.user.id) {
            return res.status(401).json({ msg: 'Not authorized' });
        }

        await Expense.findByIdAndDelete(req.params.id);

        res.json({ msg: 'Expense removed' });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   PUT /api/expenses/:id
// @desc    Update existing expense
// @access  Private
router.put('/:id', auth, async (req, res) => {
    const { amount, category, date, paymentMethod, note, type } = req.body;

    // Build expense object
    const expenseFields = {};
    if (amount) expenseFields.amount = amount;
    if (category) expenseFields.category = category;
    if (date) expenseFields.date = date;
    if (paymentMethod) expenseFields.paymentMethod = paymentMethod;
    if (note) expenseFields.note = note;
    if (type) expenseFields.type = type;

    try {
        let expense = await Expense.findById(req.params.id);

        if (!expense) return res.status(404).json({ msg: 'Expense not found' });

        // Make sure user owns expense
        if (expense.userId.toString() !== req.user.id) {
            return res.status(401).json({ msg: 'Not authorized' });
        }

        expense = await Expense.findByIdAndUpdate(
            req.params.id,
            { $set: expenseFields },
            { new: true }
        );

        res.json(expense);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

module.exports = router;
