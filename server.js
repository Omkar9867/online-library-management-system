const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const User = require('./models/user');
const Book = require('./models/book');
const Transaction = require('./models/transaction');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(bodyParser.json());

// MongoDB Connection
mongoose.connect('mongodb://localhost:27017/library', { useNewUrlParser: true, useUnifiedTopology: true });

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));
db.once('open', async () => {
    console.log('Connected to MongoDB');

    // Seed initial data
    try {
        await Book.create({
            name: 'Book 1',
            author: 'Author 1',
            availability: true,
        });
        await Book.create({
            name: 'Book 2',
            author: 'Author 2',
            availability: true,
        });
        console.log('Initial data seeded');
    } catch (err) {
        console.error('Error seeding initial data:', err.message);
    }
});

// Authneticate Token
const authenticateToken = (req, res, next) => {
    const token = req.headers.authorization;
  
    if (!token) {
      return res.status(401).json({ message: 'Authentication token is missing' });
    }
  
    jwt.verify(token, 'Darshan', (err, user) => {
      if (err) {
        return res.status(403).json({ message: 'Invalid token' });
      }
      req.user = user;
      next();
    });
  };
  
// Authenticate Admin middleware
const authenticateAdmin = (req, res, next) => {
    const isAdmin = req.user && req.user.role === 'admin';
    if (!isAdmin) {
        return res.status(403).json({ message: 'Admin access required' });
    }
    next();
};


// API Routes
const bookRoutes = require('./routes/bookRoutes');
app.use('/api/books', bookRoutes);

// Issue book route for users
app.post('/api/user/issue/:bookId', authenticateToken, async (req, res) => {
    const bookId = req.params.bookId;

    // Issue the book for the user
    try {
        // Check if the book is available
        const book = await Book.findById(bookId);
        if (!book || !book.availability) {
            return res.status(400).json({ message: 'Book not available for issue' });
        }

        // Update book availability
        book.availability = false;
        await book.save();

        // Create a new transaction
        const newTransaction = new Transaction({
            user: req.user._id,
            book: bookId,
            dueDate: new Date(new Date().setDate(new Date().getDate() + 14)), // Due date set to 14 days from today
            type: 'borrowed',
        });

        await newTransaction.save();

        res.json({ message: 'Book issued successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Return book route for users
app.post('/api/user/return/:bookId', authenticateToken, async (req, res) => {
    const bookId = req.params.bookId;

    // Return the book for the user
    try {
        // Check if the user has borrowed the book
        const userTransaction = await Transaction.findOne({ user: req.user._id, book: bookId, type: 'borrowed' });
        if (!userTransaction) {
            return res.status(400).json({ message: 'You have not borrowed this book' });
        }

        // Update book availability
        const book = await Book.findById(bookId);
        book.availability = true;
        await book.save();

        // Update transaction type to 'returned'
        userTransaction.type = 'returned';
        await userTransaction.save();

        res.json({ message: 'Book returned successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Issue book route for admin
app.post('/api/admin/issue/:bookId', authenticateToken, authenticateAdmin, async (req, res) => {
    const bookId = req.params.bookId;

    // Issue the book for the admin
    try {
        // Update book availability
        const book = await Book.findById(bookId);
        if (!book || !book.availability) {
            return res.status(400).json({ message: 'Book not available for issue' });
        }

        book.availability = false;
        await book.save();

        res.json({ message: 'Book issued successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Return book route for admin
app.post('/api/admin/return/:bookId', authenticateToken, authenticateAdmin, async (req, res) => {
    const bookId = req.params.bookId;

    // Return the book for the admin
    try {
        // Update book availability
        const book = await Book.findById(bookId);
        if (!book) {
            return res.status(400).json({ message: 'Book not found' });
        }

        book.availability = true;
        await book.save();

        res.json({ message: 'Book returned successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Fetch user transactions route
app.get('/api/user/transactions', authenticateToken, async (req, res) => {
    // Fetch user transactions from the database
    try {
        const transactions = await Transaction.find({ user: req.user._id }).populate('book');
        res.json(transactions);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Fetch all books route
app.get('/api/books', async (req, res) => {
    // Fetch all books from the database
    try {
        const books = await Book.find();
        res.json(books);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});


// Add new book route (only accessible by admin)
app.post('/api/books', authenticateToken, authenticateAdmin, async (req, res) => {
    const { name, author, availability } = req.body;

    // Create a new book
    const newBook = new Book({ name, author, availability });

    try {
        // Save the new book to the database
        const savedBook = await newBook.save();
        res.status(201).json(savedBook);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// Remove book route (only accessible by admin)
app.delete('/api/books/:id', authenticateToken, authenticateAdmin, async (req, res) => {
    const bookId = req.params.id;

    // Remove the book from the database
    try {
        const removedBook = await Book.findByIdAndRemove(bookId);
        res.json(removedBook);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
