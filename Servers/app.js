const express = require('express');
const cors = require('cors');
const auth = require('./routes/login');
const dsa = require('./routes/dsa');

const app = express();

// Standard Middleware Configuration
app.use(cors());
app.use(express.json());

//Admin login route
app.use('/api/auth', auth);
app.use("/api/dsa",dsa);

app.get('/api/ready', (req, res) => {
  res.json({ message: "Hello World !!" });
});

// Export the configured app instance
module.exports = app;