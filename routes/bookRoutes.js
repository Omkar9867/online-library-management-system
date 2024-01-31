// routes/bookRoutes.js
const express = require('express');
const router = express.Router();
const Book = require('../models/book');

// Middleware function to get a single book by ID
async function getBook(req, res, next) {
  let book;
  try {
    book = await Book.findById(req.params.id);
    if (book == null) {
      return res.status(404).json({ message: 'Cannot find book' });
    }
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }

  res.book = book;
  next();
}

// Get one book
router.get('/:id', getBook, (req, res) => {
  res.json(res.book);
});

// Create a book
router.post('/', async (req, res) => {
  const book = new Book({
    name: req.body.name,
    author: req.body.author,
    availability: req.body.availability,
  });

  try {
    const newBook = await book.save(); // Fix: Use 'book' instead of 'body'
    res.status(201).json(newBook);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

module.exports = router;
