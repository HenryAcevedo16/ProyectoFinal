const CartModel = require("../models/cartModel");

class CartManager {
    async createCart() {
        try {
            const newCart = new CartModel({ products: [] });
            await newCart.save();
            return newCart.id; // Retorna el ID del carrito creado
        } catch (error) {
            console.error("Error al crear el carrito:", error);
            throw error;
        }
    }

    async getCartById(cartId) {
        try {
            const cart = await CartModel.findById(cartId);
            if (!cart) {
                throw new Error("No existe un carrito con ese ID");
            }
            return cart;
        } catch (error) {
            console.error("Error al obtener el carrito por ID:", error);
            throw error;
        }
    }

    async addProductToCart(cartId, productId, quantity = 1) {
        try {
            const cart = await this.getCartById(cartId);
            const productIndex = cart.products.findIndex(p => p.product.toString() === productId);

            if (productIndex > -1) {
                cart.products[productIndex].quantity += quantity;
            } else {
                cart.products.push({ product: productId, quantity });
            }

            await cart.save(); // Guarda los cambios en la base de datos
            return cart;
        } catch (error) {
            console.error("Error al añadir producto al carrito:", error);
            throw error;
        }
    }

    async removeProductFromCart(cartId, productId) {
        try {
            const cart = await this.getCartById(cartId);
            cart.products = cart.products.filter(p => p.product.toString() !== productId);

            await cart.save();
            return cart;
        } catch (error) {
            console.error("Error al eliminar producto del carrito:", error);
            throw error;
        }
    }
}

module.exports = CartManager;
