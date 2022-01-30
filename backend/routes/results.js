// Import environment variables
require('dotenv').config();

// Require dependencies
const express = require('express');
const router = express.Router();
var cache = require('memory-cache');
const { fetch } = require('cross-fetch');

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

// Get Results for user
router.post('/current', async (req, res) => {
    // Check if request is well-formed
    if(req.body.class == null || typeof req.body.class != "number") {
        logger.log('info', `[${res.locals.trace_id}] ROUTE: /results/current - Not all fields filled out `);
        res.status(500).send({'error': 'Please try again later.'});
        return;
    }

    // Check cache for results
    var no_class_results = cache.get('results_no_class');
    var no_class_results_exists = no_class_results != null;

    // Check cache for results with class specific data
    var class_results = cache.get('results_class_' + req.body.class);
    var class_results_exists = class_results != null;

    // Get today's date
    const iso_date = iso();

    try {
        logger.log('debug', `[${res.locals.trace_id}] ROUTE: /results/current - Querying database: to get statistics `);

        var dbres = {};
        if (no_class_results_exists) {
            dbres.total = no_class_results.total;
            dbres.average = no_class_results.average;
        } else {
            var t1 = await db.get_results_no_class(connection, iso_date);
            dbres.total = t1.total;
            dbres.average = t1.average;
            cache.put('results_no_class', {total: t1.total, average: t1.average}, 60000);
        }

        if (class_results_exists) {
            dbres.class_total = class_results.class_total;
            dbres.average_class = class_results.average_class;
        } else {
            var t2 = await db.get_results_class(connection, req.body.class, iso_date);
            dbres.class_total = t2.class_total;
            dbres.average_class = t2.average_class;
            cache.put('results_class_' + req.body.class, {class_total: t2.class_total, average_class: t2.average_class}, 60000);
        }

        res.status(200).json(dbres);
        return;
    } catch (err) {
        logger.log('error', `[${res.locals.trace_id}] ROUTE: /results/current - Error while querying the database. `);
        logger.log('debug', `[${res.locals.trace_id}] ${err}`);

        res.status(500).send({'error': 'Error while processing your request, try again later.'});
        return;
    };
});

// Get results for today: all classes and global
router.post('/today', authenticate, async (req, res) => {
    // Get today's date
    const iso_date = iso();

    try {
        logger.log('debug', `[${res.locals.trace_id}] ROUTE: /results/today - Querying database: to get statistics `);
        const dbres = await db.get_results_all_class(connection, iso_date);
        res.status(200).json(dbres);
        return;
    } catch (err) {
        logger.log('error', `[${res.locals.trace_id}] ROUTE: /results/today - Error while querying the database. `);
        logger.log('debug', `[${res.locals.trace_id}] ${err}`);

        res.status(500).send({'error': 'Error while processing your request, try again later.'});
        return;
    };
});

// Get results for specific day
router.post('/day', authenticate, async (req, res) => {
    // Check if request is well-formed
    if(req.body.day == null) {
        logger.log('info', `[${res.locals.trace_id}] ROUTE: /results/day - Not all fields filled out `);
        res.status(500).send({'error': 'Please try again later.'});
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

        res.status(500).send({'error': 'Error while processing your request, try again later.'});
        return;
    };
});

// Get ranking of menu's
router.post('/ranking', authenticate, async (req, res) => {
    try {
        logger.log('debug', `[${res.locals.trace_id}] ROUTE: /results/ranking - Querying database: to get stats `);
        const dbres = await db.get_stats(connection);
        res.status(200).json(dbres);
        return;
    } catch (err) {
        logger.log('error', `[${res.locals.trace_id}] ROUTE: /results/today - Error while querying the database. `);
        logger.log('debug', `[${res.locals.trace_id}] ${err}`);

        res.status(500).send({'error': 'Error while processing your request, try again later.'});
        return;
    };
});

// Request statistical analysis
router.post('/requeststats', authenticate, async (req, res) => {
    try {
        logger.log('debug', `[${res.locals.trace_id}] ROUTE: /results/requeststats - Querying service to get stats `);
        const stats_res = await fetch(process.env.PYTHONANALYSIS_URL, {method: 'POST', body: JSON.stringify({"token": process.env.SECRET}), headers: {"Content-type": "application/json"}});

        res.status(200).json(stats_res.json());
        return;
    } catch (err) {
        logger.log('error', `[${res.locals.trace_id}] ROUTE: /results/requeststats - Error while querying the database. `);
        logger.log('debug', `[${res.locals.trace_id}] ${err}`);

        res.status(500).send({'error': 'Error while processing your request, try again later.'});
        return;
    };
});

module.exports = router;