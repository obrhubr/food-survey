import { useState, useEffect } from 'react';
import Header from '../components/Header';
import axios from 'axios';
import Error from '../components/Error';
import { useRouter } from 'next/router';
import { AiOutlineArrowUp, AiOutlineArrowDown } from 'react-icons/ai';

export default function Menu() {
    const router = useRouter();
	const [errorState, setErrorState] = useState("");

	const [ranking, setRanking] = useState([]);
    const [order, setOrder] = useState(true);

	const [strat, setStrat] = useState({name: "nw_avg", inverted: false, show_scale: true});
	const [strategy, setStrategy] = useState("nw_avg");
	function handleStratChange (event) {
		setStrategy(event.target.value);
        console.log(get_strat_attributes(event.target.value))
		setStrat(get_strat_attributes(event.target.value));
	}

	function changeSortOrder(event) {
		setOrder(!order);
	}

    useEffect(() => {
        // check if token is present
        if(document.cookie == '') {
            router.push('/');
        }

        const URL = process.env.NEXT_PUBLIC_API_PREFIX + '://' + process.env.NEXT_PUBLIC_API_HOST + ':' + process.env.NEXT_PUBLIC_API_PORT + '/results/ranking';
        axios.post(URL, {token: document.cookie.substring(6, document.cookie.length)}).then(async (res) => {
            setRanking(res.data.ranking.map(data => {return {"name": data.name, "day": data.day, "data": JSON.parse(data.jsondata)}}));
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
    }, [setRanking, router]);

    function get_strat_attributes(name) {
        if(name == "nw_avg") {
            return {name: "nw_avg", inverted: false, show_scale: true}

        } else if(name == "nw_least_negative") {
            return {name: "nw_least_negative", inverted: true, show_scale: false}

        } else if(name == "nw_median") {
            return {name: "nw_median", inverted: false, show_scale: true}

        } else if(name == "nw_most_positive") {
            return {name: "nw_most_positive", inverted: false, show_scale: false}

        } else if(name == "w_most_positive") {
            return {name: "w_most_positive", inverted: false, show_scale: false}

        } else if(name == "w_least_negative") {
            return {name: "w_least_negative", inverted: true, show_scale: false}

        } else if(name == "w_median") {
            return {name: "w_median", inverted: false, show_scale: true}

        } else if(name == "w_avg") {
            return {name: "w_avg", inverted: false, show_scale: true}
        }
    }

    function matchingAvg(avg, num) {
		return Math.round(avg) == num ? 400 : 200;
	}

    return (
		<>
            <Header></Header>
            <div className='flex flex-col justify-center items-center m-4'>
                {errorState != "" ?
                    <Error error={errorState}></Error>
                :
                    <div className='md:w-1/2 w-full'>
                        <div className='flex flex-row justify-center items-center'>
                            <div className='m-4 items-center cursor-pointer flex justify-center mb-3 xl:w-96'>
                                <select value={strategy} onChange={handleStratChange} className="form-select appearance-none block w-full px-3 py-1.5 text-base font-normal text-gray-700 bg-white bg-clip-padding bg-no-repeat border border-solid border-gray-300 rounded transition ease-in-out m-0 focus:text-gray-700 focus:bg-white focus:border-blue-600 focus:outline-none" aria-label="Default select example">
                                    <option value="nw_most_positive">Not weighted: Most positive</option>
                                    <option value="nw_least_negative">Not weighted: Least negative</option>
                                    <option value="nw_median">Not weighted: Median</option>
                                    <option value="nw_avg">Not weighted: Average</option>

                                    <option value="w_most_positive">Weighted: Most positive</option>
                                    <option value="w_least_negative">Weighted: Least negative</option>
                                    <option value="w_median">Weighted: Median</option>
                                    <option value="w_avg">Weighted: Average</option>
                                </select>
                            </div>
                            <div onClick={changeSortOrder} className='m-4 flex justify-center items-center cursor-pointer'>
                                {order ?
                                    <AiOutlineArrowDown/>
                                :    
                                    <AiOutlineArrowUp/>
                                }
                            </div>
                        </div>
                        <div className='flex flex-col w-full'>
                            {ranking.sort((f, s) => { if(strat.inverted ^ order) { return s.data[strat.name].total - f.data[strat.name].total } else { return f.data[strat.name].total - s.data[strat.name].total } }).map((item, i) => {
                                return(
                                    <div key={i} className='bg-gray-200 rounded-md p-2 m-2 flex flex-row'>
                                        <div className='flex-grow w-2/6 text-xl'>{i+1}. <a className='underline' rel="noreferrer" target="_blank" href={'/daystats/' + item.day}>{item.name}</a></div>
                                        {strat.show_scale ?
                                            <div className='w-3/6 flex flex-row'>
                                                <div className={'bg-red-' + matchingAvg(item.data[strat.name].total, 1) + ' w-full rounded-l-lg p-2'}> </div>
                                                <div className={'bg-orange-' + matchingAvg(item.data[strat.name].total, 2) + ' w-full p-2'}> </div>
                                                <div className={'bg-amber-' + matchingAvg(item.data[strat.name].total, 3) + ' w-full p-2'}> </div>
                                                <div className={'bg-lime-' + matchingAvg(item.data[strat.name].total, 4) + ' w-full p-2'}> </div>
                                                <div className={'bg-green-' + matchingAvg(item.data[strat.name].total, 5) + ' w-full rounded-r-lg p-2'}> </div>
                                            </div>
                                        :
                                            <></>
                                        }
                                        <div className='w-1/6 text-xl px-6 text-gray-400'>Score: {Math.round(item.data[strat.name].total * 10) / 10}</div>
                                    </div>
                                )
                            })}
                        </div>
                        
                        <div className='flex flex-row w-full my-4'>
                            <div className='bg-red-200 bg-orange-200 bg-amber-200 bg-lime-200 bg-green-200'> </div>
                            <div className='bg-red-400 bg-orange-400 bg-amber-400 bg-lime-400 bg-green-400'> </div>
                        </div>
                    </div>
                }
            </div>
        </>
    )
}
