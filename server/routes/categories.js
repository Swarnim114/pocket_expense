const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Category = require('../models/Category');

// @route   GET /api/categories
// @desc    Get all categories for user
// @access  Private
router.get('/', auth, async (req, res) => {
    try {
        const categories = await Category.find({ userId: req.user.id });
        res.json(categories);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   POST /api/categories
// @desc    Add new category
// @access  Private
router.post('/', auth, async (req, res) => {
    const { name, icon, color, type } = req.body;

    try {
        const newCategory = new Category({
            userId: req.user.id,
            name,
            icon,
            color,
            type
        });

        const category = await newCategory.save();
        res.json(category);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   DELETE /api/categories/:id
// @desc    Delete category
// @access  Private
router.delete('/:id', auth, async (req, res) => {
    try {
        let category = await Category.findById(req.params.id);
        if (!category) return res.status(404).json({ msg: 'Category not found' });
        if (category.userId.toString() !== req.user.id) return res.status(401).json({ msg: 'Not authorized' });

        await Category.findByIdAndDelete(req.params.id);
        res.json({ msg: 'Category removed' });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

module.exports = router;
