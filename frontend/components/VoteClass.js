import React from 'react';

export default function VoteScore(props) {
    return(
        <>
            <div className='w-full'>
                <div className='text-2xl my-10 text-center w-full'>
                    En quelle classe es-tu?
                </div>

                <div className='text-lg text-black my-5 mx-2 text-center'>
                    <div id='class-1' onClick={props.setClass} className='bg-gray-200 active:bg-gray-300 rounded-lg p-3 shadow-md my-5 cursor-pointer'>
                        Terminale
                    </div>
                    <div id='class-2' onClick={props.setClass} className='bg-gray-200 active:bg-gray-300 rounded-lg p-3 shadow-md my-5 cursor-pointer'>
                        1ère
                    </div>
                    <div id='class-3' onClick={props.setClass} className='bg-gray-200 active:bg-gray-300 rounded-lg p-3 shadow-md my-5 cursor-pointer'>
                        2nde
                    </div>
                    <div id='class-4' onClick={props.setClass} className='bg-gray-200 active:bg-gray-300 rounded-lg p-3 shadow-md my-5 cursor-pointer'>
                        3ème
                    </div>
                    <div id='class-5' onClick={props.setClass} className='bg-gray-200 active:bg-gray-300 rounded-lg p-3 shadow-md my-5 cursor-pointer'>
                        4ème
                    </div>
                    <div id='class-6' onClick={props.setClass} className='bg-gray-200 active:bg-gray-300 rounded-lg p-3 shadow-md my-5 cursor-pointer'>
                        5ème
                    </div>
                    <div id='class-7' onClick={props.setClass} className='bg-gray-200 active:bg-gray-300 rounded-lg p-3 shadow-md my-5'>
                        6ème
                    </div>
                    <div id='class-8' onClick={props.setClass} className='bg-gray-200 active:bg-gray-300 rounded-lg p-3 shadow-md my-5'>
                        Personnel
                    </div>
                </div>
            </div>
        </>
    );
}
