const fs = require('fs');

class ProductManager {
    constructor(path) {
        this.path = path;
    }

    async getProducts() {
        try {
            const data = await fs.promises.readFile(this.path, 'utf-8');
            return JSON.parse(data);
        } catch (error) {
            console.error("Error al leer los productos:", error);
            return [];
        }
    }

    async getProductById(id) {
        try {
            const products = await this.getProducts();
            return products.find(product => product.id === id);
        } catch (error) {
            console.error("Error al obtener el producto por ID:", error);
        }
    }

    async addProduct(product) {
        try {
            const products = await this.getProducts();

            // Validar que todos los campos requeridos estén presentes
            const requiredFields = ['title', 'description', 'price', 'code', 'stock'];
            for (let field of requiredFields) {
                if (!product[field]) {
                    throw new Error(`El campo ${field} es obligatorio`);
                }
            }

            // Generar un nuevo ID
            const newId = products.length > 0 ? products[products.length - 1].id + 1 : 1;
            const newProduct = { id: newId, ...product };
            products.push(newProduct);

            // Guardar los productos actualizados
            await fs.promises.writeFile(this.path, JSON.stringify(products, null, 2));
            return newProduct;
        } catch (error) {
            console.error("Error al añadir el producto:", error);
            throw error;
        }
    }

    async updateProduct(id, updates) {
        try {
            const products = await this.getProducts();
            const productIndex = products.findIndex(product => product.id === id);

            if (productIndex === -1) {
                return null;
            }

            products[productIndex] = { ...products[productIndex], ...updates };
            await fs.promises.writeFile(this.path, JSON.stringify(products, null, 2));

            return products[productIndex];
        } catch (error) {
            console.error("Error al actualizar el producto:", error);
            throw error;
        }
    }

    async deleteProduct(id) {
        try {
            let products = await this.getProducts();
            const initialLength = products.length;

            products = products.filter(product => product.id !== id);

            if (products.length === initialLength) {
                return false;
            }

            await fs.promises.writeFile(this.path, JSON.stringify(products, null, 2));
            return true;
        } catch (error) {
            console.error("Error al eliminar el producto:", error);
            throw error;
        }
    }
}

module.exports = ProductManager;
