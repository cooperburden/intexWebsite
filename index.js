const express = require('express');
const path = require('path');

const app = express();

// Set EJS as the templating engine
app.set('view engine', 'ejs');

// Database connections
const knexMain = require('knex')({
    client: 'pg',
    connection: {
        host: 'localhost',
        user: 'postgres',
        password: 'password',
        database: 'intexMain',
        port: 5432,
    },
});

const knexStaff = require('knex')({
    client: 'pg',
    connection: {
        host: 'localhost',
        user: 'postgres',
<<<<<<< HEAD
        password: 'Ilovemom2!',
        database: 'intexemployee', 
=======
        password: 'password',
        database: 'intexemployee',
>>>>>>> 10b71026eeb07290704a0c98efce333e01d259d8
        port: 5432,
    },
});

<<<<<<< HEAD
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
=======
// Confirm database connection
knexStaff.raw('SELECT 1+1 AS result')
    .then(() => console.log('Database connection successful'))
    .catch((error) => console.error('Database connection failed:', error));
>>>>>>> 10b71026eeb07290704a0c98efce333e01d259d8

// Middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));
app.use(express.json());

// Server port
const port = 3010;

// Routes
// Home route
app.get('/', (req, res) => {
    res.render('index'); // Render the index.ejs file
});

// Staff login route
app.get('/staffLogin', (req, res) => {
    res.render('staffLogin', { errorMessage: null });
});

<<<<<<< HEAD
// Handle login form submission
app.post("/StaffLogin", async (req, res) => {
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



app.post("/staffLogin", async (req, res) => {
=======
app.post('/staffLogin', async (req, res) => {
>>>>>>> 10b71026eeb07290704a0c98efce333e01d259d8
    const { emp_username, emp_password } = req.body;

    try {
        const employee = await knexStaff('employeetable')
            .select('emp_username', 'emp_password', 'emp_first_name', 'emp_last_name')
            .where({ emp_username, emp_password })
            .first();

        if (employee) {
            console.log('Employee found:', employee);

            // Fetch all events
            const events = await knexMain('events').select('*');
            
            // Filter and sort events
            const pastEvents = events
                .filter(event => event.completed)
                .sort((a, b) => new Date(b.date_of_event) - new Date(a.date_of_event));
            
            const upcomingEvents = events
                .filter(event => !event.completed)
                .sort((a, b) => new Date(a.date_of_event) - new Date(b.date_of_event));

            // Fetch all employees
            const employees = await knexStaff('employeetable').select('*')
            .orderBy('emp_id', 'asc');;

            // Pass data to the template
            res.render('staffView', {
                user: `${employee.emp_first_name} ${employee.emp_last_name}`,
                employees,
                pastEvents,
                upcomingEvents,
            });
        } else {
            res.render('staffLogin', { errorMessage: 'Invalid username or password' });
        }
    } catch (err) {
        console.error('Error during login:', err);
        res.status(500).send('Internal Server Error');
    }
});

// Add Employee routes
app.get('/addEmployee', (req, res) => {
    res.render('addEmployee');
});

app.post('/addEmployee', async (req, res) => {
    const { firstName, lastName, email, phone, username, password } = req.body;

    try {
        const existingUser = await knexStaff('employeetable')
            .select('emp_username')
            .where('emp_username', username)
            .first();

        if (existingUser) {
            return res.status(400).send('Username is already taken.');
        }

        await knexStaff('employeetable').insert({
            emp_first_name: firstName,
            emp_last_name: lastName,
            emp_email: email,
            emp_phone: phone,
            emp_username: username,
            emp_password: password,
        });

        console.log('Employee added successfully');
        res.redirect('/staffView');
    } catch (error) {
        console.error('Error adding employee:', error);
        res.status(500).send('An error occurred while adding the employee.');
    }
});

// Delete Employee route
app.post('/deleteEmployee/:id', async (req, res) => {
    const employeeId = req.params.id;

    try {
        await knexStaff('employeetable').where('emp_id', employeeId).del();
        console.log(`Employee with ID ${employeeId} deleted successfully`);
        res.redirect('/staffView');
    } catch (error) {
        console.error('Error deleting employee:', error);
        res.status(500).send('An error occurred while deleting the employee.');
    }
});

// Edit Employee routes
app.get('/editEmployee/:id', async (req, res) => {
    const employeeId = req.params.id;

    try {
        const employee = await knexStaff('employeetable')
            .select('emp_id', 'emp_first_name', 'emp_last_name', 'emp_email', 'emp_phone', 'emp_username')
            .where('emp_id', employeeId)
            .first();

        if (!employee) return res.status(404).send('Employee not found');

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
        await knexStaff('employeetable')
            .where('emp_id', employeeId)
            .update({
                emp_first_name: firstName,
                emp_last_name: lastName,
                emp_email: email,
                emp_phone: phone,
                emp_username: username,
            });

        console.log(`Employee with ID ${employeeId} updated successfully`);
        res.redirect('/staffView');
    } catch (error) {
        console.error('Error updating employee:', error);
        res.status(500).send('An error occurred while updating the employee.');
    }
});

// Staff View route
app.get('/staffView', async (req, res) => {
    try {
        const employees = await knexStaff('employeetable')
            .select('*')
            .orderBy('emp_id', 'asc');

        const events = await knexMain('events')
            .select('*');

        // Filter and sort events
        const pastEvents = events
            .filter(event => event.completed)
            .sort((a, b) => new Date(b.date_of_event) - new Date(a.date_of_event)); // Most recent first

        const upcomingEvents = events
            .filter(event => !event.completed)
            .sort((a, b) => new Date(a.date_of_event) - new Date(b.date_of_event)); // Oldest first

        // Pass past and upcoming events separately
        res.render('staffView', { employees, pastEvents, upcomingEvents });
    } catch (error) {
        console.error('Error fetching staff view:', error);
        res.status(500).send('An error occurred while fetching staff view.');
    }
});


// Edit Upcoming Events routes
app.get('/editUpcomingEvent/:id', async (req, res) => {
    const eventId = req.params.id;

    try {
        const event = await knexMain('events')
            .select('event_id', 'event_name', 'date_of_event', 'actual_attendance', 'completed')
            .where('event_id', eventId)
            .first();

        if (!event) return res.status(404).send('Event not found');

        res.render('editUpcomingEvent', { event });
    } catch (error) {
        console.error('Error fetching event:', error);
        res.status(500).send('An error occurred while fetching the event data.');
    }
});

app.post('/editUpcomingEvent/:id', async (req, res) => {
    const eventId = req.params.id;
    const { actual_attendance, completed } = req.body;

    try {
        const result = await knexMain('events')
            .where('event_id', eventId)
            .update({
                actual_attendance: actual_attendance || null,
                completed: completed === 'yes',
            });

        if (result === 0) {
            console.error(`No rows updated for event ID ${eventId}`);
        }

        res.redirect('/staffView');
    } catch (error) {
        console.error('Error updating event:', error);
        res.status(500).send('An error occurred while updating the event.');
    }
});

app.get('/editPastEvent/:id', async (req, res) => {
    const eventId = req.params.id;

    try {
        // Fetch the event's current data
        const event = await knexMain('events')
            .select('event_id', 'event_name', 'date_of_event', 'actual_attendance', 'actual_event_duration', 'completed')
            .where('event_id', eventId)
            .first();

        if (!event) {
            return res.status(404).send('Event not found');
        }

        // Render the editPastEvent view with the event data
        res.render('editPastEvent', { event });
    } catch (error) {
        console.error('Error fetching past event:', error);
        res.status(500).send('An error occurred while fetching the event data.');
    }
});

app.post('/editPastEvent/:id', async (req, res) => {
    const eventId = req.params.id;
    const { actual_attendance, actual_event_duration, completed } = req.body;

    console.log('Received data:', { eventId, actual_attendance, actual_event_duration, completed });

    try {
        // Update the event in the database
        const result = await knexMain('events')
            .where('event_id', eventId)
            .update({
                actual_attendance: actual_attendance || null, // Handle empty input
                actual_event_duration: actual_event_duration || null, // Handle empty input
                completed: completed === 'yes', // Convert 'yes'/'no' to boolean
            });

        console.log('Update result:', result); // Log the number of rows updated

        if (result === 0) {
            console.error(`No rows updated for event ID ${eventId}`);
            return res.status(404).send('Event not found or no changes made.');
        }

        res.redirect('/staffView'); // Redirect back to the main page
    } catch (error) {
        console.error('Error updating past event:', error);
        res.status(500).send('An error occurred while updating the event.');
    }
});


// Render the "Add Event" form
app.get('/addEvent', (req, res) => {
    res.render('addEvent');
});


// POST route to handle form submission
app.post('/addEvent', async (req, res) => {
    try {
        // Extract data from the form
        const {
            first_name,
            last_name,
            d_email,
            phone_number,
            event_name,
            date_of_event,
            secondary_event_date,
            street_address,
            city,
            state,
            zip,
            expected_attendance,
            estimated_event_duration,
            event_description,
            sew_option,
            sewing_people,
            sewing_machines,
            children_option,
            children_count,
            privacy,
        } = req.body;

        // Start a transaction
        await knexMain.transaction(async (trx) => {
            // Check if the participant already exists
            let participant = await trx('participants')
                .where({ email : d_email })
                .first();

            let participant_id;

            if (participant) {
                participant_id = participant.participant_id;
            } else {
                // Insert new participant
                const [newParticipant] = await trx('participants')
                    .insert({
                        first_name,
                        last_name,
                        email : d_email,
                        phone_number,
                        role_id: 1, // Assuming 'Organizer' role has role_id = 1
                        sews: sew_option === 'yes',
                    })
                    .returning('participant_id');
                participant_id = newParticipant.participant_id;
            }

            // Map expected attendance range to approximate value
            let estimated_attendance;
            switch (expected_attendance) {
                case '0-10':
                    estimated_attendance = 5;
                    break;
                case '10-30':
                    estimated_attendance = 20;
                    break;
                case '30-50':
                    estimated_attendance = 40;
                    break;
                case '50-100':
                    estimated_attendance = 75;
                    break;
                case '100+':
                    estimated_attendance = 100;
                    break;
                default:
                    estimated_attendance = null;
            }

            // Insert the event
            const [newEvent] = await trx('events')
                .insert({
                    event_name,
                    date_of_event,
                    secondary_event_date,
                    event_address: street_address,
                    event_city: city,
                    event_state: state,
                    event_zip: zip,
                    event_description,
                    estimated_attendance,
                    estimated_event_duration: `${estimated_event_duration} hours`,
                    privacy,
                    number_of_sewers: sew_option === 'yes' ? parseInt(sewing_people) || 0 : 0,
                    number_of_machines: sew_option === 'yes' ? parseInt(sewing_machines) || 0 : 0,
                    number_of_children_under_10: children_option === 'yes' ? parseInt(children_count) || 0 : 0,
                })
                .returning('event_id');
            const event_id = newEvent.event_id;

            // Insert into EventParticipants table
            await trx('eventparticipants').insert({
                event_id,
                participant_id,
                attendance_status: 'Registered',
            });
        });

        res.render('completedEventRequest');
    } catch (error) {
        console.error('Error adding event:', error);
        res.status(500).send('An error occurred while processing your request.');
    }
});




app.post('/deleteEvent/:id', async (req, res) => {
    const eventId = req.params.id;

    try {
        // Delete the event and related participants
        await knexMain.transaction(async (trx) => {
            await trx('eventparticipants').where('event_id', eventId).del(); // Remove related participants
            await trx('events').where('event_id', eventId).del(); // Remove the event itself
        });

        console.log(`Event with ID ${eventId} deleted successfully`);
        res.redirect('/staffView'); // Redirect to the staff view
    } catch (error) {
        console.error('Error deleting event:', error);
        res.status(500).send('An error occurred while deleting the event.');
    }
});





<<<<<<< HEAD

=======
// Start server
>>>>>>> 10b71026eeb07290704a0c98efce333e01d259d8
app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
