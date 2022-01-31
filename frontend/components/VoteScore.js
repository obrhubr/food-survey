import React from 'react';

export default function VoteScore(props) {
    return(
        <>
            <div className='px-5'>
                <div className='text-2xl my-10 text-center'>
                    As-tu aimé le menu d&apos;aujourd&apos;hui?
                </div>

                <div className='text-xl my-10 text-center bg-gray-200 rounded-lg p-5 shadow-md'>
                    {props.menu.name}
                </div>

                <div className='text-lg text-white my-5 mx-20 text-center'>
                    <div id='vote-1' onClick={props.setVote} className='bg-red-400 active:bg-red-500 rounded-lg p-3 shadow-md my-5 cursor-pointer'>
                        1 (pas aimé)
                    </div>
                    <div id='vote-2' onClick={props.setVote} className='bg-orange-400 active:bg-orange-500 rounded-lg p-3 shadow-md my-5 cursor-pointer'>
                        2
                    </div>
                    <div id='vote-3' onClick={props.setVote} className='bg-amber-400 active:bg-amber-500 rounded-lg p-3 shadow-md my-5 cursor-pointer'>
                        3
                    </div>
                    <div id='vote-4' onClick={props.setVote} className='bg-lime-400 active:bg-lime-500 rounded-lg p-3 shadow-md my-5 cursor-pointer'>
                        4
                    </div>
                    <div id='vote-5' onClick={props.setVote} className='bg-green-400 active:bg-green-500 rounded-lg p-3 shadow-md my-5 cursor-pointer'>
                        5 (beacoup aimé)
                    </div>
                </div>
            </div>
        </>
    );
}
