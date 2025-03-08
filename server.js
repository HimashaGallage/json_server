const express = require('express');
const jwt = require('jsonwebtoken');
const bodyParser = require('body-parser');
const fs = require('fs');

const app = express();
const PORT = 3000;
const SECRET_KEY = 'your_secret_key';

app.use(bodyParser.json());

// Dummy user for authentication
const user = {
    id: 1,
    username: "user",
    email: "maria@mail.com",
    token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiYWRtaW4iOnRydWUsImlhdCI6MTUxNjIzOTAyMn0.KMUFsIDTnFmyG3nMiGM6H9FNFUROf3wh7SmqJp-QV30"
  }

// Login endpoint to get token
app.post('/login', (req, res) => {
    const { username, password } = req.body;
    if (username === 'user' && password === 'password') {
        return res.json(user);
    }
    res.status(401).json({ message: 'Invalid credentials' });
});

// Middleware to verify token
const authenticate = (req, res, next) => {
    const token = req.headers['authorization'];
    if (!token) return res.status(403).json({ message: 'Token required' })
    else {
        next();
    }
};  

// Protected route serving JSON data from products.json
app.get('/products', authenticate, (req, res) => {
  fs.readFile('products.json', 'utf8', (err, data) => {
      if (err) return res.status(500).json({ message: 'Error reading data' });
      
      const products = JSON.parse(data).products;
      let { page, limit } = req.query;
      page = parseInt(page) || 1;
      limit = parseInt(limit) || 10;
      
      const startIndex = (page - 1) * limit;
      const endIndex = startIndex + limit;
      const paginatedProducts = products.slice(startIndex, endIndex);
      
      res.json({ 
          page, 
          limit, 
          total: products.length,
          products: paginatedProducts 
      });
  });
});


// Protected route to get a specific product by ID
app.get('/products/:id', authenticate, (req, res) => {
  const productId = parseInt(req.params.id);
  
  fs.readFile('products.json', 'utf8', (err, data) => {
      if (err) return res.status(500).json({ message: 'Error reading data' });
      
      const products = JSON.parse(data).products;
      const product = products.find(p => p.id === productId);
      
      if (!product) {
          return res.status(404).json({ message: 'Product not found' });
      }
      
      res.json({ 
          product 
      });
  });
});

app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
