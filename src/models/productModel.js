// Importa Mongoose
const mongoose = require('mongoose');

// Define el esquema del producto
const productSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  price: {
    type: Number,
    required: true,
  },
  code: {
    type: String,
    required: true,
    unique: true,
  },
  stock: {
    type: Number,
    required: true,
  },
  id: {
    type: Number,
    required: true,
    unique: true,
  },
}, {
  timestamps: true, // Añade createdAt y updatedAt automáticamente
});

// Crea el modelo de producto basado en el esquema
const Product = mongoose.model('Product', productSchema);

// Exporta el modelo
module.exports = Product;
