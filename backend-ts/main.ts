// Import environment variables
require('dotenv').config();

// Require dependencies
import express from 'express';
export const app = express();

import cors from 'cors';
import bodyParser from 'body-parser';
import { exit } from 'process';
import { v4 } from 'uuid';
import jwt from 'jsonwebtoken';
import { logger } from './lib/logger';

// Check if the DB is set to firestore and initialise app
if (process.env.DB == 'firestore') {
	const firestore_lib = require('./lib/firestore');
	firestore_lib.init();
} else if (process.env.DB == 'test') {
	const { init } = require('./lib/mock');
	init();
} else {
	logger.log('error', `DB environment variable not set!`)
	exit();
}

// Use CORS to make requests from the next frontend possible
app.use(cors());
// Set limit of json post bodies to 15mb to prevent users sending fake data
app.use(bodyParser.json({limit: '1mb'}));

// Add a trace to every request, to give context to logging
app.all('*', (req, res, next) => {
	res.locals.trace_id = v4();
	next();
});

// Create Routers for the different parts of the application
import { router as votesRouter } from './routes/voting';
import { router as menuRouter } from './routes/menu';
import { router as resultsRouter } from './routes/results';

// Bind routers to their modules
app.use('/votes', votesRouter);
app.use('/menu', menuRouter);
app.use('/results', resultsRouter);

/**
 * @route "/login"
 * Route for logging admin panel
 * To access the admin panel, the user needs a jwt, which is given out at this route
 * @param {Username} string username used to login, defined using .env
 * @param {Password} string password used to login, defined using .env
*/
app.post('/login', async (req, res) => {
	if (req.body.username == process.env.ADMIN_USERNAME && req.body.password == process.env.ADMIN_PASSWORD) {
		logger.log('debug', `[${res.locals.trace_id}] ROUTE: /login - Logging in user `);
		res.status(200).json({
			// Send JWT to frontend, which stores it in cookie
			token: jwt.sign({authorized: true}, process.env.SECRET, {
				expiresIn: '12h',
			}),
		});
		return;
	};
	logger.log('debug', `[${res.locals.trace_id}] ROUTE: /login - Login denied.`);
	res.status(404).json({authorized: false});
	return;
});
