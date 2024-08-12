const fs = require('fs');

class CartManager {
    constructor(path) {
        this.path = path;
    }

    async createCart() {
        try {
            const carts = await this.getCarts();
            const newId = carts.length > 0 ? carts[carts.length - 1].id + 1 : 1;
            const newCart = { id: newId, products: [] };
            carts.push(newCart);

            await fs.promises.writeFile(this.path, JSON.stringify(carts, null, 2));
            return newId;
        } catch (error) {
            console.error("Error al crear el carrito:", error);
            throw error;
        }
    }

    async getCarts() {
        try {
            const data = await fs.promises.readFile(this.path, 'utf-8');
            return JSON.parse(data);
        } catch (error) {
            console.error("Error al leer los carritos:", error);
            return [];
        }
    }

    async getCartById(id) {
        try {
            const carts = await this.getCarts();
            return carts.find(cart => cart.id === id);
        } catch (error) {
            console.error("Error al obtener el carrito por ID:", error);
        }
    }

    async addProductToCart(cartId, productId, quantity = 1) {
        try {
            const carts = await this.getCarts();
            const cartIndex = carts.findIndex(cart => cart.id === parseInt(cartId));

            if (cartIndex === -1) {
                throw new Error("Carrito no encontrado");
            }

            const productIndex = carts[cartIndex].products.findIndex(product => product.id === parseInt(productId));

            if (productIndex === -1) {
                carts[cartIndex].products.push({ id: parseInt(productId), quantity });
            } else {
                carts[cartIndex].products[productIndex].quantity += quantity;
            }

            await fs.promises.writeFile(this.path, JSON.stringify(carts, null, 2));
        } catch (error) {
            console.error("Error al añadir el producto al carrito:", error);
            throw error;
        }
    }

    async removeProductFromCart(cartId, productId) {
        try {
            const carts = await this.getCarts();
            const cartIndex = carts.findIndex(cart => cart.id === parseInt(cartId));

            if (cartIndex === -1) {
                throw new Error("Carrito no encontrado");
            }

            const productIndex = carts[cartIndex].products.findIndex(product => product.id === parseInt(productId));

            if (productIndex === -1) {
                throw new Error("Producto no encontrado en el carrito");
            }

            carts[cartIndex].products.splice(productIndex, 1);

            await fs.promises.writeFile(this.path, JSON.stringify(carts, null, 2));
        } catch (error) {
            console.error("Error al eliminar el producto del carrito:", error);
            throw error;
        }
    }
}

module.exports = CartManager;
