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
        database: 'intexemployee', 
        port: 5432,
    }
});

app.get('/staffView', (req, res) => {
    // Fetch employee data
    const employeeQuery = knexStaff('employee')
      .select(
        'emp_id',
        'emp_first_name',
        'emp_last_name',
        'emp_email',
        'emp_phone',
        'emp_username',
        'emp_password'
      );

    // Fetch event data
    const eventQuery = knexMain('events')
      .select(
        'event_id',
        'event_name',
        'date_of_event',
        'event_address',
        'event_city',
        'event_state',
        'event_zip',
        'event_description',
        'estimated_attendance',
        'actual_attendance',
        'estimated_event_duration',
        'actual_event_duration',
        'privacy',
        'number_of_sewers',
        'number_of_machines',
        'number_of_children_under_10'
      );

    // Run both queries in parallel and combine results
    Promise.all([employeeQuery, eventQuery])
      .then(([employees, events]) => {
        res.render('staffView', { employees, events });
      })
      .catch(error => {
        console.error('Error querying database:', error);
        res.status(500).send('An error occurred while retrieving data.');
      });
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


app.get('/staffLogin', (req, res) => {
    res.render('staffLogin', { errorMessage: null }); // Pass errorMessage as null initially
});


app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});