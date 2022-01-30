// Import environment variables
require('dotenv').config();

// Require dependencies
const express = require('express');
const router = express.Router();

// require logger
const { logger } = require('../lib/logger');
// require authenticate
const { authenticate } = require('../lib/authenticate');
// require the iso_date function
const { iso } = require('../lib/date');
// get db lib
var connection;
var db;
if(process.env.DB == "pgsql") {
    db = require('../lib/pgsql');
    connection = db.get_connection();
} else if (process.env.DB == "firestore") {
    db = require('../lib/firestore');
    connection = db.get_connection();
}

// Add menu for today
router.post('/add', authenticate, async (req, res) => {
    // Check if request is well-formed
    if(req.body.name == null || req.body.vegetarian == null || typeof req.body.name != "string" || typeof req.body.vegetarian != "boolean") {
        logger.log('info', `[${res.locals.trace_id}] ROUTE: /menu/add - Not all fields filled out `);
        res.status(500).send({'error': 'Please fill out all the fields to create menu.'});
        return;
    }

    // Get today's date
    const iso_date = iso();

    // Only one menu per day check
    const menu_exists = await db.count_menu(connection, iso_date) == 0 ? false : true;

    if(menu_exists) {
        logger.log('info', `[${res.locals.trace_id}] ROUTE: /menu/add - Menu already created `);
        res.status(500).send({'error': 'Cannot create another menu today, either edit or delete the menu first.'});
        return;
    }

    try {
        logger.log('debug', `[${res.locals.trace_id}] ROUTE: /menu/add - Querying database`);
        const dbres = await db.add_menu(connection, iso_date, req.body.name, req.body.vegetarian);

        res.json(dbres);
        return;
    } catch (err) {
        logger.log('error', `[${res.locals.trace_id}] ROUTE: /menu/add - Error while saving to the database. `);
        logger.log('debug', `[${res.locals.trace_id}] ${err}`);

        res.status(500).send({'error': 'Error while processing your request, try again later.'});
        return;
    };
});

// Edit today's menu
router.post('/edit', authenticate, async (req, res) => {
    // Check if request is well-formed
    if(req.body.name == null || req.body.vegetarian == null || typeof req.body.name != "string" || typeof req.body.vegetarian != "boolean") {
        logger.log('info', `[${res.locals.trace_id}] ROUTE: /menu/edit - Not all fields filled out `);
        res.status(500).send({'error': 'Please fill out all the fields to edit menu.'});
        return;
    }

    // Get today's date
    const iso_date = iso();

    try {
        // Get old menu
        logger.log('debug', `[${res.locals.trace_id}] ROUTE: /menu/edit - Querying database for old menu`);
        const old_menu_status = db.today_menu(connection, iso_date);
        if(!old_menu_status.exists) throw 'No menu exists';

        logger.log('debug', `[${res.locals.trace_id}] ROUTE: /menu/edit - Querying database`);

        // Update menu
        const dbres = await db.update_menu(connection, iso_date, iso_date, req.body.name, req.body.vegetarian, old_menu_status);

        res.json(dbres);
    } catch (err) {
        logger.log('error', `[${res.locals.trace_id}] ROUTE: /menu/edit - Error while editing menu in database. `);
        logger.log('debug', `[${res.locals.trace_id}] ${err}`);
        res.status(500).send({'error': 'Error while editing menu.'});
    };
});

// Remove today's menu
router.post('/remove', authenticate, async (req, res) => {
    // Get today's date
    const iso_date = iso();

    try {
        logger.log('debug', `[${res.locals.trace_id}] ROUTE: /menu/remove - Querying databas`);
        const dbres = await db.remove_menu(connection, iso_date);

        res.json({
            "success": "Removed today's menu."
        })
    } catch (err) {
        logger.log('error', `[${res.locals.trace_id}] ROUTE: /menu/remove - Error while removing from the database. `);
        logger.log('debug', `[${res.locals.trace_id}] ${err}`);
        res.status(500).send({'error': 'Error while removing menu.'});
        return;
    };
});

// Get status of today's menu
router.get('/today', async (req, res) => {
    // Get today's date
    const iso_date = iso();

    try {
        logger.log('debug', `[${res.locals.trace_id}] ROUTE: /menu/today - Querying database`);
        const dbres = await db.get_today_menu(connection, iso_date);

        if(dbres.l < 1) {
            res.json({
                name: "",
                day: iso_date,
                vegetarian: false,
                open: false,
                exists: false
            });
        } else {
            res.json({
                name: dbres.data.name,
                day: dbres.data.day,
                vegetarian: dbres.data.vegetarian,
                open: dbres.data.open,
                exists: true
            });
            return;
        }
    } catch (err) {
        logger.log('error', `[${res.locals.trace_id}] ROUTE: /menu/today - Error while getting menu. `);
        logger.log('debug', `[${res.locals.trace_id}] ${err}`);
        res.status(500).send({'error': 'Error while getting menu.'});
    };
});

// Change status of today's menu
router.post('/status', authenticate, async (req, res) => {
    // Check if request is well formed
    if(req.body.status == null || typeof req.body.status != "boolean") {
        logger.log('info', `[${res.locals.trace_id}] ROUTE: /menu/status - Not all fields filled out `);
        res.status(500).send({'error': 'Please fill out all the fields to edit menu.'});
        return;
    }

    // Get today's date
    const iso_date = iso();

    try {
        // Update menu
        logger.log('debug', `[${res.locals.trace_id}] ROUTE: /menu/status - Querying database`);
        const dbres = await db.set_menu_status(connection, iso_date, req.body.status);

        res.json(dbres);
    } catch (err) {
        logger.log('error', `[${res.locals.trace_id}] ROUTE: /menu/status - Error while editing menu status. `);
        logger.log('debug', `[${res.locals.trace_id}] ${err}`);
        res.status(500).send({'error': 'Error while editing menu.'});
    };
});

module.exports = router;