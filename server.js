const { io, app, server  } = require('./socket/socket')
const { connectMongoDB } = require('./db/db');
const cors = require('cors');
const bodyparser = require('body-parser');
require('dotenv').config();
require('express-async-errors');
const PORT = process.env.PORT || 4000;

// CORS setup
app.use(cors({
    origin: ['https://student-rep.vercel.app','http://localhost:3000'],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization'], 
    credentials: true
}));

// Middleware setup
app.use(bodyparser.json());
app.use(bodyparser.urlencoded({ extended: false }));

// Routes
app.use('/api/v1/auth', require('./routes/auth'));
app.use('/api/v1', require('./routes/directory'));
app.use('/api/v1', require('./routes/files'));

// Custom middleware for handling errors
app.use(require('./middleware/errorMiddleware'));
app.use(require('./middleware/notFound'));

// Start server
const start = async () => {
    try {
        await connectMongoDB(process.env.MONGO_DB_URL);
        server.listen(PORT, () => { 
            console.log(`App is running on port ${PORT}`);
        });
    } catch (error) {
        console.log(error);
    }
};

start();
