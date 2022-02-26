// Import environment variables
require('dotenv').config();

// Require dependencies
const express = require('express');
const router = express.Router(); 
const cache = require('memory-cache');
const { v4 } = require('uuid');
const sanitizer = require('sanitizer');

// require logger
const { logger } = require('../lib/logger');
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

// Vote on the menu
router.post('/vote', async (req, res) => {
    try {
        if(req.body.alreadyVoted == true) {
            logger.log('info', `[${res.locals.trace_id}] ROUTE: /votes/vote - Tried to vote again`);
            res.status(200).json({
                vote: req.body.vote,
                class: req.body.class
            }
            );
            return;
        }
    } catch(err) {
        logger.log('error', `[${res.locals.trace_id}] ROUTE: /votes/vote - Error while checking for cookie. `);
        logger.log('debug', `[${res.locals.trace_id}] ${err}`);

        res.status(500).send({'error': 'Error while processing your vote, try again later.'});
        return;
    }

    if(req.body.vote == null || req.body.menu == null || req.body.class == null || typeof req.body.vote != "number" || typeof req.body.menu != "string" || typeof req.body.class != "number") {
        logger.log('info', `[${res.locals.trace_id}] ROUTE: /votes/vote - Not all fields filled out. `);
        res.status(500).send({'error': 'Error while processing your vote, try again.'});
        return;
    }

    if(req.body.vote < 0 || req.body.vote > 5 || req.body.class < 0 || req.body.class > 8) {
        logger.log('info', `[${res.locals.trace_id}] ROUTE: /votes/vote - Invalid values for vote or class. `);
        res.status(500).send({'error': 'Please don\'t use the api to vote directly :).'});
        return;
    }

    // Get today's date
    const iso_date = iso();

    // check if voting open
    logger.log('debug', `[${res.locals.trace_id}] ROUTE: /votes/vote - Querying database`);
    const voting_open = await db.today_menu(connection, iso_date);
    
    try {
        if(voting_open.data().open != true) {
            res.status(500).send({'error': 'Voting not open yet.'});
            return;
        }
    } catch (err) {
        res.status(500).send({'error': 'Voting not open yet.'});
        return;
    }

    const menu = sanitizer.sanitize(req.body.menu);

    try {
        // data
        var data = {
            vote: req.body.vote,
            menu: menu,
            class: req.body.class,
            fp: req.body.fp
        }

        // give each user a unique token, to identify them on future votes
        if(req.body.user_token == null) {
            req.body.user_token = v4();
            data.user_token = req.body.user_token;
        } else {
            data.user_token = req.body.user_token;
        }

        logger.log('debug', `[${res.locals.trace_id}] ROUTE: /votes/vote - Querying database`);
        const dbres = await db.vote_add(connection, iso_date, req.body.vote, menu, req.body.class, req.header('X-Forwarded-For'), req.body.user_token);

        // Set cookie to voted
        res.json(data);
        return;
    } catch (err) {
        logger.log('error', `[${res.locals.trace_id}] ROUTE: /votes/vote - Error while saving to the database. `);
        logger.log('debug', `[${res.locals.trace_id}] ${err}`);

        res.status(500).send({'error': 'Error while processing your vote, try again later.'});
        return;
    };
});

router.get('/status', async (req, res) => {
    // Check cache
    const status = cache.get('status');
    if(status != null) {
        if(status) {
            res.status(200).send({
                'status': true,
                'message': 'Le vote est ouvert.'
            });
            return;
        } else {
            res.status(200).send({
                'status': false,
                'message': 'Le vote n&apos;est pas encore ouvert.'
            });
            return;
        }
    }

    // Get today's date
    const iso_date = iso();
    console.log(iso_date)

    // Check if voting already opened
    logger.log('debug', `[${res.locals.trace_id}] ROUTE: /votes/status - Querying database`);
    const voting_status = await db.today_menu(connection, iso_date);

    try {
        if(voting_status.data().open == true) {
            cache.put('status', true, 60000);
            res.status(200).send({
                'status': true,
                'success': 'Le vote est ouvert.'
            });
            return;
        } else {
            cache.put('status', false, 60000);
            res.status(200).send({
                'status': false,
                'message': 'Le vote n&apos;est pas encore ouvert.'
            });
            return;
        }
    } catch (err) {
        cache.put('status', false, 60000);
        res.status(200).send({
            'status': false,
            'message': 'Le vote n&apos;est pas encore ouvert.'
        });
        return;
    }
});

module.exports = router;