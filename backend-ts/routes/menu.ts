// Import environment variables
require('dotenv').config();

// Require dependencies
import express from 'express';
export const router = express.Router();
import { body, validationResult } from 'express-validator';
import { exit } from 'process';

// require logger
import { logger } from '../lib/logger';
// require authenticate
import { authenticate } from '../lib/authenticate';
// require the iso_date function
import { iso } from '../lib/date';
// require the sanitization function
import { sanitize_menus, sanitize_menus_edit } from '../lib/utils';
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
 * @route "/add"
 * Route to add menu
 * The admin panels sends a request to add a menu if the user clicks on update menu for the first time
 * @param {Menus} object Object which contains the menus (name, vegetarian, uuid)
*/
router.post('/add', authenticate, body('menus').exists().isObject(), async (req, res) => {
	// Get today's date
	const iso_date: string = iso();

	// Check if request is well-formed
	try {
		// Check if the validation failed 
		if (!validationResult(req).isEmpty()) {
			logger.log('info', `[${res.locals.trace_id}] ROUTE: /menu/add - Not all fields filled out. `);
			res.status(500).send({error: 'Error while processing your vote, try again.'});
			return;
		}

		// Only one menu per day check
		const menu_exists: boolean = (await db.count_menu(connection, iso_date)) != 0;

		if (menu_exists) {
			logger.log('info', `[${res.locals.trace_id}] ROUTE: /menu/add - Menu already created `);
			res.status(500).send({error: 'Cannot create another menu today, either edit or delete the menu first.'});
			return;
		};
	} catch (err) {
		logger.log( 'error', `[${res.locals.trace_id}] ROUTE: /menu/add - Error while checking for validity. `);
		logger.log('debug', `[${res.locals.trace_id}] ${err}`);

		res.status(500).send({ error: 'Error while processing your request, try again later.' });
		return;
	}

	try {
		// sanitize menu to prevent xss type attacks
		const sanitized_menus = sanitize_menus(req.body.menus.menus);

		// Save to database
		logger.log('debug', `[${res.locals.trace_id}] ROUTE: /menu/add - Querying database`);
		const dbres = await db.add_menu(connection, iso_date, sanitized_menus);

		res.status(200).json(dbres);
		return;
	} catch (err) {
		logger.log('error', `[${res.locals.trace_id}] ROUTE: /menu/add - Error while saving to the database. `);
		logger.log('debug', `[${res.locals.trace_id}] ${err}`);

		res.status(500).send({ error: 'Error while processing your request, try again later.' });
	};
})

/**
 * @route "/edit"
 * Route to edit menu
 * The admin panels sends a request to edit a menu if a menu already exists and the admin decides to change the name or if it is vegetarian
 * @param {Menus} object Object which contains the menus (name, vegetarian, uuid)
*/
router.post('/edit', body('menus').exists().isObject(), authenticate, async (req, res) => {
	// Check if the validation failed 
	if (!validationResult(req).isEmpty()) {
		logger.log('info', `[${res.locals.trace_id}] ROUTE: /menu/edit - Not all fields filled out. `);
		res.status(500).send({error: 'Error while processing your vote, try again.'});
		return;
	}

	// Get today's date
	const iso_date: string = iso();

	try {
		// Get old menu data
		logger.log('debug', `[${res.locals.trace_id}] ROUTE: /menu/edit - Querying database for old menu`);
		const old_menu_status = await db.today_menu(connection, iso_date);
		if (!old_menu_status.exists) {
			throw 'No menu exists';
		}

		logger.log('debug', `[${res.locals.trace_id}] ROUTE: /menu/edit - Querying database`);

		// sanitize menu to prevent xss type attacks
		const sanitized_menus = sanitize_menus_edit(req.body.menus.menus);

		// Update menu
		const dbres = await db.update_menu(
			connection,
			iso_date,
			sanitized_menus,
			(old_menu_status.data || { open: false }).open
		);

		res.json({
			day: dbres.day,
			menus: JSON.parse(dbres.menus),
			open: dbres.open
		});
	} catch (err) {
		logger.log('error', `[${res.locals.trace_id}] ROUTE: /menu/edit - Error while editing menu in database. `);
		logger.log('debug', `[${res.locals.trace_id}] ${err}`);
		res.status(500).send({ error: 'Error while editing menu.' });
	};
});

/**
 * @route "/remove"
 * Route to remove menu
 * The admin panels sends a request to remove a menu if the admin decides to delete the menu
 * It deletes today's menu
*/
router.post('/remove', authenticate, async (req, res) => {
	// Get today's date
	const iso_date: string = iso();

	try {
		logger.log('debug', `[${res.locals.trace_id}] ROUTE: /menu/remove - Querying databas`);
		const dbres = await db.remove_menu(connection, iso_date);

		res.json({
			success: 'Removed today\'s menu.'
		})
	} catch (err) {
		logger.log('error', `[${res.locals.trace_id}] ROUTE: /menu/remove - Error while removing from the database. `);
		logger.log('debug', `[${res.locals.trace_id}] ${err}`);
		res.status(500).send({ error: 'Error while removing menu.' });
		return;
	}
});

/**
 * @route "/today"
 * Route to get today's menu
*/
router.get('/today', async (req, res) => {
	// Get today's date
	const iso_date: string = iso();

	try {
		logger.log('debug', `[${res.locals.trace_id}] ROUTE: /menu/today - Querying database`);
		const dbres: {exists: boolean, data: {day: string, menus: string, open: boolean}} = await db.today_menu(connection, iso_date);

		// Check if menu exists, if not send empty menu
		if (!dbres.exists) {
			logger.log('debug', `[${res.locals.trace_id}] ROUTE: /menu/today - Menu does not yet exist`);
			res.json({
				menus: { menus: [] },
				day: iso_date,
				open: false,
				exists: false
			});
		} else {
			logger.log('debug', `[${res.locals.trace_id}] ROUTE: /menu/today - Menu exists`);
			res.json({
				day: (dbres.data || { day: '' }).day,
				menus: JSON.parse((dbres.data || { menus: [] }).menus),
				open: (dbres.data || { open: false }).open,
				exists: true
			});
			return;
		};
	} catch (err) {
		logger.log('error', `[${res.locals.trace_id}] ROUTE: /menu/today - Error while getting menu. `);
		logger.log('debug', `[${res.locals.trace_id}] ${err}`);
		res.status(500).send({ error: 'Error while getting menu.' });
		return;
	}
});

/**
 * @route POST "/status"
 * Route to change the status of today's vote
*/
router.post('/status', body('status').exists().isBoolean(), authenticate, async (req, res) => {
	// Check if the validation failed 
	if (!validationResult(req).isEmpty()) {
		logger.log('info', `[${res.locals.trace_id}] ROUTE: /menu/status - Not all fields filled out. `);
		res.status(500).send({error: 'Error while processing your vote, try again.'});
		return;
	}

	// Get today's date
	const iso_date: string = iso();

	try {
		// Update menu to set new status
		logger.log('debug', `[${res.locals.trace_id}] ROUTE: /menu/status - Querying database`);
		const dbres = await db.set_menu_status(connection, iso_date, req.body.status);

		res.json(dbres);
	} catch (err) {
		logger.log('error', `[${res.locals.trace_id}] ROUTE: /menu/status - Error while editing menu status. `);
		logger.log('debug', `[${res.locals.trace_id}] ${err}`);
		res.status(500).send({ error: 'Error while editing menu.' });
		return;
	}
});

/**
 * @route POST "/status"
 * Route to change the status of today's vote programmatically (cloud scheduler)
*/
router.post('/api/status', body('status').exists().isBoolean(), body('token').exists().isString(), async (req, res) => {
	// Check if the validation failed 
	if (!validationResult(req).isEmpty()) {
		logger.log('info', `[${res.locals.trace_id}] ROUTE: /menu/status - Not all fields filled out. `);
		res.status(500).send({error: 'Error while processing your vote, try again.'});
		return;
	}

	if(req.body.token != process.env.SECRET) {
		res.status(500).send({error: 'Token is not valid.'});
		return;
	}

	// Get today's date
	const iso_date: string = iso();

	try {
		// Update menu to set new status
		logger.log('debug', `[${res.locals.trace_id}] ROUTE: /menu/status - Querying database`);
		const dbres = await db.set_menu_status(connection, iso_date, req.body.status);

		res.json(dbres);
	} catch (err) {
		logger.log('error', `[${res.locals.trace_id}] ROUTE: /menu/status - Error while editing menu status. `);
		logger.log('debug', `[${res.locals.trace_id}] ${err}`);
		res.status(500).send({ error: 'Error while editing menu.' });
		return;
	}
});