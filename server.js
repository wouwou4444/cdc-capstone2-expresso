// JavaScript source code

const PORT = process.env.PORT || 4000;

const express = require('express');
const app = express();

const bodyParser = require('body-parser');
app.use(bodyParser.json());

const apiRouter = require('./api/api.js');
app.use('/api', apiRouter);

app.listen(PORT, () => {
    console.log('Server listening on port: ' + PORT);
});


module.exports = app;