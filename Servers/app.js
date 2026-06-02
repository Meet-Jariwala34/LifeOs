const express = require('express');
const cors = require('cors');
const auth = require('./routes/login');
const dsa = require('./routes/dsa');
const project = require('./routes/project');
const content = require('./routes/content');
const body = require('./routes/body');

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
app.use('/api/body',body);

app.get('/api/ready', (req, res) => {
  res.json({ message: "Hello World !!" });
});

//ERROR HANDLING 
// --- PLACE THIS AFTER ALL YOUR VALID API ROUTES ---

// 1. Catch-All for Unhandled API Routes (404 Not Found)
app.use((req, res, next) => {
  const error = new Error(`Route Not Found - ${req.originalUrl}`);
  res.status(404);
  next(error);
});

// 2. Global Exception Handler Middleware (500 Server Error)
app.use((err, req, res, next) => {
  // If status code is still 200, default it to a 500 server error
  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  
  res.status(statusCode).json({
    success: false,
    message: err.message,
    // Only show error stack traces in development mode to keep production secure
    stack: process.env.NODE_ENV === 'production' ? null : err.stack,
  });
});

// Export the configured app instance
module.exports = app;
