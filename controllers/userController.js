const express = require('express');
require('dotenv').config();
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const Users = require('../models/userModel');

const SIKRIT = process.env.SIKRIT;

//REGISTER USER
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

        // const token = jwt.sign( {id: user.id}, 'sikrit' );

        // Generate JWT for the registered user
        // const token = jwt.sign({ id: result.insertId, username: user.username }, SECRET_KEY, { expiresIn: '1m' });

        res.status(201).json({ message: 'User registered successfully'});
    } catch (error) {
        console.error('Error adding user:', error);
        res.status(500).json({ message: 'Failed to add user', error: error.message });
    }
});


// GET ALL USER
router.get('/fetch' , async (req, res) => {
    try {
        const user = new Users();
        const result = await user.fetchUsers({});
        res.json(result);
        console.log(result);
    } catch (error) {

        console.error('Error fetching all users:', error);
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

        const user = new Users({username, password}); 
        const result = await user.getUserByUsername();

        if (result.length === 0) {
            return res.status(404).json({ message: 'User not found' });
        }

        const match = bcrypt.compareSync(password, result[0].password);
        if (!match) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        const token = jwt.sign( {id: user.id}, 'sikrit' )

        res.cookie('jwt', token, {
            httpOnly: true,
            maxAge: 24 * 60 * 60 * 1000
        })

        // const token = jwt.sign({ id: result[0].id, username: result[0].username }, SIKRIT, { expiresIn: '1h' });

        res.json({ message: 'Login successful'});
    } catch (error) {
        console.error('Error logging in:', error);
        res.status(500).json({ message: 'Failed to login', error: error.message });
    }
});

router.post('/logout',  (req, res ) => {
    res.cookie('jwt', '', {maxAge: 0})

    res.send({
        message: 'success'
    })
})


module.exports = router;
