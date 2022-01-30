module.exports = {
    get_connection,

    count_menu,
    add_menu,
    update_menu,
    remove_menu,
    today_menu,
    set_menu_status,
    get_today_menu,

    vote_add,

    get_results_all_class,
    get_results_class,
    get_results_no_class,
    get_stats
}

async async function get_connection() {
    // Connect to database
    const Pool = require('pg').Pool;
    const pool = new Pool({
        user: process.env.PG_USER,
        host: process.env.PG_HOST,
        database: process.env.PG_DB,
        password: process.env.PG_PASSWORD,
        port: 5432,
    });
    return pool;
}

//  Count how many menu's today, to ensure not more than 1 is created
async async function count_menu(connection, iso_date) {
    const menu_check = 'SELECT COUNT(*) FROM menus WHERE day = $1;';
    const values_menu_check = [iso_date];
    logger.log('debug', `[${res.locals.trace_id}] ROUTE: /menu/add - Querying database: ${menu_check} `);
    const menu_check_result = await connection.query(menu_check, values_menu_check);


    return menu_check_result.rows[0].count;
}

// Create Menu
async function add_menu(connection, iso_date, name, vegetarian) {
    const text = 'INSERT INTO menus(day, name, vegetarian, open) VALUES ($1, $2, $3, $4) RETURNING *;';
    const values = [iso_date, name, vegetarian, false];

    const dbres = await connection.query(text, values);

    return dbres.rows[0];
}

async function today_menu(connection, iso_date) {
    const menu_text = 'SELECT * FROM menus WHERE day = $1;';
    const menu_values = [iso_date];

    const today_menu = await connection.query(menu_text, menu_values);

    return today_menu.rows[0].open;
}

async function update_menu(connection, iso_date, name, vegetarian, old_menu_status) {
    const text = 'UPDATE menus SET (day, name, vegetarian, open) = ($2, $3, $4, $5) WHERE day = $1 RETURNING *;';
    var values = [iso_date, name, vegetarian, old_menu_status];

    const res = await connection.query(text, values);
    return res.rows[0]
}

async function remove_menu(connection, iso_date) {
    const text = 'DELETE FROM menus WHERE day = $1 RETURNING *;';
    const values = [iso_date];

    const dbres = await connection.query(text, values);
    return dbres.rows[0].length;
}

async function set_menu_status(connection, iso_date, status) {
    const text = 'UPDATE menus SET open = $2 WHERE day = $1 RETURNING *;';
    var values = [iso_date, status];

    const dbres = await connection.query(text, values);
    return dbres.rows[0];
}

async function get_today_menu(connection, iso_date) {
    // Get today's menu
    const menu_text = 'SELECT * FROM menus WHERE day = $1;';
    const menu_values = [iso_date];

    const dbres = await connection.query(menu_text, menu_values);

    return {
        l: dbres.rows.length,
        name: dbres.rows[0].name,
        day: dbres.rows[0].day,
        vegetarian: dbres.rows[0].vegetarian,
        open: dbres.rows[0].open
    };
}

async function vote_add(connection, iso_date, vote, student_class) {
    // get menu id
    const text_menu = 'SELECT id FROM menus WHERE day = $1;';
    const values_menu = [iso_date];
    const menu_id = await connection.query(text_menu, values_menu);

    const text = 'INSERT INTO votes(day, menuid, vote, class) VALUES ($1, $2, $3, $4) RETURNING *;';
    const values = [iso_date, menu_id.rows[0].id, vote, student_class];

    const dbres = await connection.query(text, values);

    return dbres.rows[0];
}

async function get_results_all_class(connection, day) {
    const value = [iso_date];

    const get_all_votes = 'SELECT COUNT(*) FROM votes WHERE day = $1;';
    const get_average = 'SELECT SUM(vote) FROM votes WHERE day = $1;';

    const get_class_votes = 'SELECT COUNT(*) FROM votes WHERE day = $1 AND class = $2;';
    const get_class_averages = 'SELECT SUM(vote) FROM votes WHERE day = $1 AND class = $2;';
    
    var values = [];
    for(var cl = 1; cl < 9; cl++) {
        values.push([day, cl]);
    }

    const get_all_votes_res = await connection.query(get_all_votes, value);
    const get_average_res = await connection.query(get_average, value)

    const total = get_all_votes_res.rows[0].count;
    const average = get_average_res.rows[0].sum / (total != 0 ? total : 1);

    var class_avg = [];
    var class_total = [];
    for(var i = 0; i < 8; i++) {
        var res_total = await connection.query(get_class_votes, values[i]);
        var res_avg = await connection.query(get_class_averages, values[i]);

        class_total.push(res_total.rows[0].count);
        class_avg.push(res_avg.rows[0].sum / (res_total.rows[0].count != 0 ? res_total.rows[0].count : 1));
    }

    return {
        total,
        average,
        class_total,
        class_avg
    };
}

async function get_results_class(connection, student_class, day) {
    const values = [day, student_class];

    const get_class_votes = 'SELECT COUNT(*) FROM votes WHERE day = $1 AND class = $2;';
    const get_class_average = 'SELECT COUNT(vote) FROM votes WHERE day = $1 AND class = $2;';

    const get_class_votes_res = await connection.query(get_class_votes, values);
    const get_average_class_res = await connection.query(get_class_average, values);

    const class_total = get_class_votes_res.rows[0].count;
    const average_class = get_average_class_res.rows[0].count / (class_total != 0 ? class_total : 1);

    return {
        class_total,
        average_class
    };
}

async function get_results_no_class(connection, day) {
    const value = [day];

    const get_all_votes = 'SELECT COUNT(*) FROM votes WHERE day = $1;';
    const get_average = 'SELECT COUNT(vote) FROM votes WHERE day = $1;';

    const get_all_votes_res = await connection.query(get_all_votes, value);
    const get_average_res = await connection.query(get_average, value);

    const total = get_all_votes_res.rows[0].count;
    const average = get_average_res.rows[0].count / (total != 0 ? total : 1);

    return {
        total,
        average
    };
}

async function get_stats(connection) {
    const values = [];
    const get_ranking = "SELECT * FROM stats;";
    var ranking = await connection.query(get_ranking, values);

    return {ranking: ranking.rows};
}