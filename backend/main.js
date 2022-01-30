// Import environment variables
require('dotenv').config();

// Require dependencies
const express = require('express');
const app = express();
const cors = require('cors');
const bodyParser = require('body-parser');
const { v4 } = require('uuid');
const cookieParser = require('cookie-parser');
var jwt = require('jsonwebtoken');
const { logger } = require('./lib/logger');

if (process.env.DB == "firestore") {
    const { init } = require('./lib/firestore');
    init()
}

// CORS to make requests from the next frontend possible
app.use(cors());
app.use(bodyParser.json({ limit: '15mb', extended: false }));
// Cookie parser with signed cookies
app.use(cookieParser(process.env.SECRET));

// Add trace to every request
app.all('*', function(req, res, next){
    res.locals.trace_id = v4();
    next();
});

// Create Router
const votesRouter = require('./routes/voting');
const menuRouter = require('./routes/menu');
const resultsRouter = require('./routes/results');

// Bind router
app.use('/votes', votesRouter);
app.use('/menu', menuRouter);
app.use('/results', resultsRouter);

app.post('/login', async (req, res) => {
    if(req.body.username == process.env.ADMIN_USERNAME && req.body.password == process.env.ADMIN_PASSWORD) {
        logger.log('debug', `[${res.locals.trace_id}] ROUTE: /login - Logging in user `);
        res.status(200).json({token: jwt.sign({'authorized': true}, process.env.SECRET, { expiresIn: '12h' })});
        return;
    }
    logger.log('debug', `[${res.locals.trace_id}] ROUTE: /login - Login denied.`);
    res.status(404).json({'authorized': false});
    return;
});

module.exports = app;