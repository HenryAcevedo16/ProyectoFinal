const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
    title: { type: String, required: true },
    description: { type: String, required: true },
    price: { type: Number, required: true },
    code: { type: String, required: true, unique: true },
    stock: { type: Number, required: true },
}, {
    timestamps: true, // Añade createdAt y updatedAt automáticamente
});

const Product = mongoose.model('Product', productSchema);

module.exports = Product;
