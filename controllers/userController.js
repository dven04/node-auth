const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const Users = require('../models/userModel');

const SIKRIT = process.env.SIKRIT;

// REGISTER USER
const createUser = async (req, res) => {
    try {
        const { username, password, email } = req.body;

        if (!username || !password || !email) {
            return res.status(400).json({ message: 'Please fill all fields' });
        }

        // Email validation (simple regex)
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({ message: 'Invalid email format' });
        }

        // Check if username or email already exists
        const existingUsername = await Users.findByUsername(username); // You may want to implement this function
        if (existingUsername) {
            return res.status(400).json({ message: 'Username already in use' });
        }
        const existingUserEmail = await Users.findByUserEmail(email); // You may want to implement this function
        if (existingUserEmail) {
            return res.status(400).json({ message: 'Email already in use' });
        }

        // Create a new user instance
        const user = new Users({ username, password, email });

        // Use 'create' method (password is hashed inside the model)
        await user.create();

        res.status(201).json({ message: 'User registered successfully' });
    } catch (error) {
        console.error('Error adding user:', error);

        // Handle the unique constraint error
        if (error.code === 'ER_DUP_ENTRY') {
            return res.status(400).json({ message: 'Username or Email already in use' });
        }

        res.status(500).json({ message: 'Failed to add user', error: error.message });
    }
};

// GET AUTHENTICATED USER
const fetchUser = async (req, res) => {
    try {
        const cookie = req.cookies['jwt'];

        if (!cookie) {
            return res.status(401).send({ message: 'Unauthenticated: No Token Provided' });
        }

        let claims;
        try {
            claims = jwt.verify(cookie, process.env.SIKRIT);
        } catch (err) {
            return res.status(401).send({ message: 'Invalid or expired token' });
        }

        // Fetch the user by ID
        const userInstance = new Users({ id: claims.id });
        const result = await userInstance.findById();

        if (!result) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Exclude the password field
        const { password, ...data } = result;
        res.json(data);
    } catch (error) {
        console.error('Error fetching user:', error);
        res.status(500).json({ error: 'Internal Server Error', details: error.message });
    }
};

// LOGIN USER
const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(400).json({ message: 'Please fill all fields' });
        }

        const user = new Users({ email });
        const result = await user.findByUserEmail();

        if (!result) {
            return res.status(404).json({ message: 'User not found' });
        }

        const match = bcrypt.compareSync(password, result.password);
        if (!match) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        // Generate JWT token
        const token = jwt.sign({ id: result.id }, process.env.SIKRIT, { expiresIn: '1h' });

        // Set JWT token in cookie
        res.cookie('jwt', token, {
            httpOnly: true,
            maxAge: 24 * 60 * 60 * 1000, // 1 day
        });

        res.json({ message: 'Login successful' });
    } catch (error) {
        console.error('Error logging in:', error);
        res.status(500).json({ message: 'Failed to login', error: error.message });
    }
};

//UPDATE USER 
const updateUser = async (req, res) => {
    try {
        const { username, password, email } = req.body;
        const user = new Users({ id: req.user.id, username, password, email });  // Assuming req.user.id is the logged-in user's ID

        // Call the update method on the user model
        await user.update();

        res.status(200).json({ message: 'User updated successfully' });
    } catch (error) {
        console.error('Error updating user:', error);
        res.status(500).json({ message: 'Failed to update user', error: error.message });
    }
};

// LOGOUT USER
const logoutUser = (req, res) => {
    res.cookie('jwt', '', { maxAge: 0 }); // Clear the cookie
    res.json({ message: 'Logout successful' });
};

module.exports = { createUser, fetchUser, loginUser, logoutUser, updateUser};
