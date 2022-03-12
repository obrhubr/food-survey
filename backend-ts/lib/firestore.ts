require('dotenv').config();
import { v4 } from 'uuid';
import { initializeApp, applicationDefault, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

/**
 * Function to initialise the firestore
*/
export function init() {
	if (process.env.ENVIRONMENT == 'PROD') {
		initializeApp({
			credential: applicationDefault(),
		});
	} else if (process.env.ENVIRONMENT == 'LOCAL') {
		const serviceAccount = require('../key.json');

		initializeApp({
			credential: cert(serviceAccount),
		});
	}
	return;
}

/**
 * Function to get a connection to firestore
*/
export function get_connection() {
  	// Connect to database
	const db = getFirestore();

	return db;
}

/**
 * Function to ensure no more than one menu is created per day
 * @param {Connection} connection Connection to Firestore
 * @param {Iso_date} string Today's date
*/
export async function count_menu(connection: FirebaseFirestore.Firestore, iso_date: string) {
	const snapshot = await connection.collection('menus').get();

	let count = 0;
	snapshot.forEach((doc: {data: () => any}) => {
		const data = doc.data();
		if (data.day == iso_date) count++;
	});

	return count;
}

/**
 * Function to create menu
 * @param {Connection} connection Connection to Firestore
 * @param {Iso_date} string Today's date
 * @param {menus} object The menus (name, vegetarian, uuid)
*/
export async function add_menu(connection: FirebaseFirestore.Firestore, iso_date: string, menus: {menus: {name: string; vegetarian: boolean; uuid: string}[]}) {
	const docRef = await connection.collection('menus').doc(iso_date);

	const data = {
		day: iso_date,
		menus: JSON.stringify(menus),
		open: false,
		createdAt: new Date().toISOString(),
	};
	await docRef.set(data);

	return data;
}

/**
 * Function to get today's menu
 * @param {Connection} connection Connection to Firestore
 * @param {Iso_date} string Today's date
*/
export async function today_menu(connection: FirebaseFirestore.Firestore, iso_date: string) {
  	var doc: any = await connection.collection('menus').doc(iso_date).get();
	return {exists: doc.exists, data: doc.data()};
}

/**
 * Function to update menu
 * @param {Connection} connection Connection to Firestore
 * @param {Iso_date} string Today's date
 * @param {menus} object The menus (name, vegetarian, uuid)
 * @param {old_menu_stats} boolean The status of the menu, to ensure the vote isn't closed when updating
*/
export async function update_menu(connection: FirebaseFirestore.Firestore, iso_date: string, menus: {menus: {name: string; vegetarian: boolean; uuid: string}[]}, old_menu_status: boolean) {
	const data = {
		day: iso_date,
		menus: JSON.stringify(menus),
		open: old_menu_status,
		createdAt: new Date().toISOString(),
	};
	const ref = await connection.collection('menus').doc(iso_date).update(data);
	return data;
}

/**
 * Function to remove menu
 * @param {Connection} connection Connection to Firestore
 * @param {Iso_date} string Today's date
*/
export async function remove_menu(connection: FirebaseFirestore.Firestore, iso_date: string) {
  	return await connection.collection('menus').doc(iso_date).delete();
}

/**
 * Function to set the status of today's menu
 * @param {Connection} connection Connection to Firestore
 * @param {Iso_date} string Today's date
 * @param {Status} boolean If the vote is open or not
*/
export async function set_menu_status(connection: FirebaseFirestore.Firestore, iso_date: string, status: boolean) {
	const data = {
		open: status,
	};
	const ref = await connection.collection('menus').doc(iso_date).update(data);
	return ref;
}

/**
 * Function to add a vote
 * @param {Connection} connection Connection to Firestore
 * @param {Iso_date} string Today's date
 * @param {Vote} int Score the user has given to the menu (between 1 and 5)
 * @param {Menu} string The id of the menu the user has chosen
 * @param {Student_class} int Class (between 1 and 9)
 * @param {Ip} string Ip of the user (to deduplicate data when analysing the votes)
 * @param {User_token} uuidv4 Uuidv4 of the user, given to him when voting, stored client-side (to deduplicate data when analysing the votes)
 * @param {Fp} string Fingerprint of the user (to deduplicate data when analysing the votes)
*/
export async function vote_add(connection: FirebaseFirestore.Firestore, iso_date: string, vote: number, menu: string, student_class: number, ip: string | undefined, user_token: string, fp: string) {
	const docRef = connection.collection('votes').doc(v4() + '+' + iso_date);

	const data = {
		day: iso_date,
		vote: vote,
		menu: menu,
		class: student_class,
		createdAt: new Date().toISOString(),
		fp: fp,
		user_token: user_token,
		ip: ip,
	};

	await docRef.set(data);

	return data;
}

/**
 * Function to get results (count votes from all classes)
 * @param {Connection} connection Connection to Firestore
 * @param {Iso_date} string Today's date
*/
export async function get_results_all_class(connection: FirebaseFirestore.Firestore, day: string) {
	// Get today's menus, if there isn't any menus yet, return error
	const m = await connection.collection('menus').doc(day).get();
	if (!m.exists) {
		return {error: 'No data for this day.'};
	}

	// Parse menu data (stored as string in DB)
	const me = JSON.parse((m.data() || {menus: []}).menus);
	// Create arrays containing the uuids and names of the menus
	const menus: string[] = me.menus.map((e: {uuid: string}) => {
		return e.uuid;
	});
	const names: string[] = me.menus.map((e: {name: string}) => {
		return e.name;
	});

	// Create array containing the ids of the classes
	const values: number[] = [1, 2, 3, 4, 5, 6, 7, 8];

	// Create object to store results
	const menus_results: {
		results_all: {name: string; uuid: string; total: number; average: number}[];
		results_class: {
		[key: string]: {class_total: number[]; class_avg: number[]}[];
		};
	} = {results_all: [], results_class: {}};

	// Calculate total score for each of the menus
	for (var i = 0; i < menus.length; i++) {
		// Initialise vote counters
		var get_all_votes_res: number = 0;
		var get_average_res: number = 0;

		// Get votes for today's date and the menu uuid
		const ref = connection.collection('votes');
		const snapshot = await ref.where('day', '==', day).where('menu', '==', menus[i]).get();
		snapshot.forEach(doc => {
			// For each vote, add vote to counters
			const data = doc.data();

			get_all_votes_res++;
			get_average_res += data.vote;
		});

		// Calculate totals by using simple average function
		const total: number = get_all_votes_res;
		const average: number = get_average_res / (total != 0 ? total : 1);

		// Push results for class to results object
		menus_results.results_all.push({
			name: names[i],
			uuid: menus[i],
			total,
			average,
		});
	}

	// Get results for eac menu, for each class
	for (var i = 0; i < menus.length; i++) {
		// Create array for menu uuid, to store result for each class
		menus_results.results_class[menus[i]] = [];

		const class_avg: number[] = [];
		const class_total: number[] = [];

		// Loop through each class, count the votes and get the average
		for (let j = 0; j < 8; j++) {
			var res_total: number = 0;
			var res_avg: number = 0;

			// Filter votes by menu, day and class
			const ref = connection.collection('votes');
			const snapshot = await ref.where('day', '==', day).where('menu', '==', menus[i]).where('class', '==', values[j]).get();
			snapshot.forEach(doc => {
				// Augment counters with votes
				const data = doc.data();

				res_total++;
				res_avg += data.vote;
			});

			// Push results to array
			class_total.push(res_total);
			class_avg.push(res_avg / (res_total != 0 ? res_total : 1));
		}

		// Push array to results object
		menus_results.results_class[menus[i]].push({class_total, class_avg});
	}

	return menus_results;
}

/**
 * Function to get results (only count votes from one class)
 * @param {Connection} connection Connection to Firestore
 * @param {Iso_date} string Today's date
 * @param {Student_class} int Class of user
 * @param {Menu} string Uuid of the menu the user has chosen
*/
export async function get_results_class(connection: FirebaseFirestore.Firestore, student_class: number, day: string, menu: string) {
	// Initialize counters
	let get_class_votes_res = 0;
	let get_average_class_res = 0;

	// Get all votes for day, menu and class
	const ref = connection.collection('votes');
	const snapshot = await ref.where('day', '==', day).where('menu', '==', menu).where('class', '==', student_class).get();
	snapshot.forEach(doc => {
		// Augment counters for votes
		const data = doc.data();

		get_class_votes_res++;
		get_average_class_res += data.vote;
	});

	// Ger averages
	const class_total = get_class_votes_res;
	const average_class = get_average_class_res / (class_total != 0 ? class_total : 1);

	return {
		class_total,
		average_class,
	};
}

/**
 * Function to get results (count votes from all classes) for specific menu
 * @param {Connection} connection Connection to Firestore
 * @param {Iso_date} string Today's date
 * @param {Menu} string Uuid of the menu the user has chosen
*/
export async function get_results_no_class(connection: FirebaseFirestore.Firestore, day: string, menu: string) {
	// Initialize counts for votes
	let get_all_votes_res = 0;
	let get_average_res = 0;

	// Filter votes by day and menu
	const ref = connection.collection('votes');
	const snapshot = await ref.where('day', '==', day).where('menu', '==', menu).get();
	snapshot.forEach(doc => {
		// Augment counters for each vote
		const data = doc.data();

		get_all_votes_res++;
		get_average_res += data.vote;
	});

	// Calculate averages
	const total = get_all_votes_res;
	const average = get_average_res / (total != 0 ? total : 1);

	return {
		total,
		average,
	};
}

/**
 * Function to get stats (admin panel)
 * @param {Connection} connection Connection to Firestore
*/
export async function get_stats(connection: FirebaseFirestore.Firestore) {
	// Get stats, saved to DB by python data-analysis script
	const snapshot = await connection.collection('stats').get();
	const stats: any[] = [];
	snapshot.forEach((doc: {data: () => any}) => {
		stats.push(doc.data());
	});

	return {ranking: stats};
}
