import { useState, useEffect } from 'react';
import Header from '../components/Header';
import axios from 'axios';
import Error from '../components/Error';
import MenuDialog from '../components/MenuDialog';
import { useRouter } from 'next/router';
import Stats from '../components/Stats';

export default function Menu() {
    const router = useRouter();

    const [menusState, setMenusState] = useState([]);
    const [saveState, setSaveState] = useState(false);

    const [status, setStatus] = useState(false);
    const [created, setCreated] = useState(false);
	const [errorState, setErrorState] = useState("");

	const [menuName, setMenuName] = useState("");
	const [menuNames, setMenuNames] = useState([]);

	const [results, setResults] = useState({
        results_all: undefined,
		results_class: undefined
    });

    function changeMenus(menus) {
        console.log("global change menus: ", menus)
        setMenusState(menus);
    }

    function handleMenuChange(e) {
        setMenuName(e.target.value);
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
            axios.post(URL, {menus: {menus: menusState.filter(e => {return e.name != ""})}, token: document.cookie.substring(6, document.cookie.length)}).then(async (res) => {
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
            axios.post(URL, {menus: {menus: menusState.filter(e => {return e.name != null})}, token: document.cookie.substring(6, document.cookie.length)}).then(async (res) => {
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
            setMenusState(res.data.menus.menus)
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
            setResults({ results_all: res.data.results_all, results_class: res.data.results_class });
            setMenuNames(res.data.results_all.map(e => { return e.name }));
            setMenuName(res.data.results_all[0].name);
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
                    <div className='m-4 flex flex-col w-1/2'>  
                        <MenuDialog changeMenus={changeMenus} menus={menusState} />
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
                <div className='flex flex-col justify-center items-center'>
                    <Stats menuNames={menuNames} results={results} menuName={menuName} handleMenuChange={handleMenuChange} />
                </div>
            </div>
        </>
    )
}
