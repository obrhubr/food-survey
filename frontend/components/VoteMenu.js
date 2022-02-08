import React from 'react';

export default function VoteMenu(props) {
    return(
        <>
            <div className='w-full'>
                <div className='text-2xl my-10 text-center w-full'>
                    Quel menu as-tu choisi?
                </div>

                <div className='text-lg text-black my-5 mx-2 text-center'>
                    {props.menus.map((e, i) => {
                        return (
                            <div key={i} id={e.uuid} onClick={props.setMenu} className='bg-gray-200 active:bg-gray-300 rounded-lg p-3 shadow-md my-5 cursor-pointer'>
                                {e.name}
                            </div>
                        )
                    })}
                </div>
            </div>
        </>
    );
}
