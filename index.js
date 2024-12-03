const express = require('express');

const { Pool } = require('pg');

let path = require("path");

let security = false 

const app = express();

// Set EJS as the templating engine
app.set('view engine', 'ejs');


const knexMain = require('knex') ({
    client : 'pg',
    connection : {
        host :  'localhost',
        user : 'postgres',
        password : 'Ilovemom2!',
        database : 'intexMain',
        port: 5432,
    }
})

const knexStaff = require('knex')({
    client: 'pg',
    connection: {
        host: 'localhost',
        user: 'postgres',
        password: 'Ilovemom2!',
        database: 'intexStaff', 
        port: 5432,
    }
});



// Middleware to parse URL-encoded data
app.use(express.urlencoded({extended: true}));

app.use(express.static('public'));


const port = 3010;

// Route for the index.ejs file
app.get('/', (req, res) => {
    res.render('index'); // Render the index.ejs file
});

// Route for the addEvent.ejs file
app.get('/addEvent', (req, res) => {
    res.render('addEvent'); // Render the addEvent.ejs file
});

app.get('/staffView', (req, res) => {
    res.render('staffView'); // Render the staffView.ejs file
});


app.get('/staffLogin', (req, res) => {
    res.render('staffLogin', { errorMessage: null }); // Pass errorMessage as null initially
});


app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});