import { useState, useEffect } from 'react';
import axios from 'axios';
import Results from '../components/Results';
import VoteClass from '../components/VoteClass';
import VoteScore from '../components/VoteScore';
import VoteMenu from '../components/VoteMenu';
import Error from '../components/Error';
import Image from 'next/image';
import FingerprintJS from '@fingerprintjs/fingerprintjs';
import CELogo from '../components/CELogo';
import Message from '../components/Message';

export default function Home() {
	const [voteStatus, setVoteStatus] = useState(false);
	const [messageState, setMessageState] = useState(false);
	const [message, setMessageTextState] = useState({});
	const [errorState, setErrorState] = useState("");

	const [voteState, setVoteState] = useState({
        vote: undefined,
		class: undefined,
		menu: undefined,
		name: undefined
    });

	const [menuState, setMenuState] = useState({
		menus: [],
		day: undefined,
		open: false
	});

	const [resultState, setResultState] = useState({
        globalAvg: undefined,
		classAvg: undefined,
		votedGlobal: undefined,
		votedClass: undefined
    });

	useEffect(() => {
        const URL = process.env.NEXT_PUBLIC_API_PREFIX + '://' + process.env.NEXT_PUBLIC_API_HOST + ':' + process.env.NEXT_PUBLIC_API_PORT + '/votes/status';
        axios.get(URL).then(async (res) => {
			if(res.data.status) {	
				const URL = process.env.NEXT_PUBLIC_API_PREFIX + '://' + process.env.NEXT_PUBLIC_API_HOST + ':' + process.env.NEXT_PUBLIC_API_PORT + '/menu/today';
				axios.get(URL).then(async (res) => {
					setMenuState(res.data);
				})
				.catch(error => {
					try {
						console.log(error.response);
						setErrorState(error.response.data.error);
					} catch (e) {
						console.log("OH OH:", error);
						setErrorState("Erreur fatale. Essayez encore une fois.");
					}
				});
			}

			setVoteStatus(res.data.status);
        })
        .catch(error => {
			try {
				console.log(error.response);
				setErrorState(error.response.data.error);
			} catch (e) {
				console.log("OH OH:", error);
				setErrorState("Erreur fatale. Essayez encore une fois.");
			}
        });

		const URLResults = process.env.NEXT_PUBLIC_API_PREFIX + '://' + process.env.NEXT_PUBLIC_API_HOST + ':' + process.env.NEXT_PUBLIC_API_PORT + '/menu/message';
		axios.get(URLResults).then(async (res) => {
			setMessageTextState({text: res.data.data.message, uuid: res.data.data.uuid});
		})
		.catch(error => {
			try {
				console.log(error.response);
				setErrorState(error.response.data.error);
			} catch (e) {
				console.log("OH OH:", error);
				setErrorState("Erreur fatale. Essayez encore une fois.");
			}
		});
    }, [setVoteStatus, setMenuState]);

	function setVote(e) {
		var id = e.target.id;

		// delay to not confuse user
		var delayInMilliseconds = 100;
		setTimeout(function() {
			setVoteState({
				vote: id.charAt(5).toString(),
				class: voteState.class,
				menu: voteState.menu,
				name: voteState.name
			})
		}, delayInMilliseconds);
	};

	function setMenu(e) {
		var t = e.target;
		// delay to not confuse user
		var delayInMilliseconds = 100;
		setTimeout(function() {
			setVoteState({
				vote: voteState.vote,
				class: voteState.class,
				name: t.textContent,
				menu: t.id
			})
		}, delayInMilliseconds);
	};

	function setClass(e) {
		var id = e.target.id;

		// delay to not confuse user
		var delayInMilliseconds = 100;
		setTimeout(async function() {
			// get fp
			const fpPromise = FingerprintJS.load()
			const fp = await fpPromise
			const result = await fp.get()
			//send results
			const URLsend = process.env.NEXT_PUBLIC_API_PREFIX + '://' + process.env.NEXT_PUBLIC_API_HOST + ':' + process.env.NEXT_PUBLIC_API_PORT + '/votes/vote';
			const alreadyVoted = localStorage.getItem('alreadyVoted') && (new Date().getTime() - localStorage.getItem('dateVoted') < 43200000);
			axios.post(URLsend, {
				vote: parseInt(voteState.vote),
				class: parseInt(id.charAt(6).toString()),
				menu: voteState.menu,
				// Check localstorage to prevent re-voting
				alreadyVoted: alreadyVoted != null ? alreadyVoted : false,
				user_token: localStorage.getItem('user_token'),
				fp: result.visitorId
			}
			).then(async (res) => {
				// Set localstorage to prevent re-voting
				localStorage.setItem('alreadyVoted', true);
				localStorage.setItem('dateVoted', new Date().getTime());
				// set user token
				localStorage.setItem('user_token', res.data.user_token);

				setVoteState({
					vote: voteState.vote,
					class: id.charAt(6).toString(),
					menu: voteState.menu,
					name: voteState.name
				});
			})
			.catch(error => {
				try {
					console.log(error.response);
					setErrorState(error.response.data.error);
				} catch (e) {
					console.log("OH OH:", error);
					setErrorState("Erreur fatale. Essayez encore une fois.");
				}
        	});

			// Fetch results
			const URLResults = process.env.NEXT_PUBLIC_API_PREFIX + '://' + process.env.NEXT_PUBLIC_API_HOST + ':' + process.env.NEXT_PUBLIC_API_PORT + '/results/current';
			axios.post(URLResults, {class: parseInt(id.charAt(6).toString()), menu: voteState.menu}).then(async (res) => {
				setResultState({ globalAvg: res.data.average, classAvg: res.data.average_class, votedGlobal: res.data.total, votedClass: res.data.class_total });
			})
			.catch(error => {
				try {
					console.log(error.response);
					setErrorState(error.response.data.error);
				} catch (e) {
					console.log("OH OH:", error);
					setErrorState("Erreur fatale. Essayez encore une fois.");
				}
        	});
		}, delayInMilliseconds);
	};
	
	function acknowledgeMessage() {
		// Add the uuid of the message to localstorage
		localStorage.setItem('message+' + message.uuid, true);
		setMessageState(true);
	}

	function messageNotRead() {
		// Check localstorage for message uuid
		const readstatus = localStorage.getItem('message+'+message.uuid);
		console.log(readstatus);
		return readstatus != null ? readstatus : false;
	}

    return (
		<div className='flex flex-col justify-between' style={{minHeight: "100vh"}}>
			<div className="h-full w-full flex items-center justify-center">
				<div className="h-full flex flex-col items-center justify-center sm:w-1/2">
					{voteStatus ?
						errorState != "" ?
							<Error error={errorState}/>
						:
							<>
								{resultState.globalAvg == undefined ?
									voteState.menu == null ?
											menuState.menus.menus == null ?
												<></>
											:
												!messageState && !messageNotRead() ?
													<>
														<Message message={message} acknowledgeMessage={acknowledgeMessage}/>
													</>
												:
													<>
														<VoteMenu menus={menuState.menus.menus} setMenu={setMenu}/>
													</>
										:
											voteState.vote == undefined ?
												<>
													<VoteScore menu={voteState.name} setVote={setVote}/>
												</>
											:
												<>
													<VoteClass setClass={setClass}/>
												</>
								:
									<>
										<Results results={resultState} votes={voteState}/>
									</>
								}
							</>
						
					:
						errorState != "" ?
							<Error error={errorState}/>
						:
							<div className='mx-10'>
								<div className='items-center flex justify-center'>
									<Image width="390" height="390" alt="Logo du conseil" src="/logo.png"/>
								</div>
								<div className='my-2 p-2 text-xl flex flex-col items-center text-center justify-center'>
									<div className='my-5'>Lycee Francais de Vienne</div>
									<div className='my-5'>Votez pour vos menus de cantine favoris!</div>
									<div className='my-5 text-gray-500'>(Le vote est ouvert de 11h40 à 13h50)</div>
								</div>

								<div className='p-1 flex justify-center items-center'>
									<button type="button" className="inline-flex items-center px-4 py-2 font-semibold leading-6 text-lg shadow rounded-md text-white bg-blue-500 hover:bg-blue-400 transition ease-in-out duration-150 cursor-not-allowed" disabled="">
										<svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
											<circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
											<path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
										</svg>
										Le vote n&apos;a pas encore commencé...
									</button>
								</div>

								<div className='p-1 my-5 text-center'>
									<div>Par Niklas Oberhuber, membre des élèves du CE</div>
								</div>
							</div>
					}
				</div>
			</div>
			{!voteStatus ?
				<></>
			:
				<footer>
					<div className='p-1 my-5 text-center'>
						<CELogo size="100"></CELogo>
					</div>
				</footer>
			}
		</div>
    )
}
