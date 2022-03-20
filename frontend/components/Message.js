import React from 'react';

export default function Message(props) {
    return(
        <>
            <div className='px-5'>
                <div className='text-2xl my-48 h-full text-center'>
                    {props.message.text}
                </div>
                <div onClick={props.acknowledgeMessage} className='text-lg my-48 h-full text-center rounded-md bg-blue-500 text-white p-4'>
                    Ok!
                </div>
            </div>
        </>
    );
}
