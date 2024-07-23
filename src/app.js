const express = require("express");
const app = express();
const PUERTO = 8080;

app.use(express.json());

// Importamos El Product Manager
const ProductManager = require("./controller/productManager.js")
const manager = new ProductManager("./src/data/productos.json")

// Importamos el Cart Manager
const CartManager = require("./controller/cartManager.js")
const cartManager = new CartManager("./src/data/carts.json")

// Rutas para productos
app.get("/", (req, res) => {
    res.send("Bienvenidos al servidor Express");
})

app.get("/products", async (req, res) => {
    const arrayProductos = await manager.getProducts();
    res.send(arrayProductos);
})

app.get("/products/:pid", async (req, res) => {
    let id = req.params.pid;

    const producto = await manager.getProductById(parseInt(id));

    if (!producto) {
        res.send('Producto no encontrado');
    } else {
        res.send({ producto });
    }
})

app.post("/products", async (req, res) => {
    try {
        const newProduct = await manager.addProduct(req.body);

        res.status(201).send({ message: "Producto añadido con éxito", product: newProduct });
    } catch (error) {
        res.status(500).send({ message: "Error al añadir el producto", error: error.message });
    }
})

// Rutas para el carrito
const cartRouter = express.Router();

cartRouter.post("/", async (req, res) => {
    const cartId = await cartManager.createCart();
    res.status(201).send({ message: "Carrito creado con éxito", cartId: cartId });
});

cartRouter.post("/:cid/products", async (req, res) => {
    const { cid } = req.params;
    const { productId, quantity } = req.body;

    try {
        await cartManager.addProductToCart(cid, productId, quantity);
        res.status(201).send({ message: "Producto añadido al carrito con éxito" });
    } catch (error) {
        res.status(500).send({ message: "Error al añadir el producto al carrito", error: error.message });
    }
})

cartRouter.delete("/:cid/products/:pid", async (req, res) => {
    const { cid, pid } = req.params;

    try {
        await cartManager.removeProductFromCart(cid, pid);
        res.status(200).send({ message: "Producto eliminado del carrito con éxito" });
    } catch (error) {
        res.status(500).send({ message: "Error al eliminar el producto del carrito", error: error.message });
    }
})

cartRouter.get("/:cid", async (req, res) => {
    const { cid } = req.params;

    try {
        const cart = await cartManager.getCartById(cid);
        if (cart) {
            res.status(200).send(cart);
        } else {
            res.status(404).send({ message: "Carrito no encontrado" });
        }
    } catch (error) {
        res.status(500).send({ message: "Error al obtener el carrito", error: error.message });
    }
})

app.use("/api/carts", cartRouter);

// Actualizar producto
app.put("/products/:pid", async (req, res) => {
    const id = parseInt(req.params.pid);
    const updatedProduct = await manager.updateProduct(id, req.body);

    if (!updatedProduct) {
        res.status(404).send({ message: "Producto no encontrado" });
    } else {
        res.status(200).send({ message: "Producto actualizado con éxito", product: updatedProduct });
    }
});

// Eliminar producto
app.delete("/products/:pid", async (req, res) => {
    const id = parseInt(req.params.pid);
    const success = await manager.deleteProduct(id);

    if (!success) {
        res.status(404).send({ message: "Producto no encontrado" });
    } else {
        res.status(200).send({ message: "Producto eliminado con éxito" });
    }
});

cartRouter.get("/", async (req, res) => {
    try {
        const carts = await cartManager.getAllCarts();
        res.status(200).send(carts);
    } catch (error) {
        res.status(500).send({ message: "Error al obtener los carritos", error: error.message });
    }
});

// Endpoint para agregar un producto al carrito
cartRouter.post("/:cid/products", async (req, res) => {
    const { cid } = req.params; 
    const { pid, quantity } = req.body;

    try {
        const added = await cartManager.addProductToCart(cid, pid, quantity);
        if (added) {
            res.status(200).send({ message: "Producto agregado al carrito con éxito" });
        } else {
            res.status(404).send({ message: "Producto o carrito no encontrado" });
        }
    } catch (error) {
        res.status(500).send({ message: "Error al agregar el producto al carrito", error: error.message });
    }
});

// Endpoint para actualizar la cantidad de un producto en el carrito
cartRouter.put("/:cid/products/:pid", async (req, res) => {
    const { cid, pid } = req.params;
    const { quantity } = req.body;

    try {
        const updated = await cartManager.updateProductInCart(cid, pid, quantity);
        if (updated) {
            res.status(200).send({ message: "Producto actualizado en el carrito con éxito" });
        } else {
            res.status(404).send({ message: "Producto o carrito no encontrado" });
        }
    } catch (error) {
        res.status(500).send({ message: "Error al actualizar el producto en el carrito", error: error.message });
    }
});

// Endpoint para eliminar un carrito
cartRouter.delete("/:cid", async (req, res) => {
    const { cid } = req.params;

    try {
        const success = await cartManager.deleteCart(cid);
        if (success) {
            res.status(200).send({ message: "Carrito eliminado con éxito" });
        } else {
            res.status(404).send({ message: "Carrito no encontrado" });
        }
    } catch (error) {
        res.status(500).send({ message: "Error al eliminar el carrito", error: error.message });
    }
});



// Listen
app.listen(PUERTO, () => {
    console.log(`Servidor express escuchando en el puerto ${PUERTO}`);
})