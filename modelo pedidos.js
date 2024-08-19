const mongoose = require('mongoose');

const OrderSchema = new mongoose.Schema({
    userId: mongoose.Schema.Types.ObjectId,
    products: [{ code: String, quantity: Number }],
    status: String,
});

module.exports = mongoose.model('Order', OrderSchema);
