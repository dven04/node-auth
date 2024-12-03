const express = require('express');
require('dotenv').config();
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser')
const Users = require('../models/userModel');
const authenticateJWT = require('../middleware/authMiddleware');

const SIKRIT = process.env.SIKRIT;

// REGISTER USER
router.post('/register', async (req, res) => {
    try {
        const { username, password, email } = req.body;
        console.log(req.body); // Consider removing this after debugging
        if (!username || !password || !email) {
            return res.status(400).json({ message: 'Please fill all fields' });
        }

        // Email validation (simple regex)
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({ message: 'Invalid email format' });
        }

        const hashedPassword = bcrypt.hashSync(password, bcrypt.genSaltSync(8));
        
        const user = new Users({
            username,
            password: hashedPassword,
            email
        });

        const result = await user.save();

        res.status(201).json({ message: 'User registered successfully' });
    } catch (error) {
        console.error('Error adding user:', error);
        res.status(500).json({ message: 'Failed to add user', error: error.message });
    }
});



// GET AUTHENTICATE USER
router.get('/fetch', authenticateJWT, async (req, res) => {
    try {
        const cookie = req.cookies['jwt'];

        console.log('JWT Cookie:', cookie);  // Log the cookie to check if it exists

        // Verify JWT token
        const claims = jwt.verify(cookie, process.env.SIKRIT);
        console.log('Decoded JWT Claims:', claims);  // Log the claims to verify the decoded JWT

        if (!claims) {
            return res.status(401).send({
                message: 'unauthenticated'
            });
        }

        // Create a Users instance with the id from the JWT claims
        const userInstance = new Users({ id: claims.id });

        // Fetch the user by id directly
        const result = await userInstance.getUserById();  // Use the id to fetch the user

        if (result.length === 0) {
            console.log('User not found for id:', claims.id);  // Log if the user is not found
            return res.status(404).json({ message: 'User not found' });
        }

        // Destructure to exclude the password field and return user data
        const { password, ...data } = result[0];  // Assuming result[0] contains the user data

        res.send(data);
    } catch (error) {
        console.error('Error fetching user:', error);
        res.status(500).json({ error: 'Internal Server Error', details: error.message });
    }
});


// LOGIN USER
router.post('/login', async (req, res) => {
    try {
        const { username, password } = req.body;
        if (!username || !password) {
            return res.status(400).json({ message: 'Please fill all fields' });
        }

        const user = new Users({ username });
        const result = await user.getUserByUsername();

        if (result.length === 0) {
            return res.status(404).json({ message: 'User not found' });
        }

        const match = bcrypt.compareSync(password, result[0].password);
        if (!match) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        // Generate JWT token and include 'SIKRIT' from .env
        const token = jwt.sign({ id: result[0].id }, process.env.SIKRIT);

        // Set JWT token in cookie
        res.cookie('jwt', token, {
            httpOnly: true,
            maxAge: 24 * 60 * 60 * 1000,  // 1 day
            // // secure: process.env.NODE_ENV === 'production', // Only set this in production
            // sameSite: 'Strict'  // Prevents the browser from sending the cookie in cross-site requests
        });
        

        res.json({ message: 'Login successful' });
    } catch (error) {
        console.error('Error logging in:', error);
        res.status(500).json({ message: 'Failed to login', error: error.message });
    }
});



// LOGOUT USER
router.post('/logout', (req, res) => {
    // Clear JWT cookie
    res.cookie('jwt', '', { maxAge: 0 });

    res.json({ message: 'Logout successful' });
});


module.exports = router;
