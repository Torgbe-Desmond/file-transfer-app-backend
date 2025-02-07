const { io, app, server  } = require('../socket/socket')
const { connectMongoDB } = require('../config/db');
const cors = require('cors');
const bodyparser = require('body-parser');
const ErrorHandler = require('../Errors/ErrorHandler')
const Handler = new ErrorHandler()
require('dotenv').config();
require('express-async-errors');
const PORT = process.env.PORT || 5000;
    // origin: ,

// CORS setup
app.use(cors({
    origin:["https://student-rep.vercel.app",'http://localhost:3000',"http://localhost:56708"],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization'], 
    credentials: true
}));

// Middleware setup 
app.use(bodyparser.json());
app.use(bodyparser.urlencoded({ extended: false }));

// Routes
app.use(require('../routes/index'));

// Custom middleware for handling errors
app.use(require('../middleware/errorMiddleware'));
app.use(require('../middleware/notFound'));

// Start server
const start = async () => {
    try {
        await connectMongoDB(process.env.MONGO_DB_URL);
        server.listen(PORT, () => { 
            console.info(`App is running on port ${PORT}`);
        });
    } catch (error) {
        if (!Handler.isTrustedError(error)) {
            Handler.handleError(error);
          }
        console.log(error);
    }
};

start();
