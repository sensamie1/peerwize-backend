const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const userRouter = require('./users/users-router')


const app = express()
// const port = process.env.PORT || 5000;

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));


require('dotenv').config();

app.use(express.json());


// home route
app.get('/', (req, res) => {
  return res.status(200).json({
    message: 'Success! Welcome to Peerwize.', 
    status: true })
})

app.use('/users', userRouter)



app.get('*', (req, res) => {
  return res.status(404).json({
    data: null,
    error: 'Route not found'
  })
})

// global error handler
app.use((err, req, res, next) => {
  console.error(err.stack)
  res.status(500).json({
    data: null,
    error: 'Server Error'
  })
})



// const db = require('./db');

// db.connect();

// app.listen(port, () => console.log(`listening on port: ${port}`));




module.exports = app