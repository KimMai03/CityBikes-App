const express = require('express');
const bodyParser = require('body-parser');
const supabaseClient = require('@supabase/supabase-js');
const {isValidStateAbbreviation} = require("usa-state-validator");
const dotenv = require('dotenv');

const app = express();
const port = 3000;
dotenv.config();

app.use(bodyParser.json());
app.use(express.static(__dirname + '/public'));

const supabaseURL = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;
const supabase = supabaseClient.createClient(supabaseURL, supabaseKey);

app.get('/', (req, res) => {
    res.sendFile('public/customers.html', { root: __dirname });
});

// Getting customers from the database
app.get('/customers', async (req, res) => {
    console.log('Attempting to get all customers!');

    const { data, error } =  await supabase.from('customer').select();

    if(error) {
        console.log(`Error: ${error}`);
        res.statusCode = 500;
        res.send(error);
    } else {
        console.log('Received Data:', data.length);
        res.json(data);
    }
});

// Adding customer into the database
app.post('/customer', async (req, res) => {
    console.log('Adding Customer');
    console.log(`Request: ${JSON.stringify(req.body)}`);

    const firstName = req.body.firstName;
    const lastName = req.body.lastName;
    const state = req.body.state;
    if (!isValidStateAbbreviation(state)) {
        console.log(`State: ${state} is invalid`);
        res.statusCode = 400;
        res.json({
            message: `${state} is not a valid 2 letter Abbreviation for State`
        });
        return;
    }

    const { data, error } =  await supabase.from('customer').insert({
        customer_first_name: firstName,
        customer_last_name: lastName,
        customer_state: state
    })
    .select();

    if(error) {
        console.log(`Error: ${error}`);
        res.statusCode = 500;
        res.send(error);
    } else {
        res.json(data);
    }
    
});

app.listen(port, () => {
    console.log(`App is available on port: ${port}`);
});