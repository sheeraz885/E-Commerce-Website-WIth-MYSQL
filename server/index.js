import express from 'express';
import cors from 'cors';
import mysql from 'mysql2/promise';

const app = express();
const PORT = 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Simple in-memory data for demo (when MySQL is not available)
let users = [
  { id: 1, name: 'Admin User', email: 'admin@admin.com', password: 'admin123', role: 'admin', created_at: new Date() },
  { id: 2, name: 'John Doe', email: 'user@user.com', password: 'user123', role: 'user', created_at: new Date() }
];

let categories = [
  { id: 1, name: 'Shirts', description: 'Stylish shirts for all occasions' },
  { id: 2, name: 'Pants', description: 'Comfortable and trendy pants' },
  { id: 3, name: 'Shoes', description: 'Quality footwear for every style' }
];

// Only 3 sample products
let products = [
  { id: 1, name: 'Classic White Shirt', description: 'Elegant white cotton shirt perfect for office and casual wear', price: 29.99, image_url: 'https://images.pexels.com/photos/996329/pexels-photo-996329.jpeg', stock: 50, category_id: 1 },
  { id: 2, name: 'Blue Denim Jeans', description: 'Comfortable blue denim jeans with modern fit', price: 49.99, image_url: 'https://images.pexels.com/photos/1598505/pexels-photo-1598505.jpeg', stock: 35, category_id: 2 },
  { id: 3, name: 'Black Leather Shoes', description: 'Premium black leather dress shoes for formal occasions', price: 89.99, image_url: 'https://images.pexels.com/photos/267301/pexels-photo-267301.jpeg', stock: 25, category_id: 3 }
];

let transactions = [
  { id: 1, user_id: 2, product_id: 1, quantity: 2, status: 'delivered', transaction_date: new Date('2024-01-15') },
  { id: 2, user_id: 2, product_id: 3, quantity: 1, status: 'shipped', transaction_date: new Date('2024-01-20') }
];

let orders = [
  { 
    id: 1, 
    user_id: 2, 
    user_name: 'John Doe',
    total_amount: 139.97,
    status: 'delivered',
    created_at: new Date('2024-01-15'),
    items: [
      { product_name: 'Classic White Shirt', quantity: 2, price: 29.99 },
      { product_name: 'Black Leather Shoes', quantity: 1, price: 89.99 }
    ]
  }
];

let contactMessages = [];

let nextUserId = 3;
let nextTransactionId = 3;
let nextProductId = 4;
let nextCategoryId = 4;
let nextOrderId = 2;
let nextContactId = 1;

// MySQL Connection
let db = null;

// Initialize database connection
async function initDB() {
  try {
    const dbConfig = {
      host: 'localhost',
      user: 'root',
      password: 'positive1$',
      database: 'ecommerce_db',
      connectTimeout: 5000, // 5 second timeout
      acquireTimeout: 5000,
      timeout: 5000
    };
    
    // Try to connect to MySQL with timeout
    db = await mysql.createConnection(dbConfig);
    
    // Test the connection
    await db.ping();
    
    console.log('✅ Connected to MySQL database');
    await createTables();
    await insertSampleData();
    console.log('✅ Database tables created and sample data inserted');
  } catch (error) {
    console.log('⚠️  MySQL not available, using in-memory data for demo');
    console.log('   This is normal if you don\'t have MySQL installed or running');
    db = null;
  }
}

// Create tables if MySQL is available
async function createTables() {
  if (!db) return;

  try {
    // Create Users table
    await db.execute(`
      CREATE TABLE IF NOT EXISTS Users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        email VARCHAR(100) UNIQUE NOT NULL,
        password VARCHAR(100) NOT NULL,
        role ENUM('admin', 'user') DEFAULT 'user',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create Categories table
    await db.execute(`
      CREATE TABLE IF NOT EXISTS Categories (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        description TEXT
      )
    `);

    // Create Products table
    await db.execute(`
      CREATE TABLE IF NOT EXISTS Products (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(200) NOT NULL,
        description TEXT,
        price DECIMAL(10, 2) NOT NULL,
        image_url VARCHAR(500),
        stock INT DEFAULT 0,
        category_id INT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (category_id) REFERENCES Categories(id)
      )
    `);

    // Create Transactions table
    await db.execute(`
      CREATE TABLE IF NOT EXISTS Transactions (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT,
        product_id INT,
        quantity INT NOT NULL,
        status ENUM('ordered', 'shipped', 'delivered', 'cancelled') DEFAULT 'ordered',
        transaction_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES Users(id),
        FOREIGN KEY (product_id) REFERENCES Products(id)
      )
    `);

    // Create Orders table
    await db.execute(`
      CREATE TABLE IF NOT EXISTS Orders (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT,
        total_amount DECIMAL(10, 2) NOT NULL,
        status ENUM('ordered', 'shipped', 'delivered', 'cancelled') DEFAULT 'ordered',
        delivery_info JSON,
        payment_method VARCHAR(50),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES Users(id)
      )
    `);

    // Create Order Items table
    await db.execute(`
      CREATE TABLE IF NOT EXISTS OrderItems (
        id INT AUTO_INCREMENT PRIMARY KEY,
        order_id INT,
        product_id INT,
        product_name VARCHAR(200),
        quantity INT NOT NULL,
        price DECIMAL(10, 2) NOT NULL,
        FOREIGN KEY (order_id) REFERENCES Orders(id),
        FOREIGN KEY (product_id) REFERENCES Products(id)
      )
    `);

    // Create Contact Messages table
    await db.execute(`
      CREATE TABLE IF NOT EXISTS ContactMessages (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        email VARCHAR(100) NOT NULL,
        subject VARCHAR(200) NOT NULL,
        message TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
  } catch (error) {
    console.error('Error creating tables:', error);
  }
}

// Insert sample data
async function insertSampleData() {
  if (!db) return;

  try {
    // Insert sample users
    await db.execute(`
      INSERT IGNORE INTO Users (id, name, email, password, role) VALUES 
      (1, 'Admin User', 'admin@admin.com', 'admin123', 'admin'),
      (2, 'John Doe', 'user@user.com', 'user123', 'user')
    `);

    // Insert sample categories
    await db.execute(`
      INSERT IGNORE INTO Categories (id, name, description) VALUES 
      (1, 'Shirts', 'Stylish shirts for all occasions'),
      (2, 'Pants', 'Comfortable and trendy pants'),
      (3, 'Shoes', 'Quality footwear for every style')
    `);

    // Insert sample products
    await db.execute(`
      INSERT IGNORE INTO Products (id, name, description, price, image_url, stock, category_id) VALUES 
      (1, 'Classic White Shirt', 'Elegant white cotton shirt perfect for office and casual wear', 29.99, 'https://images.pexels.com/photos/996329/pexels-photo-996329.jpeg', 50, 1),
      (2, 'Blue Denim Jeans', 'Comfortable blue denim jeans with modern fit', 49.99, 'https://images.pexels.com/photos/1598505/pexels-photo-1598505.jpeg', 35, 2),
      (3, 'Black Leather Shoes', 'Premium black leather dress shoes for formal occasions', 89.99, 'https://images.pexels.com/photos/267301/pexels-photo-267301.jpeg', 25, 3)
    `);

    // Insert sample transactions
    await db.execute(`
      INSERT IGNORE INTO Transactions (id, user_id, product_id, quantity, status, transaction_date) VALUES 
      (1, 2, 1, 2, 'delivered', '2024-01-15'),
      (2, 2, 3, 1, 'shipped', '2024-01-20')
    `);
  } catch (error) {
    console.error('Error inserting sample data:', error);
  }
}

// Helper function to get data from DB or memory
async function getFromDB(query, params = []) {
  if (db) {
    try {
      const [rows] = await db.execute(query, params);
      return rows;
    } catch (error) {
      console.error('Database query failed:', error);
      return null;
    }
  }
  return null;
}

// Authentication Routes
app.post('/api/signup', async (req, res) => {
  const { name, email, password, role = 'user' } = req.body;

  try {
    // Check if user exists in DB
    const existingUser = await getFromDB('SELECT id FROM Users WHERE email = ?', [email]);
    
    if (existingUser && existingUser.length > 0) {
      return res.status(400).json({ message: 'Account already exists' });
    }

    // Check in memory data as fallback
    const memoryUser = users.find(u => u.email === email);
    if (memoryUser) {
      return res.status(400).json({ message: 'Account already exists' });
    }

    // Create new user
    if (db) {
      await db.execute(
        'INSERT INTO Users (name, email, password, role) VALUES (?, ?, ?, ?)',
        [name, email, password, role]
      );
      const [newUser] = await db.execute('SELECT * FROM Users WHERE email = ?', [email]);
      return res.json({ user: newUser[0] });
    } else {
      // Use memory
      const newUser = {
        id: nextUserId++,
        name,
        email,
        password,
        role,
        created_at: new Date()
      };
      users.push(newUser);
      return res.json({ user: newUser });
    }
  } catch (error) {
    console.error('Signup error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

app.post('/api/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    // Check in DB first
    const dbUser = await getFromDB('SELECT * FROM Users WHERE email = ? AND password = ?', [email, password]);
    
    if (dbUser && dbUser.length > 0) {
      return res.json({ user: dbUser[0] });
    }

    // Check memory data
    const memoryUser = users.find(u => u.email === email && u.password === password);
    if (memoryUser) {
      return res.json({ user: memoryUser });
    }

    res.status(401).json({ message: 'Account not found. Please sign up first.' });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Product Routes
app.get('/api/products', async (req, res) => {
  try {
    const dbProducts = await getFromDB('SELECT * FROM Products');
    res.json(dbProducts || products);
  } catch (error) {
    res.json(products);
  }
});

app.get('/api/products/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const dbProduct = await getFromDB('SELECT * FROM Products WHERE id = ?', [id]);
    if (dbProduct && dbProduct.length > 0) {
      return res.json(dbProduct[0]);
    }
    
    const product = products.find(p => p.id === parseInt(id));
    if (product) {
      res.json(product);
    } else {
      res.status(404).json({ message: 'Product not found' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

app.post('/api/products', async (req, res) => {
  const { name, description, price, image_url, stock, category_id } = req.body;
  
  try {
    if (db) {
      await db.execute(
        'INSERT INTO Products (name, description, price, image_url, stock, category_id) VALUES (?, ?, ?, ?, ?, ?)',
        [name, description, price, image_url, stock, category_id]
      );
      const [newProduct] = await db.execute('SELECT * FROM Products WHERE name = ? ORDER BY id DESC LIMIT 1', [name]);
      res.json(newProduct[0]);
    } else {
      const newProduct = {
        id: nextProductId++,
        name,
        description,
        price: parseFloat(price),
        image_url,
        stock: parseInt(stock),
        category_id: parseInt(category_id),
        created_at: new Date()
      };
      products.push(newProduct);
      res.json(newProduct);
    }
  } catch (error) {
    console.error('Create product error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

app.put('/api/products/:id', async (req, res) => {
  const { id } = req.params;
  const { name, description, price, image_url, stock, category_id } = req.body;
  
  try {
    if (db) {
      await db.execute(
        'UPDATE Products SET name = ?, description = ?, price = ?, image_url = ?, stock = ?, category_id = ? WHERE id = ?',
        [name, description, price, image_url, stock, category_id, id]
      );
      const [updatedProduct] = await db.execute('SELECT * FROM Products WHERE id = ?', [id]);
      res.json(updatedProduct[0]);
    } else {
      const productIndex = products.findIndex(p => p.id === parseInt(id));
      if (productIndex !== -1) {
        products[productIndex] = {
          ...products[productIndex],
          name,
          description,
          price: parseFloat(price),
          image_url,
          stock: parseInt(stock),
          category_id: parseInt(category_id)
        };
        res.json(products[productIndex]);
      } else {
        res.status(404).json({ message: 'Product not found' });
      }
    }
  } catch (error) {
    console.error('Update product error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

app.delete('/api/products/:id', async (req, res) => {
  const { id } = req.params;
  
  try {
    if (db) {
      await db.execute('DELETE FROM Products WHERE id = ?', [id]);
      res.json({ message: 'Product deleted successfully' });
    } else {
      const productIndex = products.findIndex(p => p.id === parseInt(id));
      if (productIndex !== -1) {
        products.splice(productIndex, 1);
        res.json({ message: 'Product deleted successfully' });
      } else {
        res.status(404).json({ message: 'Product not found' });
      }
    }
  } catch (error) {
    console.error('Delete product error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Category Routes
app.get('/api/categories', async (req, res) => {
  try {
    const dbCategories = await getFromDB('SELECT * FROM Categories');
    res.json(dbCategories || categories);
  } catch (error) {
    res.json(categories);
  }
});

app.get('/api/categories/:id', async (req, res) => {
  const { id } = req.params;
  console.log(id);
  try {
    let category, productsByCategory;

    if (db) {
      const [catRows] = await db.execute('SELECT * FROM Categories WHERE id = ?', [id]);
      category = catRows[0] || null;
      const [prodRows] = await db.execute('SELECT * FROM Products WHERE category_id = ?', [id]);
      productsByCategory = prodRows;
    } else {
      category = categories.find(c => c.id === parseInt(id)) || null;
      productsByCategory = products.filter(p => p.category_id === parseInt(id));
    }

    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }

    res.json({ category, products: productsByCategory });
  } catch (error) {
    console.error('Error fetching category and products:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

app.post('/api/categories', async (req, res) => {
  const { name, description } = req.body;
  
  try {
    if (db) {
      await db.execute(
        'INSERT INTO Categories (name, description) VALUES (?, ?)',
        [name, description]
      );
      const [newCategory] = await db.execute('SELECT * FROM Categories WHERE name = ? ORDER BY id DESC LIMIT 1', [name]);
      res.json(newCategory[0]);
    } else {
      const newCategory = {
        id: nextCategoryId++,
        name,
        description
      };
      categories.push(newCategory);
      res.json(newCategory);
    }
  } catch (error) {
    console.error('Create category error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

app.put('/api/categories/:id', async (req, res) => {
  const { id } = req.params;
  const { name, description } = req.body;
  
  try {
    if (db) {
      await db.execute(
        'UPDATE Categories SET name = ?, description = ? WHERE id = ?',
        [name, description, id]
      );
      const [updatedCategory] = await db.execute('SELECT * FROM Categories WHERE id = ?', [id]);
      res.json(updatedCategory[0]);
    } else {
      const categoryIndex = categories.findIndex(c => c.id === parseInt(id));
      if (categoryIndex !== -1) {
        categories[categoryIndex] = {
          ...categories[categoryIndex],
          name,
          description
        };
        res.json(categories[categoryIndex]);
      } else {
        res.status(404).json({ message: 'Category not found' });
      }
    }
  } catch (error) {
    console.error('Update category error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

app.delete('/api/categories/:id', async (req, res) => {
  const { id } = req.params;
  
  try {
    if (db) {
      await db.execute('DELETE FROM Categories WHERE id = ?', [id]);
      res.json({ message: 'Category deleted successfully' });
    } else {
      const categoryIndex = categories.findIndex(c => c.id === parseInt(id));
      if (categoryIndex !== -1) {
        categories.splice(categoryIndex, 1);
        res.json({ message: 'Category deleted successfully' });
      } else {
        res.status(404).json({ message: 'Category not found' });
      }
    }
  } catch (error) {
    console.error('Delete category error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// User Routes (Admin only)
app.get('/api/users', async (req, res) => {
  try {
    
    const dbUsers = await getFromDB('SELECT id, name, email, role, created_at FROM Users');
    res.json(dbUsers || users.map(u => ({ ...u, password: undefined })));
  } catch (error) {
    res.json(users.map(u => ({ ...u, password: undefined })));
  }
});

app.put('/api/users/:id', async (req, res) => {
  const { id } = req.params;
  const { role } = req.body;
  
  try {
    if (db) {
      await db.execute('UPDATE Users SET role = ? WHERE id = ?', [role, id]);
      const [updatedUser] = await db.execute('SELECT id, name, email, role, created_at FROM Users WHERE id = ?', [id]);
      res.json(updatedUser[0]);
    } else {
      const userIndex = users.findIndex(u => u.id === parseInt(id));
      if (userIndex !== -1) {
        users[userIndex].role = role;
        const { password, ...userWithoutPassword } = users[userIndex];
        res.json(userWithoutPassword);
      } else {
        res.status(404).json({ message: 'User not found' });
      }
    }
  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Order Routes
app.get('/api/orders', async (req, res) => {
  const { user_id } = req.query;
  
  try {
    if (db) {
      let query = `
        SELECT o.*, u.name as user_name
        FROM Orders o
        JOIN Users u ON o.user_id = u.id
      `;
      let params = [];
      
      if (user_id) {
        query += ' WHERE o.user_id = ?';
        params.push(user_id);
      }
      
      query += ' ORDER BY o.created_at DESC';
      
      const dbOrders = await getFromDB(query, params);
      if (dbOrders) {
        // Get order items for each order
        for (let order of dbOrders) {
          const items = await getFromDB('SELECT * FROM OrderItems WHERE order_id = ?', [order.id]);
          order.items = items || [];
        }
        return res.json(dbOrders);
      }
    }
    
    // Use memory data
    let filteredOrders = orders;
    if (user_id) {
      filteredOrders = orders.filter(o => o.user_id === parseInt(user_id));
    }
    
    res.json(filteredOrders);
  } catch (error) {
    console.error('Get orders error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

app.post('/api/orders', async (req, res) => {
  const { user_id, items, delivery_info, payment_method, total_amount, status = 'ordered' } = req.body;
  
  try {
    if (db) {
      // Insert order
      await db.execute(
        'INSERT INTO Orders (user_id, total_amount, status, delivery_info, payment_method) VALUES (?, ?, ?, ?, ?)',
        [user_id, total_amount, status, JSON.stringify(delivery_info), payment_method]
      );
      
      // Get the new order ID
      const [orderResult] = await db.execute('SELECT LAST_INSERT_ID() as id');
      const orderId = orderResult[0].id;
      
      // Insert order items
      for (const item of items) {
        await db.execute(
          'INSERT INTO OrderItems (order_id, product_id, product_name, quantity, price) VALUES (?, ?, ?, ?, ?)',
          [orderId, item.id, item.name, item.quantity, item.price]
        );
      }
      
      res.json({ id: orderId, message: 'Order placed successfully' });
    } else {
      // Use memory
      const newOrder = {
        id: nextOrderId++,
        user_id: parseInt(user_id),
        total_amount: parseFloat(total_amount),
        status,
        delivery_info,
        payment_method,
        created_at: new Date(),
        items: items.map(item => ({
          product_name: item.name,
          quantity: item.quantity,
          price: item.price
        }))
      };
      
      // Get user name
      const user = users.find(u => u.id === parseInt(user_id));
      newOrder.user_name = user?.name || 'Unknown';
      
      orders.push(newOrder);
      res.json({ id: newOrder.id, message: 'Order placed successfully' });
    }
  } catch (error) {
    console.error('Create order error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

app.put('/api/orders/:id', async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  
  try {
    if (db) {
      await db.execute('UPDATE Orders SET status = ? WHERE id = ?', [status, id]);
      const [updatedOrder] = await db.execute(`
        SELECT o.*, u.name as user_name
        FROM Orders o
        JOIN Users u ON o.user_id = u.id
        WHERE o.id = ?
      `, [id]);
      res.json(updatedOrder[0]);
    } else {
      const orderIndex = orders.findIndex(o => o.id === parseInt(id));
      if (orderIndex !== -1) {
        orders[orderIndex].status = status;
        res.json(orders[orderIndex]);
      } else {
        res.status(404).json({ message: 'Order not found' });
      }
    }
  } catch (error) {
    console.error('Update order error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Transaction Routes (Legacy - keeping for compatibility)
app.get('/api/transactions', async (req, res) => {
  const { user_id } = req.query;
  
  try {
    if (db) {
      let query = `
        SELECT t.*, u.name as user_name, p.name as product_name, p.price
        FROM Transactions t
        JOIN Users u ON t.user_id = u.id
        JOIN Products p ON t.product_id = p.id
      `;
      let params = [];
      
      if (user_id) {
        query += ' WHERE t.user_id = ?';
        params.push(user_id);
      }
      
      query += ' ORDER BY t.transaction_date DESC';
      
      const dbTransactions = await getFromDB(query, params);
      if (dbTransactions) {
        return res.json(dbTransactions);
      }
    }
    
    // Use memory data
    let filteredTransactions = transactions;
    if (user_id) {
      filteredTransactions = transactions.filter(t => t.user_id === parseInt(user_id));
    }
    
    const enrichedTransactions = filteredTransactions.map(t => {
      const user = users.find(u => u.id === t.user_id);
      const product = products.find(p => p.id === t.product_id);
      return {
        ...t,
        user_name: user?.name || 'Unknown',
        product_name: product?.name || 'Unknown',
        price: product?.price || 0
      };
    });
    
    res.json(enrichedTransactions);
  } catch (error) {
    console.error('Get transactions error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

app.post('/api/transactions', async (req, res) => {
  const { user_id, product_id, quantity } = req.body;
  
  try {
    if (db) {
      await db.execute(
        'INSERT INTO Transactions (user_id, product_id, quantity, status) VALUES (?, ?, ?, ?)',
        [user_id, product_id, quantity, 'ordered']
      );
      const [newTransaction] = await db.execute(`
        SELECT t.*, u.name as user_name, p.name as product_name, p.price
        FROM Transactions t
        JOIN Users u ON t.user_id = u.id
        JOIN Products p ON t.product_id = p.id
        WHERE t.user_id = ? AND t.product_id = ?
        ORDER BY t.id DESC LIMIT 1
      `, [user_id, product_id]);
      res.json(newTransaction[0]);
    } else {
      const newTransaction = {
        id: nextTransactionId++,
        user_id: parseInt(user_id),
        product_id: parseInt(product_id),
        quantity: parseInt(quantity),
        status: 'ordered',
        transaction_date: new Date()
      };
      transactions.push(newTransaction);
      
      const user = users.find(u => u.id === newTransaction.user_id);
      const product = products.find(p => p.id === newTransaction.product_id);
      
      const enrichedTransaction = {
        ...newTransaction,
        user_name: user?.name || 'Unknown',
        product_name: product?.name || 'Unknown',
        price: product?.price || 0
      };
      
      res.json(enrichedTransaction);
    }
  } catch (error) {
    console.error('Create transaction error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

app.put('/api/transactions/:id', async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  
  try {
    if (db) {
      await db.execute('UPDATE Transactions SET status = ? WHERE id = ?', [status, id]);
      const [updatedTransaction] = await db.execute(`
        SELECT t.*, u.name as user_name, p.name as product_name, p.price
        FROM Transactions t
        JOIN Users u ON t.user_id = u.id
        JOIN Products p ON t.product_id = p.id
        WHERE t.id = ?
      `, [id]);
      res.json(updatedTransaction[0]);
    } else {
      const transactionIndex = transactions.findIndex(t => t.id === parseInt(id));
      if (transactionIndex !== -1) {
        transactions[transactionIndex].status = status;
        
        const user = users.find(u => u.id === transactions[transactionIndex].user_id);
        const product = products.find(p => p.id === transactions[transactionIndex].product_id);
        
        const enrichedTransaction = {
          ...transactions[transactionIndex],
          user_name: user?.name || 'Unknown',
          product_name: product?.name || 'Unknown',
          price: product?.price || 0
        };
        
        res.json(enrichedTransaction);
      } else {
        res.status(404).json({ message: 'Transaction not found' });
      }
    }
  } catch (error) {
    console.error('Update transaction error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Contact Routes
app.post('/api/contact', async (req, res) => {
  const { name, email, subject, message } = req.body;
  
  try {
    if (db) {
      await db.execute(
        'INSERT INTO ContactMessages (name, email, subject, message) VALUES (?, ?, ?, ?)',
        [name, email, subject, message]
      );
    } else {
      const newMessage = {
        id: nextContactId++,
        name,
        email,
        subject,
        message,
        created_at: new Date()
      };
      contactMessages.push(newMessage);
    }
    
    res.json({ message: 'Message sent successfully' });
  } catch (error) {
    console.error('Contact form error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Analytics Routes
app.get('/api/analytics', async (req, res) => {
  const { range = '6months' } = req.query;
  
  try {
    // Mock analytics data for demo
    const analyticsData = {
      monthlyRevenue: [
        { month: 'Jan', revenue: 4500, orders: 45 },
        { month: 'Feb', revenue: 5200, orders: 52 },
        { month: 'Mar', revenue: 4800, orders: 48 },
        { month: 'Apr', revenue: 6100, orders: 61 },
        { month: 'May', revenue: 7300, orders: 73 },
        { month: 'Jun', revenue: 8200, orders: 82 }
      ],
      topProducts: [
        { name: 'Classic White Shirt', sales: 156, revenue: 4680 },
        { name: 'Blue Denim Jeans', sales: 134, revenue: 6698 },
        { name: 'Black Leather Shoes', sales: 98, revenue: 8820 },
        { name: 'Summer Dress', sales: 87, revenue: 3480 },
        { name: 'Casual Sneakers', sales: 76, revenue: 4560 }
      ],
      ordersByStatus: [
        { status: 'Delivered', count: 245, color: '#10B981' },
        { status: 'Shipped', count: 67, color: '#3B82F6' },
        { status: 'Ordered', count: 34, color: '#F59E0B' },
        { status: 'Cancelled', count: 12, color: '#EF4444' }
      ],
      totalStats: {
        totalRevenue: 36100,
        totalOrders: 358,
        totalProducts: products.length,
        totalCustomers: users.length
      }
    };
    
    res.json(analyticsData);
  } catch (error) {
    console.error('Analytics error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Initialize database and start server
initDB().then(() => {
  app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
    console.log('📧 Demo accounts:');
    console.log('   Admin: admin@admin.com / admin123');
    console.log('   User: user@user.com / user123');
    if (db) {
      console.log('💾 Using MySQL database');
    } else {
      console.log('💾 Using in-memory data (MySQL not available)');
    }
  });
});