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
            const newId = products.length > 0 ? products[products.length - 1].id + 1 : 1;
            const newProduct = { id: newId, ...product };
            products.push(newProduct);

            await fs.promises.writeFile(this.path, JSON.stringify(products, null, 2));
            return newProduct;
        } catch (error) {
            console.error("Error al añadir el producto:", error);
            throw error;
        }
    }

    async updateProduct(id, updatedProduct) {
        try {
            const products = await this.getProducts();
            const productIndex = products.findIndex(product => product.id === id);

            if (productIndex === -1) {
                throw new Error("Producto no encontrado");
            }

            products[productIndex] = { ...products[productIndex], ...updatedProduct };

            await fs.promises.writeFile(this.path, JSON.stringify(products, null, 2));
            return products[productIndex];
        } catch (error) {
            console.error("Error al actualizar el producto:", error);
            throw error;
        }
    }

    async deleteProduct(id) {
        try {
            const products = await this.getProducts();
            const productIndex = products.findIndex(product => product.id === id);

            if (productIndex === -1) {
                throw new Error("Producto no encontrado");
            }

            products.splice(productIndex, 1);

            await fs.promises.writeFile(this.path, JSON.stringify(products, null, 2));
            return true;
        } catch (error) {
            console.error("Error al eliminar el producto:", error);
            throw error;
        }
    }

    async getProductsPaginated({ limit = 10, page = 1, sort, query = {} }) {
        try {
            let products = await this.getProducts();
            if (query) {
                products = products.filter(product =>
                    Object.entries(query).every(([key, value]) => 
                        product[key] && product[key].toString().toLowerCase().includes(value.toLowerCase())
                    )
                );
            }

            if (sort) {
                products = products.sort((a, b) => {
                    if (sort === 'asc') return a.price - b.price;
                    if (sort === 'desc') return b.price - a.price;
                    return 0;
                });
            }

            const totalProducts = products.length;
            const totalPages = Math.ceil(totalProducts / limit);
            const offset = (page - 1) * limit;
            const paginatedProducts = products.slice(offset, offset + limit);

            return {
                docs: paginatedProducts,
                totalDocs: totalProducts,
                limit,
                page,
                totalPages,
                hasPrevPage: page > 1,
                hasNextPage: page < totalPages,
                prevPage: page > 1 ? page - 1 : null,
                nextPage: page < totalPages ? page + 1 : null
            };
        } catch (error) {
            console.error("Error al obtener productos paginados:", error);
            throw error;
        }
    }
}

module.exports = ProductManager;
