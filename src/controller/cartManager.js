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
            const cart = await CartModel.findById(cartId).populate('products.product');
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
            const cart = await CartModel.findById(cartId);
            if (!cart) {
                throw new Error("Carrito no encontrado");
            }
    
            const existingProduct = cart.products.find(p => p.product.toString() === productId);
    
            if (existingProduct) {
                existingProduct.quantity += quantity;
            } else {
                cart.products.push({ product: productId, quantity });
            }
    
            await cart.save();
            return cart;
        } catch (error) {
            console.error("Error al añadir el producto al carrito:", error);
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
