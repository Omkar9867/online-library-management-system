// src/components/UserInterface.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';

function UserInterface({ accessToken }) {
  const [books, setBooks] = useState([]);
  const [transactions, setTransactions] = useState([]);

  const handleIssueBook = async (bookId) => {
    try {
      // Send a request to issue the book
      await axios.post(`http://localhost:5000/api/user/issue/${bookId}`, {}, { headers: { Authorization: `Bearer ${accessToken}` } });
      // Fetch updated transaction history
      const response = await axios.get('http://localhost:5000/api/user/transactions', { headers: { Authorization: `Bearer ${accessToken}` } });
      setTransactions(response.data);
    } catch (error) {
      console.error('Error issuing book:', error);
    }
  };

  const handleReturnBook = async (bookId) => {
    try {
      // Send a request to return the book
      await axios.post(`http://localhost:5000/api/user/return/${bookId}`, {}, { headers: { Authorization: `Bearer ${accessToken}` } });
      // Fetch updated transaction history
      const response = await axios.get('http://localhost:5000/api/user/transactions', { headers: { Authorization: `Bearer ${accessToken}` } });
      setTransactions(response.data);
    } catch (error) {
      console.error('Error returning book:', error);
    }
  };

  useEffect(() => {
    // Fetch books from the backend
    axios.get('http://localhost:5000/api/books')
      .then(response => setBooks(response.data))
      .catch(error => console.error('Error fetching books:', error));

    // Fetch user transactions from the backend
    axios.get('http://localhost:5000/api/user/transactions', { headers: { Authorization: `Bearer ${accessToken}` } })
      .then(response => setTransactions(response.data))
      .catch(error => console.error('Error fetching transactions:', error));
  }, [accessToken]);

  return (
    <div>
      <h2>User Interface</h2>
      <div>
        <h3>Library Catalog:</h3>
        <ul>
          {books.map(book => (
            <li key={book._id}>
              {book.name} by {book.author} - {book.availability ? 'Available' : 'Not Available'}
              <button onClick={() => handleIssueBook(book._id)} disabled={!book.availability}>Issue</button>
              <button onClick={() => handleReturnBook(book._id)} disabled={book.availability}>Return</button>
            </li>
          ))}
        </ul>
      </div>
      <div>
        <h3>Transaction History:</h3>
        <ul>
          {transactions.map(transaction => (
            <li key={transaction._id}>
              {transaction.type === 'borrowed' ? 'Borrowed' : 'Returned'} - {transaction.book.name}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export default UserInterface;
