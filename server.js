const express = require('express');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const dotenv = require('dotenv');
const userRoutes = require('./routes/userRoutes'); // Import routes

dotenv.config();
const app = express();
const port = process.env.PORT || 4001;

// Middleware
app.use(cors({ origin: 'http://192.168.0.42:8080', credentials: true }));
app.use(cookieParser());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Routes
app.use('/users', userRoutes); // Mount user routes

// Default Route
app.get('/', (req, res) => {
    res.send('Blwdsmks');
});

// Start Server
app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
