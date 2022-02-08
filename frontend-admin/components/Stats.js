import React from 'react';
import { useState, useEffect } from 'react';

export default function Stats(props) {
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
        <div>
            <div className='flex flex-col items-start justify-start mb-10'>
                <div className='flex flex-col items-start justify-start text-lg text-center mt-10 mb-5 w-full'>
                    <div className='w-full flex flex-col my-2 px-4 py-2'>
                        {props.results.results_all != undefined ?
                            props.results.results_all.map((e, i) => {
                                return (
                                    <div key={i} className='flex flex-row m-4'>
                                        <div className='text-left mx-2 px-2 w-full'>
                                            Total ({e.total} votes) for {e.name}: 
                                        </div>
                                        <div className='flex flex-row w-full mx-4'>
                                            <div className={'bg-red-' + matchingAvg(e.average, 1) + ' w-full rounded-l-lg py-4 px-10'}> </div>
                                            <div className={'bg-orange-' + matchingAvg(e.average, 2) + ' w-full py-4 px-10'}> </div>
                                            <div className={'bg-amber-' + matchingAvg(e.average, 3) + ' w-full py-4 px-10'}> </div>
                                            <div className={'bg-lime-' + matchingAvg(e.average, 4) + ' w-full py-4 px-10'}> </div>
                                            <div className={'bg-green-' + matchingAvg(e.average, 5) + ' w-full rounded-r-lg py-4 px-10'}> </div>
                                        </div>
                                        <div className='text-right'>
                                            {e.average}
                                        </div>
                                    </div>
                                )
                            })
                        :
                            <></>
                        }
                    </div>
                    <br></br>
                    <br></br>

                    <div className='flex items-center justify-center w-full'>
                        <div className='m-4 w-full flex justify-center items-center cursor-pointer flex justify-center mb-3 xl:w-96'>
                            <select value={props.menuName} onChange={props.handleMenuChange} className="form-select appearance-none block w-full px-3 py-1.5 text-base font-normal text-gray-700 bg-white bg-clip-padding bg-no-repeat border border-solid border-gray-300 rounded transition ease-in-out m-0 focus:text-gray-700 focus:bg-white focus:border-blue-600 focus:outline-none" aria-label="Default select example">
                                {props.menuNames.map((e, i) => {
                                    return (
                                        <option key={i} id={props.menuUuids[i]} value={e}>{e}</option>
                                    )
                                })}
                            </select>
                        </div>
                    </div>
                    <div className='flex flex-col justify-center items-center'>
                        {props.results.results_class != null && props.results.results_all.length > 0 && props.menuName != null && props.menuName != "" ?
                            props.results.results_class[props.menuUuid][0].class_avg.map((item, i) => {
                                return (
                                    <div key={i}>
                                        <div key={i} className='w-full flex flex-row my-2 px-4 py-2'>
                                            <div className='text-left mx-2 px-2 w-full'>
                                                Total for {getClassFromNumber(i+1)} ({props.results.results_class[props.menuUuid][0].class_total[i]} votes) for {props.menuName}: 
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
            </div>
            <div className=''>
                <div className='bg-red-200'> </div>
                <div className='bg-orange-200'> </div>
                <div className='bg-amber-200'> </div>
                <div className='bg-lime-200'> </div>
                <div className='bg-green-200'> </div>
            </div>
        </div>
    );
}
