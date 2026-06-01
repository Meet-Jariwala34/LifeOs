const app = require('./app');
const connectDB = require('./config/db');
const dotenv = require('dotenv');

dotenv.config();

// Connect to Database
connectDB();

const PORT = process.env.PORT || 5000;

// Listen to network port
app.listen(PORT,'0.0.0.0', () => {
  console.log(`📡 Production server active on port ${PORT} ...`);
});