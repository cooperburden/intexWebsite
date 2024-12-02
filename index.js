const express = require('express');

const { Pool } = require('pg');

let path = require("path");

let security = false 

const app = express();

// Set EJS as the templating engine
app.set('view engine', 'ejs');

// Middleware to parse URL-encoded data
app.use(express.urlencoded({extended: true}));

app.use(express.static('public'));


const port = 3010;

// Route for the index.ejs file
app.get('/', (req, res) => {
    res.render('index'); // Render the index.ejs file
});

app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
