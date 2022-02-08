require('dotenv').config();
const { v4 } = require('uuid');
const { initializeApp, applicationDefault, cert } = require('firebase-admin/app');
const { getFirestore, Timestamp, FieldValue } = require('firebase-admin/firestore');

module.exports = {
    get_connection,
    init,

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

function init() {
    if(process.env.ENVIRONMENT == "PROD") {
        initializeApp({
            credential: applicationDefault()
        });
    } else {
        const serviceAccount = require('../key.json');

        initializeApp({
            credential: cert(serviceAccount)
        });
    }
    return;
}

function get_connection() {
    // Connect to database
    var db = getFirestore();

    return db;
}

//  Count how many menu's today, to ensure not more than 1 is created
async function count_menu(connection, iso_date) {
    const snapshot = await connection.collection('menus').get();

    var count = 0;
    snapshot.forEach((doc) => {
        const data = doc.data();
        if(data.day == iso_date) count++;
    });

    return count;
}

// Create Menu
async function add_menu(connection, iso_date, menus) {
    const docRef = await connection.collection('menus').doc(iso_date);

    var data = {
        day: iso_date,
        menus: JSON.stringify(menus),
        open: false,
        createdAt: new Date().toISOString()
    };
    await docRef.set(data);

    return data;
}

async function today_menu(connection, iso_date) {
    return await connection.collection('menus').doc(iso_date).get();
}

async function update_menu(connection, iso_date, menus, old_menu_status) {
    var data = {
        day: iso_date,
        menus: JSON.stringify(menus),
        open: old_menu_status,
        createdAt: new Date().toISOString()
    };
    const ref = await connection.collection('menus').doc(iso_date).update(data);
    return data;
}

async function remove_menu(connection, iso_date) {    
    return await connection.collection('menus').doc(iso_date).delete();
}

async function set_menu_status(connection, iso_date, status) {
    var data = {
        open: status
    };
    const ref = await connection.collection('menus').doc(iso_date).update(data);
    return ref;
}

async function get_today_menu(connection, iso_date) {
    var doc = await connection.collection('menus').doc(iso_date).get();

    var l = 0;
    if(doc.exists) {
        l = 1;
    } else {
        l = 0;
    }

    return {l, data: doc.data()};
}

async function vote_add(connection, iso_date, vote, menu, student_class, ip, user_token) {
    const docRef = await connection.collection('votes').doc(v4() + '+' + iso_date);

    var data = {
        day: iso_date,
        vote: vote,
        menu: menu,
        class: student_class,
        createdAt: new Date().toISOString()
    };
    if(process.env.ENVIRONMENT == "PROD") {
        data.ip = ip;
    }
    if(user_token != null) {
        data.user_token = user_token;
    }
    await docRef.set(data);

    return data;
}

async function get_results_all_class(connection, day) {
    // get menus
    var m = await connection.collection('menus').doc(day).get();
    if(!m.exists) {
        return {"error": "No data for this day."};
    }

    var me = JSON.parse(m.data().menus);
    var menus = me.menus.map(e => { return e.uuid });
    var names = me.menus.map(e => { return e.name });

    var values = [];
    for(var cl = 1; cl < 9; cl++) {
        values.push(cl);
    }

    // get total
    var menus_results = {results_all: [], results_class: {}};
    for(var i = 0; i < menus.length; i++) {
        var get_all_votes_res = 0;
        var get_average_res = 0;
    
        const ref = connection.collection('votes');
        const snapshot = await ref.where('day', '==', day).where('menu', '==', menus[i]).get();
        snapshot.forEach((doc) => {
            var data = doc.data();
    
            get_all_votes_res++;
            get_average_res += data.vote;
        });
    
        const total = get_all_votes_res;
        const average = get_average_res / (total != 0 ? total : 1);

        menus_results.results_all.push({name: names[i], uuid: menus[i], total, average});
    }

    // get for each class
    for(var i = 0; i < menus.length; i++) {
        menus_results.results_class[menus[i]] = [];

        var class_avg = [];
        var class_total = [];
        for(var j = 0; j < 8; j++) {
            var res_total = 0;
            var res_avg = 0;

            const ref = connection.collection('votes');
            const snapshot = await ref.where('day', '==', day).where('menu', '==', menus[i]).where('class', '==', values[j]).get();
            snapshot.forEach((doc) => {
                var data = doc.data();

                res_total++;
                res_avg += data.vote;
            });

            class_total.push(res_total);
            class_avg.push(res_avg / (res_total != 0 ? res_total : 1));
        }
            
        menus_results.results_class[menus[i]].push({class_total, class_avg});
    }

    return menus_results;
}

async function get_results_class(connection, student_class, day, menu) {
    var get_class_votes_res = 0;
    var get_average_class_res = 0;

    const ref = connection.collection('votes');
    const snapshot = await ref.where('day', '==', day).where('menu', '==', menu).where('class', '==', student_class).get();
    snapshot.forEach(doc => {
        var data = doc.data();

        get_class_votes_res++;
        get_average_class_res += data.vote;
    });

    var class_total = get_class_votes_res;
    var average_class = get_average_class_res / (class_total != 0 ? class_total : 1);

    return {
        class_total,
        average_class
    };
}

async function get_results_no_class(connection, day, menu) {
    var get_all_votes_res = 0;
    var get_average_res = 0;

    const ref = connection.collection('votes');
    const snapshot = await ref.where('day', '==', day).where('menu', '==', menu).get();
    snapshot.forEach((doc) => {
        var data = doc.data();

        get_all_votes_res++;
        get_average_res += data.vote;
    });

    const total = get_all_votes_res;
    const average = get_average_res / (total != 0 ? total : 1);

    return {
        total,
        average
    };
}

async function get_stats(connection) {
    const snapshot = await connection.collection('stats').get();
    var stats = [];
    snapshot.forEach((doc) => {
        stats.push(doc.data())
    });

    return {ranking: stats};
}