const express = require('express');
const cors = require('cors');
const auth = require('./routes/login');
const dsa = require('./routes/dsa');
const project = require('./routes/project');
const content = require('./routes/content');

const app = express();

// Standard Middleware Configuration
app.use(cors({
  origin : process.env.FRONTEND_URL || "http://localhost:5173"
}));
app.use(express.json());

//Admin login route
app.use('/api/auth', auth);
app.use("/api/dsa",dsa);
app.use('/api/projects', project);
app.use('/api/content',content);

app.get('/api/ready', (req, res) => {
  res.json({ message: "Hello World !!" });
});

// Export the configured app instance
module.exports = app;