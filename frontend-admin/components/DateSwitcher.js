import React from 'react';
import { AiOutlineArrowLeft, AiOutlineArrowRight } from 'react-icons/ai';

function iso(d) {
    const ts = d;
    const date_ob = new Date(ts);
    const date = date_ob.getDate();
    const month = date_ob.getMonth() + 1;
    const year = date_ob.getFullYear();
    const iso_date = year + '-' + (month < 10 ? '0' + month : month) + '-' + date;
    return iso_date;
}

export default function DateSwitcher(props) {
    function changeDateForward() {
        props.setResultsLoaded(false);
        props.setMenusLoaded(false);

        var delayInMilliseconds = 500;
		setTimeout(function() {
            var nd = new Date(props.day);
            props.setDayState(iso(nd.setDate(nd.getDate() + 1)));
		}, delayInMilliseconds);
    }
    function changeDateBackward() {
        props.setResultsLoaded(false);
        props.setMenusLoaded(false);
        
        var delayInMilliseconds = 500;
		setTimeout(function() {
            var nd = new Date(props.day);
            props.setDayState(iso(nd.setDate(nd.getDate() - 1)));
		}, delayInMilliseconds);
    }

    return (
        <div className='mt-6 font-bold text-lg flex flex-row'>
            <div onClick={changeDateBackward} className='m-4'>
                <AiOutlineArrowLeft/>
            </div>
            <div className='mt-3'>
                {props.day}
            </div>
            <div onClick={changeDateForward} className='m-4'>
                <AiOutlineArrowRight/>
            </div>
        </div>
    );
}