const express = require('express');
const app = express();
const {
    connectMongoDB
} = require('./db/db');
const cors = require('cors')
const bodyparser = require('body-parser')
require('dotenv').config();
require('express-async-errors')


app.use(cors())
app.use(bodyparser.json())
app.use(bodyparser.urlencoded({extended:false}))

//auth route
app.use('/api/v1/auth', require('./routes/auth.routes'));

//directory route
app.use('/api/v1', require('./routes/directory.routes'))

//files route
app.use('/api/v1', require('./routes/files.routes'))


//custom middleware
app.use(require('./middleware/notFound'))
app.use(require('./middleware/errorMiddleware'))


const start = async ()=>{
    try {
        await connectMongoDB(process.env.MONGO_DB_URL)
        app.listen(3000,()=>{  console.log(`App is running on port 3000`)});
    } catch (error) {
        console.log(error)
    }
}

start()