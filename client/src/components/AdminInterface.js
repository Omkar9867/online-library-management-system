// src/components/AdminInterface.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';

function AdminInterface() {
  const [books, setBooks] = useState([]);
  const [newBook, setNewBook] = useState({
    name: '',
    author: '',
    availability: true,
  });

  useEffect(() => {
    // Assume you have some way to fetch user data from the backend after login
    // For simplicity, I'll use a mock user object with a role property
    const mockUser = {
      role: 'admin', // Change this to 'user' if you want to test the non-admin case
      // Other user information
    };

    if (mockUser.role === 'admin') {
      axios.get('http://localhost:5000/api/books')
        .then(response => setBooks(response.data))
        .catch(error => console.error('Error fetching books:', error));
    }
  }, []); // Only fetch books on component mount

  const handleAddBook = async () => {
    try {
      // Send a request to add a new book
      await axios.post('http://localhost:5000/api/books', newBook);
      // Fetch updated book list
      const response = await axios.get('http://localhost:5000/api/books');
      setBooks(response.data);
      // Reset the new book form
      setNewBook({
        name: '',
        author: '',
        availability: true,
      });
    } catch (error) {
      console.error('Error adding book:', error);
    }
  };

  const handleRemoveBook = async (bookId) => {
    try {
      // Send a request to remove the book
      await axios.delete(`http://localhost:5000/api/books/${bookId}`);
      // Fetch updated book list
      const response = await axios.get('http://localhost:5000/api/books');
      setBooks(response.data);
    } catch (error) {
      console.error('Error removing book:', error);
    }
  };

  const handleIssueBook = async (bookId) => {
    try {
      // Send a request to issue the book
      await axios.post(`http://localhost:5000/api/admin/issue/${bookId}`);
      // Fetch updated library catalog
      const response = await axios.get('http://localhost:5000/api/books');
      setBooks(response.data);
    } catch (error) {
      console.error('Error issuing book:', error);
    }
  };

  const handleReturnBook = async (bookId) => {
    try {
      // Send a request to return the book
      await axios.post(`http://localhost:5000/api/admin/return/${bookId}`);
      // Fetch updated library catalog
      const response = await axios.get('http://localhost:5000/api/books');
      setBooks(response.data);
    } catch (error) {
      console.error('Error returning book:', error);
    }
  };

  return (
    <div>
      <h2>Admin Interface</h2>
      <div>
        <h3>Library Catalog:</h3>
        <ul>
          {books.map(book => (
            <li key={book._id}>
              {book.name} by {book.author} - {book.availability ? 'Available' : 'Not Available'}
              <button onClick={() => handleIssueBook(book._id)}>Issue</button>
              <button onClick={() => handleReturnBook(book._id)}>Return</button>
              <button onClick={() => handleRemoveBook(book._id)}>Remove</button>
            </li>
          ))}
        </ul>
      </div>
      <div>
        <h3>Add New Book:</h3>
        <div>
          <label>Name:</label>
          <input type="text" value={newBook.name} onChange={(e) => setNewBook({ ...newBook, name: e.target.value })} />
        </div>
        <div>
          <label>Author:</label>
          <input type="text" value={newBook.author} onChange={(e) => setNewBook({ ...newBook, author: e.target.value })} />
        </div>
        <button onClick={handleAddBook}>Add Book</button>
      </div>
    </div>
  );
}

export default AdminInterface;
