import { useState, useEffect } from 'react';
import Header from '../components/Header';
import axios from 'axios';
import Error from '../components/Error';
import { useRouter } from 'next/router';

export default function Menu() {
    const router = useRouter();

    const [menuName, setMenuName] = useState("");
    const [vegetarian, setVegetarian] = useState(false);
    const [saveState, setSaveState] = useState(false);

    const [status, setStatus] = useState(false);
    const [created, setCreated] = useState(false);
	const [errorState, setErrorState] = useState("");

	const [results, setResults] = useState({
        globalAvg: undefined,
		classAvg: undefined,
		votedGlobal: undefined,
		votedClass: undefined
    });

	function changeMenuName(event) {
		setMenuName(event.target.value);
	}
	function changeVegetarian(event) {
		setVegetarian(event.target.checked);
	}

    function statAnalysisManual () {
        setSaveState(true);
        const URL = process.env.NEXT_PUBLIC_API_PREFIX + '://' + process.env.NEXT_PUBLIC_API_HOST + ':' + process.env.NEXT_PUBLIC_API_PORT + '/results/requeststats';
        axios.post(URL, {token: document.cookie.substring(6, document.cookie.length)}).then(async (res) => {
            setTimeout(function(){
                setSaveState(false);
            }, 700);
        })
        .catch(error => {
            setSaveState(false);
            try {
                console.log(error.response);
                setErrorState(error.response.data.error);
            } catch (e) {
                console.log("OH OH:", error);
                setErrorState("Si tu vois ça et je suis à la cantine: dis moi que tout c'est cassé!");
            }
        });
    }

    function changeStatus() {
        setSaveState(true);
        const URL = process.env.NEXT_PUBLIC_API_PREFIX + '://' + process.env.NEXT_PUBLIC_API_HOST + ':' + process.env.NEXT_PUBLIC_API_PORT + '/menu/status';
        axios.post(URL, {status: !status, token: document.cookie.substring(6, document.cookie.length)}).then(async (res) => {
            setStatus(!status);
            setTimeout(function(){
                setSaveState(false);
            }, 700);
        })
        .catch(error => {
            setSaveState(false);
            try {
                console.log(error.response);
                setErrorState(error.response.data.error);
            } catch (e) {
                console.log("OH OH:", error);
                setErrorState("Si tu vois ça et je suis à la cantine: dis moi que tout c'est cassé!");
            }
        });
    }

    function updateMenu() {
        setSaveState(true);
        if(created) {
            // update
            const URL = process.env.NEXT_PUBLIC_API_PREFIX + '://' + process.env.NEXT_PUBLIC_API_HOST + ':' + process.env.NEXT_PUBLIC_API_PORT + '/menu/edit';
            axios.post(URL, {name: menuName, vegetarian, token: document.cookie.substring(6, document.cookie.length)}).then(async (res) => {
                setTimeout(function(){
                    setSaveState(false);
                }, 700);
            })
            .catch(error => {
                setSaveState(false);
                try {
                    console.log(error.response);
                    setErrorState(error.response.data.error);
                } catch (e) {
                    console.log("OH OH:", error);
                    setErrorState("Si tu vois ça et je suis à la cantine: dis moi que tout c'est cassé!");
                }
            });
        } else {
            // create
            const URL = process.env.NEXT_PUBLIC_API_PREFIX + '://' + process.env.NEXT_PUBLIC_API_HOST + ':' + process.env.NEXT_PUBLIC_API_PORT + '/menu/add';
            axios.post(URL, {name: menuName, vegetarian, token: document.cookie.substring(6, document.cookie.length)}).then(async (res) => {
                setTimeout(function(){
                    setSaveState(false);
                }, 700);
            })
            .catch(error => {
                setSaveState(false);
                try {
                    console.log(error.response);
                    setErrorState(error.response.data.error);
                } catch (e) {
                    console.log("OH OH:", error);
                    setErrorState("Si tu vois ça et je suis à la cantine: dis moi que tout c'est cassé!");
                }
            });
        }
    }

    function deleteMenu() {
        setSaveState(true);

        const URL = process.env.NEXT_PUBLIC_API_PREFIX + '://' + process.env.NEXT_PUBLIC_API_HOST + ':' + process.env.NEXT_PUBLIC_API_PORT + '/menu/remove';
        axios.post(URL, {token: document.cookie.substring(6, document.cookie.length)}).then(async (res) => {
            setMenuName("");
            setTimeout(function(){
                setSaveState(false);
            }, 700);
        })
        .catch(error => {
            setSaveState(false);
            try {
                console.log(error.response);
                setErrorState(error.response.data.error);
            } catch (e) {
                console.log("OH OH:", error);
                setErrorState("Si tu vois ça et je suis à la cantine: dis moi que tout c'est cassé!");
            }
        });
    }

    useEffect(() => {
        // check if token is present
        if(document.cookie == '') {
            router.push('/');
        }

        const URL = process.env.NEXT_PUBLIC_API_PREFIX + '://' + process.env.NEXT_PUBLIC_API_HOST + ':' + process.env.NEXT_PUBLIC_API_PORT + '/menu/today';
        axios.get(URL).then(async (res) => {
            setMenuName(res.data.name);
            setVegetarian(res.data.vegetarian);
            setStatus(res.data.open);
            setCreated(res.data.exists);
        })
        .catch(error => {
            try {
                console.log(error.response);
                setErrorState(error.response.data.error);
            } catch (e) {
                console.log("OH OH:", error);
                setErrorState("Si tu vois ça et je suis à la cantine: dis moi que tout c'est cassé!");
            }
        });

        // Fetch results
        const URLResults = process.env.NEXT_PUBLIC_API_PREFIX + '://' + process.env.NEXT_PUBLIC_API_HOST + ':' + process.env.NEXT_PUBLIC_API_PORT + '/results/today';
        axios.post(URLResults, {token: document.cookie.substring(6, document.cookie.length)}).then(async (res) => {
            setResults({ globalAvg: res.data.average, classAvg: res.data.class_avg, votedGlobal: res.data.total, votedClass: res.data.class_total });
        })
        .catch(error => {
            try {
                console.log(error.response);
                setErrorState(error.response.data.error);
            } catch (e) {
                console.log("OH OH:", error);
                setErrorState("Si tu vois ça et je suis à la cantine: dis moi que tout c'est cassé!");
            }
        });
    }, [setStatus, router]);

	function matchingAvg(avg, num) {
		return Math.round(avg) == num ? 400 : 200;
	}
    
	function getClassFromNumber(c) {
		if(c == 1) {
			return 'Terminale';
		} else if(c == 2) {
			return '1ère';
		} else if(c == 3) {
			return '2nde';
		} else if(c == 4) {
			return '3ème';
		} else if(c == 5) {
			return '4ème';
		} else if(c == 6) {
			return '5ème';
		} else if(c == 7) {
			return '6ème';
		} else if(c == 8) {
			return 'Professeur';
		}
		return '';
	}

    return (
		<>
            <Header></Header>
            <div className='flex flex-col justify-center items-center'>
                {errorState != "" ?
                    <Error error={errorState}></Error>
                :
                    <>
                    </>
                }
                {saveState != "" ?
                    <>
                        <div className='mb-8 my-2 mx-1'>
                            <div className='p-1'>
                                <button type="button" className="inline-flex items-center px-4 py-2 font-semibold leading-6 text-lg shadow rounded-md text-white bg-indigo-300 hover:bg-indige-200 transition ease-in-out duration-150 cursor-not-allowed" disabled="">
                                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    Saving
                                </button>
                            </div>
                        </div>
                    </>
                :
                    <>
                    </>
                }
                <div className='text-xl'>
                    Create, change or delete menu
                </div>
                <div className='m-4 flex flex-col justify-center items-center w-full'>
                    <div className='m-4 flex flex-col'>
                        <div className='flex flex-col items-center justify-center m-4'>
                            <input className='my-2 w-64 appearance-none relative block px-3 py-1 mx-4 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm' type="text" placeholder='Lasagne Végétarienne...' value={menuName} onChange={changeMenuName}/>
                            <label className="my-2 inline-flex items-center text-center px-3 py-1 mx-4 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md ">
                                <input type="checkbox" className="form-checkbox h-5 w-5 text-green-600" checked={vegetarian} onChange={changeVegetarian}/><span className="ml-2 text-gray-700">Vegetarian</span>
                            </label>
                        </div>
                        <div className='flex flex-row items-center justify-center m-4'>
                            <div onClick={updateMenu} className='mx-4 cursor-pointer p-2 px-5 rounded-md text-white bg-green-600 hover:bg-green-700'>
                                Update
                            </div>
                            <div onClick={deleteMenu} className='mx-4 cursor-pointer p-2 px-5 rounded-md text-white bg-red-600 hover:bg-red-700'>
                                Delete
                            </div>
                        </div>
                    </div>
                </div>
                <div className='m-5'></div>
                <div className='text-xl'>
                    Change if voting is open or closed
                </div>
                <div className='m-4 flex flex-row'>
                    <div className={'m-4 p-2 px-6 rounded-md text-black text-center bg-' + (status ? "green" : "red") + '-200'}>
                        {status ? "Voting Open" : "Voting Closed"}
                    </div>
                    <div onClick={changeStatus} className='cursor-pointer m-4 p-2 px-6 text-center rounded-md text-white bg-indigo-600 hover:bg-indigo-700'>
                        Change Status
                    </div>
                </div><div className='text-xl'>
                    Request statistical analysis manually
                </div>
                <div className='m-4 flex flex-row'>
                    <div onClick={statAnalysisManual} className='cursor-pointer m-4 p-2 px-6 text-center rounded-md text-white bg-indigo-600 hover:bg-indigo-700'>
                        Request analysis
                    </div>
                </div>
                <div className='bg-green-200 bg-red-200'></div>

                <div>
                    <div className='flex flex-col items-start justify-start mb-10'>
                        <div className='flex flex-col items-start justify-start text-lg text-center mt-10 mb-5 w-full'>
                            <div className='w-full flex flex-row my-2 px-4 py-2'>
                                <div className='text-left mx-2 px-2 w-full'>
                                    Total ({results.votedGlobal} votes): 
                                </div>
                                <div className='flex flex-row w-full mx-4'>
                                    <div className={'bg-red-' + matchingAvg(results.globalAvg, 1) + ' w-full rounded-l-lg py-4 px-10'}> </div>
                                    <div className={'bg-orange-' + matchingAvg(results.globalAvg, 2) + ' w-full py-4 px-10'}> </div>
                                    <div className={'bg-amber-' + matchingAvg(results.globalAvg, 3) + ' w-full py-4 px-10'}> </div>
                                    <div className={'bg-lime-' + matchingAvg(results.globalAvg, 4) + ' w-full py-4 px-10'}> </div>
                                    <div className={'bg-green-' + matchingAvg(results.globalAvg, 5) + ' w-full rounded-r-lg py-4 px-10'}> </div>
                                </div>
                                <div className='text-right'>
                                    {results.globalAvg}
                                </div>
                            </div>

                            {results.votedClass != undefined ?
                                results.classAvg.map((item, i) => {
                                    return (
                                        <div key={i}>
                                            <div className='w-full flex flex-row my-2 px-4 py-2'>
                                                <div className='text-left mx-2 px-2 w-full'>
                                                    Total for {getClassFromNumber(i+1)} ({results.votedClass[i]} votes): 
                                                </div>
                                                <div className='flex flex-row w-full mx-4'>
                                                    <div className={'bg-red-' + matchingAvg(item, 1) + ' w-full rounded-l-lg py-4 px-10'}> </div>
                                                    <div className={'bg-orange-' + matchingAvg(item, 2) + ' w-full py-4 px-10'}> </div>
                                                    <div className={'bg-amber-' + matchingAvg(item, 3) + ' w-full py-4 px-10'}> </div>
                                                    <div className={'bg-lime-' + matchingAvg(item, 4) + ' w-full py-4 px-10'}> </div>
                                                    <div className={'bg-green-' + matchingAvg(item, 5) + ' w-full rounded-r-lg py-4 px-10'}> </div>
                                                </div>
                                                <div className='text-right'>
                                                    {item}
                                                </div>
                                            </div>
                                        </div>
                                    )    
                                    })
                            :
                                    <></>
                            }
                            
                        </div>
                    </div>
                    <div className=''>
                        <div className='bg-red-200'> </div>
                        <div className='bg-orange-200'> </div>
                        <div className='bg-amber-200'> </div>
                        <div className='bg-lime-200'> </div>
                        <div className='bg-green-200'> </div>
                    </div>
                </div>
            </div>
        </>
    )
}
