const express = require('express');
require('dotenv').config();
const router = express.Router();
const bcrypt = require('bcrypt');
// const jwt = require('jsonwebtoken');
const Users = require('../models/userModel');


router.post('/register', async (req, res) => {
    try {
        const { id, username, password, email} = req.body;
        console.log(req.body);
        if (!username || !password || !email) {
            return res.status(400).json({ message: 'Please fill all fields' });
        }

        const hashedPassword = bcrypt.hashSync(password, bcrypt.genSaltSync(8));

        
        const user = new Users({
            id,
            username,
            password: hashedPassword,
            email
        });
        console.log('User values before saving:', {
            id: user.id,
            username: user.username,
            password: user.password,
            email: user.email
        });
            
        const result = await user.save();

        // Generate JWT for the registered user
        // const token = jwt.sign({ id: result.insertId, username: user.username }, SECRET_KEY, { expiresIn: '1m' });

        res.status(201).json({ message: 'User registered successfully' });
    } catch (error) {
        console.error('Error adding user:', error);
        res.status(500).json({ message: 'Failed to add user', error: error.message });
    }
});


module.exports = router;
