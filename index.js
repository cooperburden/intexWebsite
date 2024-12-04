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
        password: 'password',
        database: 'intexemployee',
        port: 5432,
    },
});

// Confirm database connection
knexStaff.raw('SELECT 1+1 AS result')
    .then(() => console.log('Database connection successful'))
    .catch((error) => console.error('Database connection failed:', error));

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

app.post('/staffLogin', async (req, res) => {
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
            const employees = await knexStaff('employeetable').select('*');

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


app.post('/addEvent', async (req, res) => {
    const {
        first_name,
        last_name,
        d_email,
        d_phone_number,
        event_name,
        date_of_activity,
        activity_address,
        expected_attendance,
        estimated_duration,
        event_description,
        sew_option,
        sewing_people,
        sewing_machines,
        children_option,
        children_count,
        privacy,
    } = req.body;

    try {
        // Insert event into 'events' table
        const [event] = await knexMain('events')
            .insert({
                event_name: event_name || null,
                date_of_event: date_of_activity || null,
                event_address: activity_address || null,
                estimated_attendance: expected_attendance || null,
                estimated_event_duration: estimated_duration || null,
                event_description: event_description || null,
                privacy: privacy || null,
                number_of_sewers: sew_option === 'yes' ? parseInt(sewing_people) || 0 : 0,
                number_of_machines: sew_option === 'yes' ? parseInt(sewing_machines) || 0 : 0,
                number_of_children_under_10: children_option === 'yes' ? parseInt(children_count) || 0 : 0,
                completed: false, // Default to false for new events
            })
            .returning('*'); // Include 'event_id' in the result

        console.log('Event added with ID:', event.event_id);

        // Insert participant into 'participants' table
        const [participant] = await knexMain('participants')
            .insert({
                first_name: first_name || null,
                last_name: last_name || null,
                email: d_email || null,
                phone_number: d_phone_number || null,
            })
            .returning('*'); // Include 'participant_id' in the result

        console.log('Participant added with ID:', participant.participant_id);

        // Link event and participant in 'eventparticipants' table
        await knexMain('eventparticipants').insert({
            event_id: event.event_id,
            participant_id: participant.participant_id,
        });

        console.log('Event and participant linked successfully.');

        res.redirect('/'); // Redirect to the homepage or a confirmation page
    } catch (error) {
        console.error('Error adding event or participant:', error);
        res.status(500).send('An error occurred while adding the event.');
    }
});






// Start server
app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
