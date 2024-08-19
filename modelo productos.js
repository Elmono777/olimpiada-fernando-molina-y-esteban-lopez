const mongoose = require('mongoose');

const ProductSchema = new mongoose.Schema({
    code: String,
    description: String,
    price: Number,
});

module.exports = mongoose.model('Product', ProductSchema);
