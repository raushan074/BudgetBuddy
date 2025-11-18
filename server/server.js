
/**
 * BUDGET BUDDY BACKEND
 * 
 * Setup Instructions:
 * 1. Install dependencies: `npm install express mongoose cors jsonwebtoken bcryptjs dotenv`
 * 2. Set environment variables in .env: 
 *    MONGO_URI=your_mongodb_connection_string
 *    JWT_SECRET=your_secret_key
 *    PORT=5000
 * 3. Run: `node server/server.js`
 */

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const app = express();

// Allow requests from Vite frontend
app.use(cors()); 
app.use(express.json({ limit: '10mb' })); // Increased limit for budget plan uploads

// --- MongoDB Models ---

const userSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String }, // Optional for OAuth users
    avatar: { type: String },
    provider: { type: String, default: 'local' },
    createdAt: { type: Date, default: Date.now }
});

const transactionSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    date: { type: String, required: true },
    description: { type: String, required: true },
    amount: { type: Number, required: true },
    type: { type: String, enum: ['income', 'expense'], required: true },
    category: { type: String, required: true }
});

const budgetSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    category: { type: String, required: true },
    limit: { type: Number, required: true }
});

const recurringSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    description: { type: String, required: true },
    amount: { type: Number, required: true },
    type: { type: String, enum: ['income', 'expense'], required: true },
    category: { type: String, required: true },
    frequency: { type: String, enum: ['weekly', 'monthly', 'yearly'], required: true },
    nextDueDate: { type: String, required: true },
    active: { type: Boolean, default: true }
});

const planSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true }, // One plan per user
    fileName: { type: String },
    content: { type: String }
});

const User = mongoose.model('User', userSchema);
const Transaction = mongoose.model('Transaction', transactionSchema);
const Budget = mongoose.model('Budget', budgetSchema);
const Recurring = mongoose.model('Recurring', recurringSchema);
const Plan = mongoose.model('Plan', planSchema);

// --- Middleware ---

const auth = (req, res, next) => {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    if (!token) return res.status(401).send({ error: 'Access denied. No token provided.' });

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'default_secret');
        req.user = decoded;
        next();
    } catch (ex) {
        res.status(400).send({ error: 'Invalid token.' });
    }
};

// --- Helper ---
const toClient = (doc) => {
    if (!doc) return null;
    const obj = doc.toObject();
    obj.id = obj._id;
    delete obj._id;
    delete obj.__v;
    return obj;
};

// --- Routes ---

// 1. AUTH ROUTES
app.post('/api/auth/register', async (req, res) => {
    try {
        const { name, email, password } = req.body;
        let user = await User.findOne({ email });
        if (user) return res.status(400).send({ error: 'User already registered.' });

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        user = new User({ 
            name, 
            email, 
            password: hashedPassword,
            avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=random`
        });
        await user.save();

        const token = jwt.sign({ _id: user._id }, process.env.JWT_SECRET || 'default_secret');
        res.send({ 
            user: toClient(user), 
            token 
        });
    } catch (error) {
        console.error(error);
        res.status(500).send({ error: 'Server error' });
    }
});

app.post('/api/auth/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email });
        if (!user) return res.status(400).send({ error: 'Invalid email or password.' });

        if (user.provider !== 'local') return res.status(400).send({ error: `Please login with ${user.provider}` });

        const validPassword = await bcrypt.compare(password, user.password);
        if (!validPassword) return res.status(400).send({ error: 'Invalid email or password.' });

        const token = jwt.sign({ _id: user._id }, process.env.JWT_SECRET || 'default_secret');
        res.send({ 
            user: toClient(user), 
            token 
        });
    } catch (error) {
        res.status(500).send({ error: 'Server error' });
    }
});

// Simulated OAuth Endpoint for demo purposes
// In a real production app, this would handle the callback from Google/GitHub
app.post('/api/auth/oauth-mock', async (req, res) => {
    try {
        const { provider } = req.body; // 'google' or 'github'
        const email = `demo_${provider}_${Math.floor(Math.random() * 1000)}@example.com`; 
        // Note: In real app, we'd get email from the provider token.
        // For this simulated "Connect DB" feature, we'll find or create a fixed demo user for simplicity
        // OR create a new one every time? Let's use a fixed one for stability of demo.
        const fixedEmail = `user@${provider}.com`;

        let user = await User.findOne({ email: fixedEmail });
        
        if (!user) {
            user = new User({
                name: `Demo ${provider.charAt(0).toUpperCase() + provider.slice(1)} User`,
                email: fixedEmail,
                provider: provider,
                avatar: provider === 'github' 
                    ? 'https://github.githubassets.com/images/modules/logos_page/GitHub-Mark.png' 
                    : 'https://lh3.googleusercontent.com/COxitqgJr1sJnIDe8-jiKhxDx1FrYbtRHKJ9z_hELisAlapwE9LUPh6fcXIfb5vwpbMl4xl9H9TRFPc5NOO8Sb3VSgIBrfRYvW6cUA'
            });
            await user.save();
        }

        const token = jwt.sign({ _id: user._id }, process.env.JWT_SECRET || 'default_secret');
        res.send({ 
            user: toClient(user), 
            token 
        });
    } catch (error) {
        console.error(error);
        res.status(500).send({ error: 'Server error' });
    }
});

// 2. DATA AGGREGATION ROUTE (Fast Load)
app.get('/api/data', auth, async (req, res) => {
    try {
        const [transactions, budgets, recurring, plan] = await Promise.all([
            Transaction.find({ userId: req.user._id }).sort({ date: -1 }),
            Budget.find({ userId: req.user._id }),
            Recurring.find({ userId: req.user._id }),
            Plan.findOne({ userId: req.user._id })
        ]);

        res.send({
            transactions: transactions.map(toClient),
            budgets: budgets.map(toClient),
            recurring: recurring.map(toClient),
            budgetPlan: plan ? { fileName: plan.fileName, content: plan.content } : { fileName: null, content: null }
        });
    } catch (error) {
        console.error(error);
        res.status(500).send({ error: 'Failed to fetch data' });
    }
});

// 3. TRANSACTION ROUTES
app.post('/api/transactions', auth, async (req, res) => {
    try {
        const transaction = new Transaction({ ...req.body, userId: req.user._id });
        await transaction.save();
        res.send(toClient(transaction));
    } catch (error) {
        res.status(500).send(error);
    }
});

app.post('/api/transactions/import', auth, async (req, res) => {
    try {
        const transactions = req.body.map(t => ({ ...t, userId: req.user._id }));
        const saved = await Transaction.insertMany(transactions);
        res.send(saved.map(toClient));
    } catch (error) {
        res.status(500).send(error);
    }
});

app.put('/api/transactions/:id', auth, async (req, res) => {
    try {
        const transaction = await Transaction.findOneAndUpdate(
            { _id: req.params.id, userId: req.user._id },
            req.body,
            { new: true }
        );
        res.send(toClient(transaction));
    } catch (error) {
        res.status(500).send(error);
    }
});

app.delete('/api/transactions/:id', auth, async (req, res) => {
    try {
        await Transaction.findOneAndDelete({ _id: req.params.id, userId: req.user._id });
        res.send({ id: req.params.id });
    } catch (error) {
        res.status(500).send(error);
    }
});

// 4. BUDGET ROUTES
app.post('/api/budgets', auth, async (req, res) => {
    try {
        // Upsert budget (Update if exists, else Insert)
        const budget = await Budget.findOneAndUpdate(
            { userId: req.user._id, category: req.body.category },
            { limit: req.body.limit },
            { new: true, upsert: true }
        );
        res.send(toClient(budget));
    } catch (error) {
        res.status(500).send(error);
    }
});

app.delete('/api/budgets/:category', auth, async (req, res) => {
    try {
        await Budget.findOneAndDelete({ category: req.params.category, userId: req.user._id });
        res.send({ category: req.params.category });
    } catch (error) {
        res.status(500).send(error);
    }
});

// 5. RECURRING ROUTES
app.post('/api/recurring', auth, async (req, res) => {
    try {
        const recurring = new Recurring({ ...req.body, userId: req.user._id });
        await recurring.save();
        res.send(toClient(recurring));
    } catch (error) {
        res.status(500).send(error);
    }
});

app.put('/api/recurring/:id', auth, async (req, res) => {
    try {
        const recurring = await Recurring.findOneAndUpdate(
            { _id: req.params.id, userId: req.user._id },
            req.body,
            { new: true }
        );
        res.send(toClient(recurring));
    } catch (error) {
        res.status(500).send(error);
    }
});

app.delete('/api/recurring/:id', auth, async (req, res) => {
    try {
        await Recurring.findOneAndDelete({ _id: req.params.id, userId: req.user._id });
        res.send({ id: req.params.id });
    } catch (error) {
        res.status(500).send(error);
    }
});

// 6. PLAN ROUTES
app.post('/api/plans', auth, async (req, res) => {
    try {
        const plan = await Plan.findOneAndUpdate(
            { userId: req.user._id },
            { fileName: req.body.fileName, content: req.body.content },
            { new: true, upsert: true }
        );
        res.send({ fileName: plan.fileName, content: plan.content });
    } catch (error) {
        res.status(500).send(error);
    }
});

// DB Connection
if (process.env.MONGO_URI) {
    mongoose.connect(process.env.MONGO_URI)
        .then(() => console.log('Connected to MongoDB'))
        .catch(err => console.error('Could not connect to MongoDB', err));
}

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
