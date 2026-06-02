const express = require('express');
const cors = require('cors');
const auth = require('./routes/login');
const dsa = require('./routes/dsa');
const project = require('./routes/project');
const content = require('./routes/content');

const app = express();
const allowedOrigins = [
  process.env.FRONTEND_URL ? process.env.FRONTEND_URL.replace(/\/$/, "") : null,
  "http://localhost:5173",
  "http://localhost:3000"
].filter(Boolean);

app.use(cors({
  origin: function (origin, callback) {
    // Allow server-to-server requests or local debugging passes with no origin
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.indexOf(origin) === -1) {
      const msg = 'The CORS policy for this site does not allow access from the specified Origin.';
      return callback(new Error(msg), false);
    }
    return callback(null, true);
  },
  credentials: true
}));

app.use(express.json());

//Admin login route
app.use('/api/auth', auth);
app.use("/api/dsa",dsa);
app.use('/api/projects', project);
app.use('/api/content',content);
app.use('/api/task', project);

app.get('/api/ready', (req, res) => {
  res.json({ message: "Hello World !!" });
});

// Export the configured app instance
module.exports = app;
