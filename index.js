const express = require('express');
const bodyParser = require('body-parser');
const supabaseClient = require('@supabase/supabase-js');
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
    res.sendFile('public/homePage.html', { root: __dirname });
});

// Save a contact form submission to Supabase database
app.post('/contactPage', async (req, res) => {
    const { firstName, lastName, email, subject, message } = req.body;
    if (!firstName || !lastName || !email || !subject || !message) {
        return res.status(400).json({ error: 'All fields are required.' });
    }
    console.log(`Saving contact submission from ${firstName} ${lastName}`);
    const { data, error } = await supabase.from('contacts').insert({
        first_name: firstName,
        last_name: lastName,
        email: email,
        subject: subject,
        message: message
    }).select();
    if (error) {
        console.error('Supabase error:', error);
        res.status(500).json({ error: error.message });
    } else {
        res.json({ success: true, data });
    }
});

// Retrieve all contact submissions from Supabase database
app.get('/api/contacts', async (req, res) => {
    const { data, error } = await supabase.from('contacts').select('*').order('created_at', { ascending: false });
    if (error) {
        console.error('Supabase error:', error);
        res.status(500).json({ error: error.message });
    } else {
        res.json({ contacts: data });
    }
});

// Proxy all bike networks from CityBikes API
app.get('/api/networks', async (req, res) => {
    try {
        const response = await fetch('https://api.citybik.es/v2/networks');
        if (!response.ok) throw new Error(`CityBikes API responded with ${response.status}`);
        const data = await response.json();
        res.json(data);
    } catch (e) {
        console.error('External API error:', e.message);
        res.status(502).json({ error: 'Failed to fetch network data from CityBikes API.' });
    }
});

// Proxy live station data for a specific network from CityBikes API
app.get('/api/networks/:networkId', async (req, res) => {
    const { networkId } = req.params;
    try {
        const response = await fetch(`https://api.citybik.es/v2/networks/${networkId}`);
        if (!response.ok) throw new Error(`CityBikes API responded with ${response.status}`);
        const data = await response.json();
        res.json(data);
    } catch (e) {
        console.error('External API error:', e.message);
        res.status(502).json({ error: 'Failed to fetch station data from CityBikes API.' });
    }
});

app.listen(port, () => {
    console.log(`App is available on port: ${port}`);
});
