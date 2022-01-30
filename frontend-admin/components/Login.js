import React from 'react';
import Image from 'next/image';
import axios from 'axios';
import { useState, useEffect } from 'react';
import Error from '../components/Error';

export default function Login(props) {
	const [denied, setDenied] = useState(false);
	const [errorState, setErrorState] = useState("");

	const [username, setUsername] = useState("");
	const [password, setPassword] = useState("");

	function handleChangeUsername(event) {
		setDenied(false)
		setUsername(event.target.value);
	}
	function handleChangePassword(event) {
		setDenied(false)
		setPassword(event.target.value);
	}

    function logIn(event) {
		event.preventDefault();

		const URL = process.env.NEXT_PUBLIC_API_PREFIX + '://' + process.env.NEXT_PUBLIC_API_HOST + ':' + process.env.NEXT_PUBLIC_API_PORT + '/login';
        axios.post(URL, {username, password}).then(async (res) => {
			document.cookie = 'token=' + res.data.token + ';expires=12h;';
			setDenied(false);
			props.redirectAfterLogin();
        })
        .catch(error => {
			try {
				if(error.response.status == 404) {
					console.log("Access denied");
					setDenied(true);
					return;
				}

				setDenied(false);
				console.log(error.response);
				setErrorState(error.response.data.error);
			} catch (e) {
				setDenied(false);
				console.log("OH OH:", error);
				setErrorState("Erreur Fatale");
			}
        });
	}

    return(
        <>
            {errorState != "" ?
				<Error error={errorState}/>
            :
                <>
                </>
            }
            <div className="h-full w-full flex items-center justify-center">
			    <div className="h-full flex flex-col items-center justify-center sm:w-1/2">
                    <div className="min-h-full flex items-center justify-center px-4">
                        <div className="max-w-md w-full space-y-8">
                            <div className='flex justify-center flex-col items-center'>
                                <Image className="mx-auto h-6 w-auto" src="/logo.png" width={200} height={200} alt="Logo"/>
                                <h2 className="mt-3 text-center text-3xl font-extrabold text-gray-900">
                                    Sign in to your account
                                </h2>
                            </div>
                            {denied ?
                                    <div className="text-center text-red-500">
                                        Wrong username or password
                                    </div>
                                :
                                <div className="text-center text-red-500 p-2">
                                    
                                </div>
                            }
                            <form onSubmit={logIn} className="mt-8 space-y-6">
                                <div className="rounded-md shadow-sm -space-y-px">
                                    <div>
                                        <label className="sr-only">Email address</label>
                                        <input required value={username} onChange={handleChangeUsername} className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm" placeholder="Username..."/>
                                    </div>
                                    <div>
                                        <label className="sr-only">Password</label>
                                        <input required value={password} onChange={handleChangePassword} type="password"className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm" placeholder="Password..."/>
                                    </div>
                                </div>

                                <div>
                                    <button type="submit" className="cursor-pointer group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                                        <span className="absolute left-0 inset-y-0 flex items-center pl-3">
                                            <svg className="h-5 w-5 text-indigo-500 group-hover:text-indigo-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                                            <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z"/>
                                            </svg>
                                        </span>
                                        Sign in
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
            
        </>
    );
}
