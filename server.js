const express = require('express');
const app = express();
const {
    connectMongoDB
} = require('./db/db');
const cors = require('cors')
const bodyparser = require('body-parser')
require('dotenv').config();
require('express-async-errors')
const PORT = process.env.PORT || 3000

app.use(cors())
app.use(bodyparser.json())
app.use(bodyparser.urlencoded({extended:false}))

//auth route
app.use('/api/v1/auth', require('./routes/auth.routes'));

//directory route
app.use('/api/v1', require('./routes/directory.routes'))

//files route
app.use('/api/v1', require('./routes/files.routes'))

//comment route
app.use('/api/v1/messages', require('./routes/commnent.routes'))

//custom middleware
app.use(require('./middleware/notFound'))
app.use(require('./middleware/errorMiddleware'))


const start = async ()=>{
    try {
        await connectMongoDB(process.env.MONGO_DB_URL)
        app.listen(PORT,()=>{  console.log(`App is running on port ${PORT}`)});
    } catch (error) {
        console.log(error)
    }
}

start()