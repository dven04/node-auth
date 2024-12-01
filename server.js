require('dotenv').config();

const express = require('express');


const port = process.env.PORT;

const app = express();


app.get('/', (req, res) => {
    res.send('Blwdsmks');
});

//MIDDLEWARE
const bodyParser = require('body-parser');
const cors = require('cors');
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));

//CONTROLLERS
const userController =require('./controllers/userController.js')


//ROUTES
app.use('/users', userController);



app.listen(port, () => {
    console.log(`Server Connected to port ${port}`)
});
