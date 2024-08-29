const ProductModel = require('../models/productModel.js');

class ProductManager {
    async getProducts() {
        try {
            const products = await ProductModel.find();
            return products;
        } catch (error) {
            console.error("Error al leer los productos:", error);
            return [];
        }
    }

    async addProduct(product) {
        try {
            const newProduct = new ProductModel(product);
            await newProduct.save();
            return newProduct;
        } catch (error) {
            console.error("Error al añadir el producto:", error);
            throw error;
        }
    }

    async getProductById(id) {
        try {
            const product = await ProductModel.findById(id);
            return product;
        } catch (error) {
            console.error("Error al obtener el producto por ID:", error);
            return null;
        }
    }

    async updateProduct(id, updatedProduct) {
        try {
            const product = await ProductModel.findByIdAndUpdate(id, updatedProduct, { new: true });
            return product;
        } catch (error) {
            console.error("Error al actualizar el producto:", error);
            return null;
        }
    }

    async deleteProduct(id) {
        try {
            const product = await ProductModel.findByIdAndDelete(id);
            return product;
        } catch (error) {
            console.error("Error al eliminar el producto:", error);
            return null;
        }
    }
}

module.exports = ProductManager;
