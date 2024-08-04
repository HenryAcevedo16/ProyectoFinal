const express = require("express");
const { createServer } = require("http");
const { Server } = require("socket.io");
const exphbs = require("express-handlebars");
const path = require("path");

const app = express();
const server = createServer(app);
const io = new Server(server);

// Configuración de Handlebars
const hbs = exphbs.create({ /* config */ });
app.engine('handlebars', hbs.engine);
app.set('view engine', 'handlebars');
app.set('views', path.join(__dirname, 'views'));

// Middleware para servir archivos estáticos
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Importamos El Product Manager
const ProductManager = require("./controller/productManager.js")
const manager = new ProductManager("./src/data/productos.json")

// Importamos el Cart Manager
const CartManager = require("./controller/cartManager.js")
const cartManager = new CartManager("./src/data/carts.json")

let productos = [];

// Rutas para vistas con Handlebars
app.get("/", async (req, res) => {
    const arrayProductos = await manager.getProducts();
    res.render('home', { productos: arrayProductos });
});

app.get("/realtimeproducts", async (req, res) => {
    const arrayProductos = await manager.getProducts();
    res.render('realTimeProducts', { productos: arrayProductos });
});

// Rutas para productos
app.get("/products", async (req, res) => {
    const arrayProductos = await manager.getProducts();
    res.send(arrayProductos);
});

app.get("/products/:pid", async (req, res) => {
    let id = req.params.pid;
    const producto = await manager.getProductById(parseInt(id));

    if (!producto) {
        res.send('Producto no encontrado');
    } else {
        res.send({ producto });
    }
});

app.post("/products", async (req, res) => {
    try {
        const newProduct = await manager.addProduct(req.body);
        io.emit('productoNuevo', newProduct);
        res.status(201).send({ message: "Producto añadido con éxito", product: newProduct });
    } catch (error) {
        res.status(500).send({ message: "Error al añadir el producto", error: error.message });
    }
});

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
});

cartRouter.delete("/:cid/products/:pid", async (req, res) => {
    const { cid, pid } = req.params;

    try {
        await cartManager.removeProductFromCart(cid, pid);
        res.status(200).send({ message: "Producto eliminado del carrito con éxito" });
    } catch (error) {
        res.status(500).send({ message: "Error al eliminar el producto del carrito", error: error.message });
    }
});

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
});

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
        io.emit('productoEliminado', { id });
        res.status(200).send({ message: "Producto eliminado con éxito" });
    }
});

// Configuración de Socket.IO
io.on('connection', (socket) => {
    console.log('Un usuario se ha conectado');

    socket.on('nuevoProducto', async (producto) => {
        await manager.addProduct(producto.title, producto.description, producto.price, producto.img, producto.code, producto.stock, producto.thumbnails, producto.status, producto.category);
        io.emit('productoNuevo', producto);
    });

    socket.on('eliminarProducto', async (producto) => {
        await manager.deleteProduct(producto.id);
        io.emit('productoEliminado', producto);
    });
});

// Listen
const PORT = 8080;
server.listen(PORT, () => {
    console.log(`Servidor express escuchando en el puerto ${PORT}`);
});
