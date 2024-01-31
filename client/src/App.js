// src/App.js
import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom'; // Import necessary components
import AdminInterface from './components/AdminInterface';
import UserInterface from './components/UserInterface';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/admin" element={<AdminInterface />} />
        <Route path="/user" element={<UserInterface />} />
      </Routes>
    </Router>
  );
}

export default App;
