// Import environment variables
require('dotenv').config();

// Require dependencies
import express from 'express';
export const router = express.Router();
import cache from 'memory-cache';
import { fetch } from 'cross-fetch';
import { body, validationResult } from 'express-validator';
import { exit } from 'process';

// require logger
import { logger } from '../lib/logger';
// require authenticate
import { authenticate } from '../lib/authenticate';
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
 * @route "/current"
 * Route to get current results
 * When the user finishes the vote, he gets to see the current results
 * @param {Menu} string Uuid of the menu the user chose
 * @param {Class} int Class of the user (Int between 1-8)
*/
router.post('/current', body('class').exists().isNumeric(), body('menu').exists().isString(), async (req, res) => {
	// Check if the validation failed 
	if (!validationResult(req).isEmpty()) {
		logger.log('info', `[${res.locals.trace_id}] ROUTE: /results/current - Not all fields filled out. `);
		res.status(500).send({error: 'Error while processing your vote, try again.'});
		return;
	}

	// Check cache for results
	const no_class_results: {total: number; average: number} = cache.get('results_no_class');
	const no_class_results_exists: boolean = no_class_results != null;

	// Check cache for results with class specific data
	const class_results: {class_total: number; average_class: number} = cache.get('results_class_' + req.body.class);
	const class_results_exists: boolean = class_results != null;

	// Get today's date
	const iso_date: string = iso();

	try {
		logger.log('debug', `[${res.locals.trace_id}] ROUTE: /results/current - Querying database: to get statistics `);

		// Create result object
		const dbres: {total: number | null, average: number | null, class_total: number | null, average_class: number | null} = {
			total: null,
			average: null,
			class_total: null,
			average_class: null,
		};

		// If results already exist in cache, set them
		if (no_class_results_exists) {
			dbres.total = no_class_results.total;
			dbres.average = no_class_results.average;
		} else {
			// Get results and put to cache
			const t1 = await db.get_results_no_class(
				connection,
				iso_date,
				req.body.menu
			);

			dbres.total = t1.total;
			dbres.average = t1.average;
			cache.put('results_no_class', {total: t1.total, average: t1.average}, 60000);
		}

		if (class_results_exists) {
			dbres.class_total = class_results.class_total;
			dbres.average_class = class_results.average_class;
		} else {
			const t2 = await db.get_results_class(
				connection,
				req.body.class,
				iso_date,
				req.body.menu
			);
			dbres.class_total = t2.class_total;
			dbres.average_class = t2.average_class;
			
			cache.put('results_class_' + req.body.class, {class_total: t2.class_total, average_class: t2.average_class}, 60000);
		}

		res.status(200).json(dbres);
		return;
	} catch (err) {
		logger.log('error', `[${res.locals.trace_id}] ROUTE: /results/current - Error while querying the database. `);
		logger.log('debug', `[${res.locals.trace_id}] ${err}`);

		res.status(500).send({error: 'Error while processing your request, try again later.'});
		return;
	}
});

/**
 * @route "/today"
 * Route to get today's results, all classes and menus
 * Show results on the admin panel
*/
router.post('/today', authenticate, async (req, res) => {
	// Get today's date
	const iso_date: string = iso();

	try {
		logger.log('debug', `[${res.locals.trace_id}] ROUTE: /results/today - Querying database: to get statistics `);
		// Get today's results
		const dbres = await db.get_results_all_class(connection, iso_date);
		res.status(200).json(dbres);
		return;
	} catch (err) {
		logger.log('error',`[${res.locals.trace_id}] ROUTE: /results/today - Error while querying the database. `);
		logger.log('debug', `[${res.locals.trace_id}] ${err}`);

		res.status(500).send({error: 'Error while processing your request, try again later.'});
		return;
	}
});

/**
 * @route "/day"
 * Route to get results for a specific day
 * Show results on the admin panel
 * @param {Day} string Day for which to get the data
*/
router.post('/day', body('day').exists().isString(), authenticate, async (req, res) => {
	// Check if the validation failed 
	if (!validationResult(req).isEmpty()) {
		logger.log('info', `[${res.locals.trace_id}] ROUTE: /results/day - Not all fields filled out. `);
		res.status(500).send({error: 'Error while processing your vote, try again.'});
		return;
	}

	try {
		logger.log('debug', `[${res.locals.trace_id}] ROUTE: /results/day - Querying database: to get statistics `);
		const dbres = await db.get_results_all_class(connection, req.body.day);
		res.status(200).json(dbres);
		return;
	} catch (err) {
		logger.log('error', `[${res.locals.trace_id}] ROUTE: /results/day - Error while querying the database. `);
		logger.log('debug', `[${res.locals.trace_id}] ${err}`);

		res.status(500).send({error: 'Error while processing your request, try again later.'});
		return;
	}
});

/**
 * @route "/ranking"
 * Route to get ranking of menus
 * Show ranking on the admin panel and publicly
*/
router.post('/ranking', async (req, res) => {
	try {
		const ranking: {ranking: {name: string, day: string, uuid: string, jsondata: string}[]} = cache.get('ranking');
		const ranking_exists: boolean = ranking != null;

		if(ranking_exists) {
			logger.log('debug', `[${res.locals.trace_id}] ROUTE: /results/ranking - Reading ranking from cache `);
			res.status(200).json(ranking);
			return;
		} else {
			logger.log('debug', `[${res.locals.trace_id}] ROUTE: /results/ranking - Querying database: to get stats `);
			const dbres = await db.get_stats(connection);
			cache.put('ranking', dbres, 300000);
			res.status(200).json(dbres);
			return;
		}
	} catch (err) {
		logger.log('error', `[${res.locals.trace_id}] ROUTE: /results/ranking - Error while querying the database. `);
		logger.log('debug', `[${res.locals.trace_id}] ${err}`);

		res.status(500).send({error: 'Error while processing your request, try again later.'});
		return;
	}
});

/**
 * @route "/requeststats"
 * Route to request a statistical analysis for today's vote
 * Usually called by a cron job on Google Cloud
*/
router.post('/requeststats', authenticate, async (req, res) => {
	try {
		logger.log('debug', `[${res.locals.trace_id}] ROUTE: /results/requeststats - Querying service to get stats `);
		const stats_res = await fetch(process.env.PYTHONANALYSIS_URL, {
			method: 'POST',
			body: JSON.stringify({token: process.env.SECRET}),
			headers: {'Content-type': 'application/json'},
		});

		res.status(200).json(stats_res.json());
		return;
	} catch (err) {
		logger.log('error', `[${res.locals.trace_id}] ROUTE: /results/requeststats - Error while querying the database. `);
		logger.log('debug', `[${res.locals.trace_id}] ${err}`);

		res.status(500).send({error: 'Error while processing your request, try again later.'});
		return;
	}
});