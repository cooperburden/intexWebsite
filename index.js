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
        password: 'password',
        database: 'intexemployee', 
        port: 5432,
    }
});

knexStaff.raw('SELECT 1+1 AS result')
    .then(() => console.log('Database connection successful'))
    .catch(error => {
        console.error('Database connection failed:', error);
    });

app.get('/staffView', (req, res) => {
    knexStaff('employeetable') // Fetching from the `employee` table in the `intexStaff` database
      .select(
        'emp_id',
        'emp_first_name',
        'emp_last_name',
        'emp_email',
        'emp_phone',
        'emp_username',
        'emp_password'
      )
      .orderBy('emp_id', 'asc')
      .then(employeeData => {
        res.render('staffView', {employees: employeeData});
      })
      .catch(error => {
        console.error('Error querying database:', error);
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

// Route for the addEvent.ejs file
app.get('/addEmployee', (req, res) => {
    res.render('addEmployee'); // Render the addEvent.ejs file
});

app.post('/addEmployee', async (req, res) => {
    const { firstName, lastName, email, phone, username, password } = req.body;

    try {
        // Check if the username already exists
        const existingUser = await knexStaff('employeetable')
            .select('emp_username')
            .where('emp_username', username)
            .first();

        if (existingUser) {
            // If username exists, send an error message
            return res.status(400).send('Username is already taken. Please choose a different username.');
        }

        // Insert the new employee into the database
        await knexStaff('employeetable').insert({
            emp_first_name: firstName,
            emp_last_name: lastName,
            emp_email: email,
            emp_phone: phone,
            emp_username: username,
            emp_password: password
        });

        console.log('Employee added successfully');
        res.redirect('/staffView'); // Redirect to the employee records page
    } catch (error) {
        console.error('Error adding employee:', error);
        res.status(500).send('An error occurred while adding the employee.');
    }
});


// Route to handle employee deletion
app.post('/deleteEmployee/:id', async (req, res) => {
    const employeeId = req.params.id;

    try {
        // Delete the employee record from the database
        await knexStaff('employeetable')
            .where('emp_id', employeeId)
            .del();

        console.log(`Employee with ID ${employeeId} deleted successfully`);
        res.redirect('/staffView'); // Redirect back to the employee records page
    } catch (error) {
        console.error('Error deleting employee:', error);
        res.status(500).send('An error occurred while deleting the employee.');
    }
});
  


app.get('/editEmployee/:id', async (req, res) => {
    const employeeId = req.params.id;

    try {
        // Fetch the employee's current data
        const employee = await knexStaff('employeetable')
            .select('emp_id', 'emp_first_name', 'emp_last_name', 'emp_email', 'emp_phone', 'emp_username')
            .where('emp_id', employeeId)
            .first();

        if (!employee) {
            return res.status(404).send('Employee not found');
        }

        // Render the editEmployee view with the employee data
        res.render('editEmployee', { employee });
    } catch (error) {
        console.error('Error fetching employee:', error);
        res.status(500).send('An error occurred while fetching the employee data.');
    }
});


app.post('/editEmployee/:id', async (req, res) => {
    const employeeId = req.params.id;
    const { firstName, lastName, email, phone, username } = req.body;

    try {
        // Update the employee data in the database
        await knexStaff('employeetable')
            .where('emp_id', employeeId)
            .update({
                emp_first_name: firstName,
                emp_last_name: lastName,
                emp_email: email,
                emp_phone: phone,
                emp_username: username
            });

        console.log(`Employee with ID ${employeeId} updated successfully`);
        res.redirect('/staffView'); // Redirect back to the employee records page
    } catch (error) {
        console.error('Error updating employee:', error);
        res.status(500).send('An error occurred while updating the employee.');
    }
});



// Handle login form submission
app.post("/staffLogin", async (req, res) => {
    const { username, password } = req.body;
 
 
    try {
        // Query the employee table using Knex
        const employee = await knexStaff("employeetable")
            .select("emp_username", "emp_password")
            .where({ emp_username: username, emp_password: password })
            .first();
 
 
        if (employee) {
            // Redirect to staffView.ejs if login is successful
            res.render("staffView", { user: `${employee.emp_first_name} ${employee.emp_last_name}` });
        } else {
            // If no match, reload login with error message and clear inputs
            res.render("staffLogin", {
                error: "Invalid username or password",
                username: "",
                password: "",
            });
        }
    } catch (err) {
        console.error("Error during login process:", err);
        res.status(500).send("Internal Server Error");
    }
 });
 






app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});