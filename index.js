const express = require('express');
const cors = require('cors');
const jwt = require('express-jwt');
const jwksRsa = require('jwks-rsa');

const app = express();
app.use(cors());
app.use(express.json());  // Parse JSON requests

// In-memory "database"
let healthData = [];

// Auth0 configuration for token validation
const checkJwt = jwt({
    secret: jwksRsa.expressJwtSecret({
        cache: true,
        rateLimit: true,
        jwksRequestsPerMinute: 5,
        jwksUri: 'https://dev-nrwqr6r2fzgmf4qb.us.auth0.com/.well-known/jwks.json'  // Your Auth0 JWKS URL
    }),
    audience: 'https://roots.example.com',  // Your API audience
    issuer: 'https://dev-nrwqr6r2fzgmf4qb.us.auth0.com/',  // Your Auth0 domain
    algorithms: ['RS256']
});

// Route to handle POST requests to add health data (with Auth0 authentication)
app.post('/add-health-data', checkJwt, (req, res) => {
    const { name, dob, conditions } = req.body;

    // Basic validation
    if (!name || !dob || !conditions) {
        return res.status(400).json({ message: 'Please provide name, date of birth, and conditions.' });
    }

    const newEntry = { name, dob, conditions };
    healthData.push(newEntry);

    res.status(201).json({ message: 'Health data added successfully', data: newEntry });
});

// Route to retrieve all health data (with Auth0 authentication)
app.get('/health-data', checkJwt, (req, res) => {
    res.status(200).json(healthData);
});

// Start the server on port 5002
const PORT = process.env.PORT || 5002;
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
