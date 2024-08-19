const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const User = require('./models/User');
const Product = require('./models/Product');
const Order = require('./models/Order');

const app = express();
app.use(bodyParser.json());
app.use(cors());


mongoose.connect('mongodb://localhost:27017/sportsstore', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
});

const JWT_SECRET = 'your_jwt_secret_key'; 


const authenticateJWT = (req, res, next) => {
    const token = req.headers['authorization'];
    if (token == null) return res.sendStatus(401);

    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) return res.sendStatus(403);
        req.user = user;
        next();
    });
};

app.post('/register', async (req, res) => {
    const { username, password } = req.body;
    const hashedPassword = bcrypt.hashSync(password, 10);
    const user = new User({ username, password: hashedPassword });
    await user.save();
    res.send('Usuario registrado');
});

app.post('/login', async (req, res) => {
    const { username, password } = req.body;
    const user = await User.findOne({ username });
    if (!user || !bcrypt.compareSync(password, user.password)) {
        return res.sendStatus(401);
    }
    const token = jwt.sign({ username: user.username }, JWT_SECRET);
    res.json({ token });
});

app.get('/products', async (req, res) => {
    const products = await Product.find();
    res.json(products);
});

app.post('/products', authenticateJWT, async (req, res) => {
    const { code, description, price } = req.body;
    if (!req.user) return res.sendStatus(403);
    const product = new Product({ code, description, price });
    await product.save();
    res.send('Producto agregado');
});

app.post('/orders', authenticateJWT, async (req, res) => {
    const { products } = req.body;
    const order = new Order({ userId: req.user._id, products, status: 'Pendiente' });
    await order.save();
    res.send('Pedido creado');
});

app.get('/orders/pending', authenticateJWT, async (req, res) => {
    const orders = await Order.find({ userId: req.user._id, status: 'Pendiente' });
    res.json(orders);
});

app.post('/orders/:id/deliver', authenticateJWT, async (req, res) => {
    const { id } = req.params;
    await Order.findByIdAndUpdate(id, { status: 'Entregado' });
    res.send('Pedido entregado');
});

app.listen(3000, () => console.log('Servidor escuchando en el puerto 3000'));
