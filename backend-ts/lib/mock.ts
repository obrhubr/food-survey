require('dotenv').config();

/**
 * Function to initialise the firestore
*/
export function init() {
	return;
}

/**
 * Function to get a connection to firestore
*/
export function get_connection() {
  	return;
}
/**
 * Function to ensure no more than one menu is created per day
 * @param {Connection} connection Connection to Firestore
 * @param {Iso_date} string Today's date
*/
export async function count_menu(connection: any, iso_date: string) {
	return 0;
}

/**
 * Function to create menu
 * @param {Connection} connection Connection to Firestore
 * @param {Iso_date} string Today's date
 * @param {menus} object The menus (name, vegetarian, uuid)
*/
export async function add_menu(connection: any, iso_date: string, menus: {menus: {name: string; vegetarian: boolean; uuid: string}[]}) {
	return {
		day: iso_date,
		menus: JSON.stringify(menus),
		open: false,
		createdAt: new Date().toISOString(),
	};
}

/**
 * Function to get today's menu
 * @param {Connection} connection Connection to Firestore
 * @param {Iso_date} string Today's date
*/
export async function today_menu(connection: any, iso_date: string) {
  	return {
		data: {
			open: true
		},
		exists: true
	};
}

/**
 * Function to update menu
 * @param {Connection} connection Connection to Firestore
 * @param {Iso_date} string Today's date
 * @param {menus} object The menus (name, vegetarian, uuid)
 * @param {old_menu_stats} boolean The status of the menu, to ensure the vote isn't closed when updating
*/
export async function update_menu(connection: any, iso_date: string, menus: {menus: {name: string; vegetarian: boolean; uuid: string}[]}, old_menu_status: boolean) {
	return {
		day: iso_date,
		menus: JSON.stringify(menus),
		open: true
	};
}

/**
 * Function to remove menu
 * @param {Connection} connection Connection to Firestore
 * @param {Iso_date} string Today's date
*/
export async function remove_menu(connection: any, iso_date: string) {
  	return;
}

/**
 * Function to set the status of today's menu
 * @param {Connection} connection Connection to Firestore
 * @param {Iso_date} string Today's date
 * @param {Status} boolean If the vote is open or not
*/
export async function set_menu_status(connection: any, iso_date: string, status: boolean) {
	return true;
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
export async function vote_add(connection: any, iso_date: string, vote: number, menu: string, student_class: number, ip: string | undefined, user_token: string, fp: string) {
	return {};
}

/**
 * Function to get results (count votes from all classes)
 * @param {Connection} connection Connection to Firestore
 * @param {Iso_date} string Today's date
*/
export async function get_results_all_class(connection: any, day: string) {
	// Get today's menus, if there isn't any menus yet, return error
	const m = {exists: true, data: () => { 
		return {
			menus: JSON.stringify({menus: [{name: "a", uuid: "a"}]})
		};
	}}
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
		const snapshot = [{data: () => { 
			return { vote: 1, class: 1 };
		}}];
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

	// Get results for each menu, for each class
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
			const snapshot = [{data: () => { 
				return { vote: j, class: j };
			}}];
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
export async function get_results_class(connection: any, student_class: number, day: string, menu: string) {
	// Initialize counters
	let get_class_votes_res = 0;
	let get_average_class_res = 0;

	// Get all votes for day, menu and class	
	const snapshot = [{data: () => { 
		return { vote: 1, class: student_class };
	}}];
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
export async function get_results_no_class(connection: any, day: string, menu: string) {
	// Initialize counts for votes
	let get_all_votes_res = 0;
	let get_average_res = 0;

	// Filter votes by day and menu
	const snapshot = [{data: () => { 
		return { vote: 1, class: 1 };
	}}];
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
export async function get_stats(connection: any) {
	// Get stats, saved to DB by python data-analysis script
	const snapshot = [
		{data: () => { return { day: "2022-03-10", name: "Paella", uuid: "adsfdsf", jsondata: `{"nw_most_positive": {"total": 0.2222222222222222, "by_class": {"perc": {"1": 1.0, "3": 2.0}}}, "nw_least_negative": {"total": 0.7777777777777778, "by_class": {"perc": {"1": 1.0, "3": 2.0}}}, "nw_median": {"by_class": {"1": 1.0, "3": 2.0}, "total": 2.0}, "nw_avg": {"by_class": {"1": 1.0, "3": 2.375}, "total": 2.2222222222222223}, "w_most_positive": {"total": 0.040161616161616155}, "w_least_negative": {"total": 0.23092929292929287}, "w_median": {"total": 1}, "w_avg": {"total": 1.8148148148148147}}` }; }},
		{data: () => { return { day: "2022-03-11", name: "Saussice de Frankfort", uuid: "asdfsdfsdfdsfd", jsondata: `{"nw_most_positive": {"total": 0.6, "by_class": {"perc": {"1": 0.0, "3": 0.0, "8": 0.0}}}, "nw_least_negative": {"total": 0.0, "by_class": {"perc": {"1": 0.0, "3": 0.0, "8": 0.0}}}, "nw_median": {"by_class": {"1": 3.0, "3": 4.0, "8": 3.0}, "total": 4.0}, "nw_avg": {"by_class": {"1": 3.0, "3": 4.0, "8": 3.0}, "total": 3.6}, "w_most_positive": {"total": 0.10843636363636362}, "w_least_negative": {"total": 0.0}, "w_median": {"total": 3}, "w_avg": {"total": 3.153846153846154}}` }; }}
	];
	const stats: any[] = [];
	snapshot.forEach((doc: {data: () => any}) => {
		stats.push(doc.data());
	});

	return {ranking: stats};
}

/**
 * Function to create menu
 * @param {Connection} connection Connection to Firestore
*/
export async function set_message(connection: FirebaseFirestore.Firestore, message: string) {
	return {
		message: "Test message2",
		uuid: "0290677e-7ed9-45fc-a80d-ee8800b2fd54",
		createdAt: "2022-03-20T15:52:46.985Z"
	};
}

/**
 * Function to remove menu
 * @param {Connection} connection Connection to Firestore
*/
export async function remove_message(connection: FirebaseFirestore.Firestore) {
	return {"message": "Successfully deleted message."};
}

/**
 * Function to get the last message
 * @param {Connection} connection Connection to Firestore
*/
export async function get_message(connection: FirebaseFirestore.Firestore) {
	return {
		exists: true,
		data: {
			createdAt: "2022-03-20T15:52:46.985Z",
			uuid: "0290677e-7ed9-45fc-a80d-ee8800b2fd54",
			message: "Test message2"
		}
	};
}