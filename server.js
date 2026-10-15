const express = require('express');
const mysql = require('mysql2');
const bcrypt = require('bcryptjs');
const cors = require('cors');

const app = express();
const PORT = 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Serve the HTML file from the 'public' folder
app.use(express.static('public'));

// MySQL Connection Setup
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',              // Replace with your MySQL username
    password: 'admin',   // Replace with your MySQL password
    database: 'user_db'
});

db.connect((err) => {
    if (err) {
        console.error('MySQL connection error:', err);
        return;
    }
    console.log('Connected to MySQL database.');
});

// Route to handle storing user data
app.post('/api/users', async (req, res) => {
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
        return res.status(400).json({ error: 'All fields are required.' });
    }

    try {
        // Hash the password before storing
        const hashedPassword = await bcrypt.hash(password, 10);

        const sql = 'INSERT INTO users (username, email, password_hash) VALUES (?, ?, ?)';
        
        db.query(sql, [username, email, hashedPassword], (err, result) => {
            if (err) {
                if (err.code === 'ER_DUP_ENTRY') {
                    return res.status(400).json({ error: 'Email already exists.' });
                }
                console.error('Error inserting data:', err);
                return res.status(500).json({ error: 'Database insertion failed.' });
            }

            res.status(201).json({
                message: 'User registered successfully!',
                userId: result.insertId
            });
        });
    } catch (err) {
        res.status(500).json({ error: 'Server error processing password.' });
    }
});

// Start Server
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});