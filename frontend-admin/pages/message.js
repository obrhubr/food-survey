import { useState, useEffect } from 'react';
import Header from '../components/Header';
import axios from 'axios';
import Error from '../components/Error';

export default function Menu() {
	const [errorState, setErrorState] = useState("");
	const [currentMessage, setCurrentMessage] = useState("");

    const [message, setMessage] = useState("");
	function changeMessage(event) {
		setMessage(event.target.value);
	}

    useEffect(() => {
        const URL = process.env.NEXT_PUBLIC_API_PREFIX + '://' + process.env.NEXT_PUBLIC_API_HOST + ':' + process.env.NEXT_PUBLIC_API_PORT + '/menu/message';
        axios.get(URL).then(async (res) => {
            setCurrentMessage(res.data.data.message);
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
    }, []);

    function overwriteMessage() {
        const URL = process.env.NEXT_PUBLIC_API_PREFIX + '://' + process.env.NEXT_PUBLIC_API_HOST + ':' + process.env.NEXT_PUBLIC_API_PORT + '/menu/message/add';
        axios.post(URL, {token: document.cookie.substring(6, document.cookie.length), message: message}).then(async (res) => {
            setCurrentMessage(message);
            setMessage("");
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
    }

    function deleteMessage() {
        const URL = process.env.NEXT_PUBLIC_API_PREFIX + '://' + process.env.NEXT_PUBLIC_API_HOST + ':' + process.env.NEXT_PUBLIC_API_PORT + '/menu/message/remove';
        axios.post(URL, {token: document.cookie.substring(6, document.cookie.length)}).then(async (res) => {
            setMessage("");

            const URL2 = process.env.NEXT_PUBLIC_API_PREFIX + '://' + process.env.NEXT_PUBLIC_API_HOST + ':' + process.env.NEXT_PUBLIC_API_PORT + '/menu/message';
            axios.get(URL2).then(async (res) => {
                setCurrentMessage(res.data.data.message);
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
    }

    return (
		<>
            <Header></Header>
            {errorState != "" ?
                <></>
            :
                <div className='flex flex-col justify-center items-center m-6 text-2xl'>
                    <div>
                        <div className='text-center underline m-6'>
                            Current Message:
                        </div>
                        <div className='text-center m-6 text-gray-500'>
                            {currentMessage}
                        </div>
                    </div>
                    <div className='mt-10 w-full flex flex-col items-center justify-center text-2xl w-1/2'>
                        <input className='my-2 w-full appearance-none relative block px-3 py-1 mx-4 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10' type="text" placeholder='Your message...' value={message} onChange={changeMessage}/>

                        <div onClick={overwriteMessage} className='m-4 cursor-pointer p-2 px-5 rounded-md text-white bg-green-600 hover:bg-green-700'>
                            Overwrite Message
                        </div>
                        <div onClick={deleteMessage} className='m-4 cursor-pointer p-2 px-5 rounded-md text-white bg-red-600 hover:bg-red-700'>
                            Delete Current Message(the message before that one will now be displayed)
                        </div>
                    </div>
                </div>
            }
        </>
    )
}
