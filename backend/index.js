require("dotenv").config();
const express = require('express');
const cors = require('cors');
const db = require('./db');  // adjust relative path

const app = express();
app.use(cors({ origin: 'http://127.0.0.1:5500',
    methods: ['GET', 'POST', 'DELETE','PUT','PATCH'],
    allowedHeaders: ['Content-Type','Authorization']
 }));

app.use(express.json());

require('./backend')(app);
require('./cls-adm')(app);
require('./student_server')(app);
require('./tcr-adm')(app);
require('./teacher_server')(app);

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

