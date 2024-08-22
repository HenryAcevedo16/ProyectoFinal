const express = require("express");
const { createServer } = require("http");
const { Server } = require("socket.io");
const exphbs = require("express-handlebars");
const path = require("path");
const mongoose = require('mongoose');

const app = express();
const server = createServer(app);
const io = new Server(server);

// Conexión a MongoDB
mongoose.connect('mongodb+srv://emilacevedo167:C7vVMDUaGvpIWZLe/ecommerce?retryWrites=true&w=majority', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
}).then(() => {
    console.log('Conectado a MongoDB Atlas');
}).catch(err => {
    console.error('Error al conectar a MongoDB Atlas:', err);
});

// Configuración de Handlebars
const hbs = exphbs.create({});
app.engine('handlebars', hbs.engine);
app.set('view engine', 'handlebars');
app.set('views', path.join(__dirname, 'views'));

// Middleware para servir archivos estáticos
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Importamos el Product Manager
const ProductManager = require("./controller/productManager.js");
const manager = new ProductManager();

// Importamos el Cart Manager
const CartManager = require("./controller/cartManager.js");
const cartManager = new CartManager();

// Definir cartRouter
const cartRouter = express.Router();

// Rutas para vistas con Handlebars
app.get("/", async (req, res) => {
    const arrayProductos = await manager.getProducts();
    res.render('home', { productos: arrayProductos });
});

app.get("/realtimeproducts", async (req, res) => {
    const arrayProductos = await manager.getProducts();
    res.render('realTimeProducts', { productos: arrayProductos });
});

// Rutas para la API de productos
app.get("/api/products", async (req, res) => {
    const options = {
        limit: parseInt(req.query.limit, 10) || 10,
        page: parseInt(req.query.page, 10) || 1,
        sort: req.query.sort || '',
        query: req.query.query ? JSON.parse(req.query.query) : {}
    };
    const result = await manager.getProductsPaginated(options);
    res.json({ status: 'success', payload: result });
});

app.get("/api/products/:pid", async (req, res) => {
    const id = req.params.pid;
    const producto = await manager.getProductById(parseInt(id));

    if (!producto) {
        res.status(404).json({ status: 'error', message: 'Producto no encontrado' });
    } else {
        res.json({ status: 'success', payload: { producto } });
    }
});

app.post("/api/products", async (req, res) => {
    try {
        const newProduct = await manager.addProduct(req.body);
        io.emit('productoNuevo', newProduct);
        res.status(201).json({ status: 'success', message: "Producto añadido con éxito", product: newProduct });
    } catch (error) {
        res.status(500).json({ status: 'error', message: "Error al añadir el producto", error: error.message });
    }
});

app.put("/api/products/:pid", async (req, res) => {
    const id = parseInt(req.params.pid);
    const updatedProduct = await manager.updateProduct(id, req.body);

    if (!updatedProduct) {
        res.status(404).json({ status: 'error', message: "Producto no encontrado" });
    } else {
        res.status(200).json({ status: 'success', message: "Producto actualizado con éxito", product: updatedProduct });
    }
});

app.delete("/api/products/:pid", async (req, res) => {
    const id = parseInt(req.params.pid);
    const success = await manager.deleteProduct(id);

    if (!success) {
        res.status(404).json({ status: 'error', message: "Producto no encontrado" });
    } else {
        io.emit('productoEliminado', { id });
        res.status(200).json({ status: 'success', message: "Producto eliminado con éxito" });
    }
});

// Rutas para la API de carritos
cartRouter.post("/", async (req, res) => {
    const cartId = await cartManager.createCart();
    res.status(201).json({ status: 'success', message: "Carrito creado con éxito", cartId: cartId });
});

cartRouter.post("/:cid/products", async (req, res) => {
    const { cid, productId, quantity } = req.body;
    try {
        const updatedCart = await cartManager.addProductToCart(cid, productId, quantity);
        res.status(201).json({ status: 'success', message: "Producto añadido al carrito con éxito", cart: updatedCart });
    } catch (error) {
        res.status(500).json({ status: 'error', message: "Error al añadir el producto al carrito", error: error.message });
    }
});

cartRouter.delete("/:cid/products/:pid", async (req, res) => {
    const { cid, pid } = req.params;
    try {
        const updatedCart = await cartManager.removeProductFromCart(cid, pid);
        res.status(200).json({ status: 'success', message: "Producto eliminado del carrito con éxito", cart: updatedCart });
    } catch (error) {
        res.status(500).json({ status: 'error', message: "Error al eliminar el producto del carrito", error: error.message });
    }
});

cartRouter.get("/:cid", async (req, res) => {
    const { cid } = req.params;
    try {
        const cart = await cartManager.getCartById(cid);
        if (cart) {
            res.status(200).json({ status: 'success', cart });
        } else {
            res.status(404).json({ status: 'error', message: "Carrito no encontrado" });
        }
    } catch (error) {
        res.status(500).json({ status: 'error', message: "Error al obtener el carrito", error: error.message });
    }
});

app.use("/api/carts", cartRouter);

// Configuración de Socket.IO
io.on('connection', (socket) => {
    console.log('Un usuario se ha conectado');

    socket.on('nuevoProducto', async (producto) => {
        try {
            const newProduct = await manager.addProduct(producto);
            io.emit('productoNuevo', newProduct);
        } catch (error) {
            socket.emit('errorProducto', { message: error.message });
        }
    });

    socket.on('eliminarProducto', async (producto) => {
        const success = await manager.deleteProduct(producto.id);
        if (success) {
            io.emit('productoEliminado', producto);
        } else {
            socket.emit('errorProducto', { message: "Producto no encontrado para eliminar" });
        }
    });
});

// Iniciar el servidor
const PORT = 3000;
server.listen(PORT, () => {
    console.log(`Servidor express escuchando en el puerto ${PORT}`);
});
