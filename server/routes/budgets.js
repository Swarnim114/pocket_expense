const express = require('express');
const router = express.Router();
const Budget = require('../models/Budget');
const auth = require('../middleware/auth');

// @route   GET api/budgets
// @desc    Get all budgets for user
// @access  Private
router.get('/', auth, async (req, res) => {
    try {
        const budgets = await Budget.find({ userId: req.user.id });
        res.json(budgets);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   POST api/budgets
// @desc    Set or Update budget for a category
// @access  Private
router.post('/', auth, async (req, res) => {
    const { category, limit, month } = req.body;

    try {
        // Build query to find existing budget
        const query = {
            userId: req.user.id,
            category: category
        };

        // Optional: specific month logic (if not provided, applies generally or to current month)
        // For simplicity v1: We assume these are "Monthly" defaults repeated every month
        // unless a month string is explicitly validated. 
        // We'll trust the frontend to send the "current month" string if needed.
        if (month) query.month = month;

        // Upsert: Update if exists, Create if not
        let budget = await Budget.findOneAndUpdate(
            query,
            { $set: { limit: limit, month: month || new Date().toISOString().slice(0, 7) } }, // Default to "YYYY-MM"
            { new: true, upsert: true } // Upsert option
        );

        res.json(budget);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

module.exports = router;
