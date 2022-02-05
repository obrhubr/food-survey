import React from 'react';
import { useState, useEffect } from 'react';

export default function MenuInput(props) {
	const [vegetarian, setVegetarian] = useState(props.vegetarian);
	const [menuName, setMenuName] = useState(props.name);

	function changeMenuName(event) {
		setMenuName(event.target.value);
        props.changeMenu(props.index, {name: event.target.value, vegetarian});
	}
	function changeVegetarian(event) {
		setVegetarian(event.target.checked);
        props.changeMenu(props.index, {name: menuName, vegetarian: event.target.checked});
	}

    return (
        <div className='w-full flex flex-row items-center justify-center'>
            <input className='my-2 w-64 appearance-none relative block px-3 py-1 mx-4 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm' type="text" placeholder='Lasagne Végétarienne...' value={menuName} onChange={changeMenuName}/>
            <label className="my-2 inline-flex items-center text-center px-3 py-1 mx-4 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md ">
                <input type="checkbox" className="form-checkbox h-5 w-5 text-green-600" checked={vegetarian} onChange={changeVegetarian}/><span className="ml-2 text-gray-700">Vegetarian</span>
            </label>
        </div>
    );
}
