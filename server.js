require('dotenv').config();

const express = require('express');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser')
const cors = require('cors');
const port = process.env.PORT;

const app = express();


app.get('/', (req, res) => {
    res.send('Blwdsmks');
});

//MIDDLEWARE
app.use(cors({
    origin :'http://192.168.0.42:8080',
    credentials: true
}));
app.use(cookieParser());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));

//CONTROLLERS
const userController =require('./controllers/userController.js')


//ROUTES
app.use('/users', userController);



app.listen(port, () => {
    console.log(`Server Connected to port ${port}`)
});
