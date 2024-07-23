const fs = require("fs").promises;

class CartManager {
    constructor(path) {
        this.path = path;
    }

    async addProductToCart(cartId, productId, quantity) {
        const carts = await this.readCartsFile();
        let cart = carts.find(cart => cart.id === cartId);

        if (!cart) {
            cart = { id: cartId, products: [] };
            carts.push(cart);
        }

        const productIndex = cart.products.findIndex(product => product.id === productId);

        if (productIndex > -1) {
            cart.products[productIndex].quantity += quantity;
        } else {
            cart.products.push({ id: productId, quantity });
        }

        await this.saveCartsFile(carts);
    }

    async removeProductFromCart(cartId, productId) {
        const carts = await this.readCartsFile();
        const cart = carts.find(cart => cart.id === cartId);

        if (!cart) {
            console.log("Carrito no encontrado");
            return;
        }

        cart.products = cart.products.filter(product => product.id !== productId);

        await this.saveCartsFile(carts);
    }

    async getCartById(cartId) {
        const carts = await this.readCartsFile();
        return carts.find(cart => cart.id === cartId) || null;
    }

    async createCart() {
        const carts = await this.readCartsFile();
        const newCart = { id: ++CartManager.lastCartId, products: [] };
        carts.push(newCart);
        await this.saveCartsFile(carts);
        return newCart.id;
    }

    async readCartsFile() {
        try {
            const data = await fs.readFile(this.path, "utf-8");
            return JSON.parse(data);
        } catch (error) {
            console.error("Error leyendo el archivo de carritos", error);
            return [];
        }
    }

    async saveCartsFile(carts) {
        try {
            await fs.writeFile(this.path, JSON.stringify(carts, null, 2));
        } catch (error) {
            console.error("Error guardando el archivo de carritos", error);
        }
    }
}

module.exports = CartManager;