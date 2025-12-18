require("dotenv").config();
const express = require('express');
const cors = require('cors');
const db = require('./db');  // adjust relative path

//const startLoginCron = require('./generateLogins'); // your cron module

const app = express();
app.use(cors({ 
    origin: process.env.FRONTEND_URL,
    methods: ['GET', 'POST', 'DELETE','PUT','PATCH'],
    allowedHeaders: ['Content-Type','Authorization']
}));


app.use(express.json());

//startLoginCron();

require('./backend')(app);
require('./cls-adm')(app);
require('./student_server')(app);
require('./tcr-adm')(app);
require('./teacher_server')(app);

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

