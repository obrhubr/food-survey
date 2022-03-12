// Import environment variables
require('dotenv').config();

// Require dependencies
import express from 'express';
export const router = express.Router();
import cache from 'memory-cache';
import { v4 } from 'uuid';
import { body, validationResult, CustomValidator, ValidationError, Result } from 'express-validator';
import { exit } from 'process';

// require logger
import { logger } from '../lib/logger';
// require the iso_date function
import { iso } from '../lib/date';
// get db lib
let connection: any;
let db: any;
if (process.env.DB == 'firestore') {
	db = require('../lib/firestore');
	connection = db.get_connection();
} else if (process.env.DB == 'test') {
	db = require('../lib/mock');
	connection = db.get_connection();
} else {
	logger.log('error', `DB environment variable not set!`)
	exit();
}

/**
 * Create custom Validators to ensure the class and votes are in the correct ranges
*/
const classIsValid: CustomValidator = value => {
	return value >= 0 && value <= 8;
};
const voteIsValid: CustomValidator = value => {
	return value > 0 && value <= 5;
};

/**
 * @route "/vote"
 * Route for voting
 * The frontend sends a POST-request to this route once the voting process is finished, to save the vote
 * @param {Vote} int Between 1 and 5, the score the user gives the menu
 * @param {Class} int Between 1 and 9, the class the user is in
 * @param {Menu} uuidv4 The id of the menu the user chose
 * @param {AlreadyVoted} boolean If the user has a localhost variable set because he has already voted, the frontend sets this as true, and we discard the vote. This value is reset daily on the frontend
 * @param {Fp} string The fingerprint of the user, we use this when creating the statistics to deduplicate the data
*/
router.post('/vote', body('vote').exists().isNumeric().custom(voteIsValid), body('menu').exists().isUUID(4), body('class').exists().isNumeric().custom(classIsValid), body('alreadyVoted').isBoolean().optional({ nullable: true }), body('fp').exists().isString() , async (req, res) => {
	try {
		// Check if the user has already voted
		if (req.body.alreadyVoted == true) {
			logger.log('info', `[${res.locals.trace_id}] ROUTE: /votes/vote - Tried to vote again`);
			res.status(200).json({
				vote: req.body.vote,
				class: req.body.class,
			});
			return;
		}
	} catch (err) {
		logger.log('error', `[${res.locals.trace_id}] ROUTE: /votes/vote - Error while checking for alreadyVoted. `);
		logger.log('debug', `[${res.locals.trace_id}] ${err}`);

		res.status(500).send({error: 'Error while processing your vote, try again later.'});
		return;
	}

	try {
		// Check if the validation failed
		const results: Result<ValidationError> = validationResult(req);
		if (!results.isEmpty()) {
			logger.log('info', `[${res.locals.trace_id}] ROUTE: /votes/vote - Not all fields filled out. `);
			res.status(500).send({error: 'Error while processing your vote, try again.'});
			return;
		}
	} catch (err) {
		logger.log('error', `[${res.locals.trace_id}] ROUTE: /votes/vote - Error while checking validationResults. `);
		logger.log('debug', `[${res.locals.trace_id}] ${err}`);

		res.status(500).send({error: 'Error while processing your vote, try again later.'});
		return;
	}

	// Get today's date
	const iso_date: string = iso();

	try {
		// check if the voting is open
		logger.log('debug', `[${res.locals.trace_id}] ROUTE: /votes/vote - Querying database`);
		const voting_open = await db.today_menu(connection, iso_date);

		if ((voting_open.data || {open: false}).open != true) {
			res.status(500).send({error: 'Voting not open yet.'});
			return;
		}
	} catch (err) {
		res.status(500).send({error: 'Voting not open yet.'});
		return;
	};

	try {
		// give each user a unique token, to identify them on future votes
		if (req.body.user_token == null) {
			req.body.user_token = v4();
		};

		// Send request to DB to save vote
		logger.log('debug',`[${res.locals.trace_id}] ROUTE: /votes/vote - Querying database`);
		const dbres = await db.vote_add(
			connection,
			iso_date,
			req.body.vote,
			req.body.menu,
			req.body.class,
			req.header('X-Forwarded-For'),
			req.body.user_token,
			req.body.fp
		);

		// Send back relevant data to frontend to display results page
		res.json({vote: req.body.vote, menu: req.body.menu, class: req.body.class});
		return;
	} catch (err) {
		logger.log('error', `[${res.locals.trace_id}] ROUTE: /votes/vote - Error while saving to the database.`);
		logger.log('debug', `[${res.locals.trace_id}] ${err}`);

		res.status(500).send({error: 'Error while processing your vote, try again later.'});
		return;
	}
});

/**
 * @route "/status"
 * Route for checking the status of the vote
 * The frontend sends a POST-request to this route on loading of the page, to check if voting has already begun
*/
router.get('/status', async (req, res) => {
	// Check cache (if not defined yet, set it) for status (To reduce load on the DB)
	const status: boolean = cache.get('status');
	if (status) {
		res.status(200).send({
			status: true,
			message: 'Le vote est ouvert.',
		});
		return;
	}

	// Get today's date
	const iso_date: string = iso();

	try {
		// Check if voting already opened
		logger.log('debug', `[${res.locals.trace_id}] ROUTE: /votes/status - Querying database`);
		const voting_status = await db.today_menu(connection, iso_date);

		if ((voting_status.data || {open: false}).open == true) {
			// Put status to cache, with a retention time of 60s, to ensure short waiting times
			cache.put('status', true, 60000);
			res.status(200).send({
				status: true,
				success: 'Le vote est ouvert.',
			});
			return;
		} else {
			// Put status to cache, with a retention time of 60s, to ensure short waiting times
			cache.put('status', false, 60000);
			res.status(200).send({
				status: false,
				message: 'Le vote n&apos;est pas encore ouvert.',
			});
			return;
		}
	} catch (err) {
		cache.put('status', false, 60000);
		res.status(200).send({
			status: false,
			message: 'Le vote n&apos;est pas encore ouvert.',
		});
		return;
	}
	return;
});