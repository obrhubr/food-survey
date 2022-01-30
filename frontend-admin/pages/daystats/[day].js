import { useState, useEffect } from 'react';
import Header from '../../components/Header';
import axios from 'axios';
import Error from '../../components/Error';
import { useRouter } from 'next/router';

export default function Daystats() {
    const router = useRouter();
    const { day } = router.query;
	const [errorState, setErrorState] = useState("");

	const [results, setResults] = useState({
        globalAvg: undefined,
		classAvg: undefined,
		votedGlobal: undefined,
		votedClass: undefined
    });

    useEffect(() => {
        // check if token is present
        if(document.cookie == '') {
            router.push('/');
        }

        if(day == null) {
            return
        }

        // Fetch results
        const URLResults = process.env.NEXT_PUBLIC_API_PREFIX + '://' + process.env.NEXT_PUBLIC_API_HOST + ':' + process.env.NEXT_PUBLIC_API_PORT + '/results/day';
        axios.post(URLResults, {token: document.cookie.substring(6, document.cookie.length), day}).then(async (res) => {
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
    }, [router, day]);

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
		}
		return '';
	}

    return (
		<>
            <Header></Header>
            {errorState != "" ?
                <Error error={errorState}></Error>
            :
                <>
                </>
            }
            <div className='flex flex-col justify-center items-center'>
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
