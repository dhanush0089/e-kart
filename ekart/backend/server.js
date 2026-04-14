const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());

// MongoDB connection
mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/ekart');
const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', () => console.log('MongoDB connected'));

// ------------------------- Models -------------------------
const UserSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true },
  password: String,
  role: { type: String, enum: ['manager', 'delivery', 'customer'], default: 'customer' },
  address: String,
});
const User = mongoose.model('User', UserSchema);

const OrderSchema = new mongoose.Schema({
  customerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  deliveryManId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  pickupAddress: String,
  deliveryAddress: String,
  status: { type: String, enum: ['Pending', 'Out for Delivery', 'Delivered'], default: 'Pending' },
  createdAt: { type: Date, default: Date.now },
});
const Order = mongoose.model('Order', OrderSchema);

const MessageSchema = new mongoose.Schema({
  fromManagerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  toDeliveryId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  message: String,
  createdAt: { type: Date, default: Date.now },
});
const Message = mongoose.model('Message', MessageSchema);

// ------------------------- Middleware -------------------------
const authMiddleware = (req, res, next) => {
  const token = req.header('Authorization')?.replace('Bearer ', '');
  if (!token) return res.status(401).json({ error: 'Access denied' });
  try {
    const verified = jwt.verify(token, process.env.JWT_SECRET || 'secretkey');
    req.user = verified;
    next();
  } catch (err) {
    res.status(400).json({ error: 'Invalid token' });
  }
};

const roleCheck = (roles) => (req, res, next) => {
  if (!roles.includes(req.user.role)) return res.status(403).json({ error: 'Forbidden' });
  next();
};

// ------------------------- Auth Routes -------------------------
app.post('/api/auth/register', async (req, res) => {
  try {
    const { name, email, password, role, address } = req.body;
    const hashed = await bcrypt.hash(password, 10);
    const user = new User({ name, email, password: hashed, role, address });
    await user.save();
    res.status(201).json({ message: 'User created' });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ error: 'User not found' });
    const valid = await bcrypt.compare(password, user.password);
    if (!valid) return res.status(400).json({ error: 'Invalid password' });
    const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET || 'secretkey');
    res.json({ token, role: user.role, userId: user._id, name: user.name });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ------------------------- User Routes -------------------------
app.get('/api/users', authMiddleware, roleCheck(['manager']), async (req, res) => {
  const customers = await User.find({ role: 'customer' }).select('-password');
  const deliveryMen = await User.find({ role: 'delivery' }).select('-password');
  res.json({ customers, deliveryMen });
});

// ------------------------- Order Routes -------------------------
app.post('/api/orders', authMiddleware, roleCheck(['customer']), async (req, res) => {
  const { pickupAddress, deliveryAddress } = req.body;
  const order = new Order({
    customerId: req.user.id,
    pickupAddress,
    deliveryAddress,
    status: 'Pending',
  });
  await order.save();
  res.status(201).json(order);
});

app.get('/api/orders', authMiddleware, async (req, res) => {
  let orders;
  if (req.user.role === 'customer') {
    orders = await Order.find({ customerId: req.user.id }).populate('deliveryManId', 'name');
  } else if (req.user.role === 'delivery') {
    orders = await Order.find({ deliveryManId: req.user.id }).populate('customerId', 'name address');
  } else if (req.user.role === 'manager') {
    orders = await Order.find().populate('customerId', 'name').populate('deliveryManId', 'name');
  }
  res.json(orders);
});

app.put('/api/orders/:id/status', authMiddleware, roleCheck(['delivery', 'manager']), async (req, res) => {
  const { status } = req.body;
  const order = await Order.findById(req.params.id);
  if (!order) return res.status(404).json({ error: 'Order not found' });
  if (req.user.role === 'delivery' && order.deliveryManId.toString() !== req.user.id)
    return res.status(403).json({ error: 'Not assigned' });
  order.status = status;
  await order.save();
  res.json(order);
});

app.post('/api/assign', authMiddleware, roleCheck(['manager']), async (req, res) => {
  const { orderId, deliveryManId } = req.body;
  const order = await Order.findById(orderId);
  if (!order) return res.status(404).json({ error: 'Order not found' });
  order.deliveryManId = deliveryManId;
  await order.save();
  res.json(order);
});

// ------------------------- Message Routes -------------------------
app.post('/api/messages', authMiddleware, roleCheck(['manager']), async (req, res) => {
  const { toDeliveryId, message } = req.body;
  const msg = new Message({ fromManagerId: req.user.id, toDeliveryId, message });
  await msg.save();
  res.status(201).json(msg);
});

app.get('/api/messages', authMiddleware, roleCheck(['delivery']), async (req, res) => {
  const messages = await Message.find({ toDeliveryId: req.user.id }).populate('fromManagerId', 'name');
  res.json(messages);
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));